import { Request, Response } from 'express';
import { Conversation, Message, IConversation, IMessage } from '../models/messages.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class MessagesController {
  async getOrCreateConversation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { recipientId } = req.body;

      if (!recipientId) {
        return res.status(400).json({ error: 'Recipient ID is required' });
      }

      if (userId === recipientId) {
        return res.status(400).json({ error: 'Cannot create a conversation with yourself' });
      }

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Sort participant IDs to create consistent conversation ID
      const participantIds = [userId, recipientId].sort();

      // Try to find existing conversation
      let conversation = await Conversation.findOne({
        participantIds: { $all: participantIds, $size: 2 }
      });

      if (!conversation) {
        // Get user profiles
        const currentUser = await User.findById(userId);
        if (!currentUser) {
          return res.status(404).json({ error: 'Current user not found' });
        }

        // Create new conversation
        conversation = new Conversation({
          participantIds,
          participantInfo: {
            [userId]: {
              displayName: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
            },
            [recipientId]: {
              displayName: recipient.name,
              avatarUrl: recipient.avatarUrl,
            },
          },
          lastMessage: 'Conversation started.',
          lastMessageTimestamp: new Date(),
          unreadCount: {},
        });

        await conversation.save();
      }

      res.json({ conversationId: conversation._id });
    } catch (error) {
      logger.error('Error getting or creating conversation:', error);
      res.status(500).json({ error: 'Failed to get or create conversation' });
    }
  }

  async getConversationsForUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      const conversations = await Conversation.find({
        participantIds: userId
      })
      .sort({ lastMessageTimestamp: -1 })
      .populate('participantIds', 'name avatarUrl');

      const formattedConversations = conversations.map(conversation => {
        const otherParticipantId = conversation.participantIds.find(
          (id: any) => id._id.toString() !== userId
        );

        const otherParticipantInfo = (conversation.participantInfo as any)?.[otherParticipantId?._id.toString() || ''];

        return {
          id: conversation._id,
          participant: {
            id: otherParticipantId?._id,
            name: otherParticipantInfo?.displayName || 'Unknown User',
            avatarUrl: otherParticipantInfo?.avatarUrl || null,
          },
          lastMessage: conversation.lastMessage,
          lastMessageTimestamp: conversation.lastMessageTimestamp.toISOString(),
          unreadCount: (conversation.unreadCount as any)?.[userId] || 0,
        };
      });

      res.json({ conversations: formattedConversations });
    } catch (error) {
      logger.error('Error fetching conversations for user:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  async getMessagesForConversation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: 'Conversation ID is required' });
      }

      // Check if user is participant in conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const isParticipant = conversation.participantIds.some(
        (id: any) => id.toString() === userId
      );

      if (!isParticipant) {
        return res.status(403).json({ error: 'You are not a participant in this conversation' });
      }

      const messages = await Message.find({ conversation: conversationId })
        .sort({ timestamp: 1 })
        .populate('sender', 'name avatarUrl');

      const formattedMessages = messages.map(message => ({
        id: message._id,
        conversationId: conversationId,
        senderId: message.sender._id,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        readBy: message.readBy,
      }));

      res.json({ messages: formattedMessages });
    } catch (error) {
      logger.error('Error fetching messages for conversation:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { conversationId, content } = req.body;

      if (!conversationId || !content) {
        return res.status(400).json({ error: 'Conversation ID and content are required' });
      }

      // Check if user is participant in conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const isParticipant = conversation.participantIds.some(
        (id: any) => id.toString() === userId
      );

      if (!isParticipant) {
        return res.status(403).json({ error: 'You are not a participant in this conversation' });
      }

      // Create new message
      const message = new Message({
        conversation: conversationId,
        sender: userId,
        content: content.trim(),
        timestamp: new Date(),
        readBy: [userId], // Mark as read by sender
      });

      await message.save();

      res.json({
        success: true,
        messageId: message._id,
        message: {
          id: message._id,
          conversationId,
          senderId: userId,
          content: message.content,
          timestamp: message.timestamp.toISOString(),
        }
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  async markMessagesAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: 'Conversation ID is required' });
      }

      // Check if user is participant in conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const isParticipant = conversation.participantIds.some(
        (id: any) => id.toString() === userId
      );

      if (!isParticipant) {
        return res.status(403).json({ error: 'You are not a participant in this conversation' });
      }

      // Mark all unread messages as read for this user
      await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: userId },
          readBy: { $ne: userId }
        },
        { $push: { readBy: userId } }
      );

      // Reset unread count for this user
      const unreadCount = { ...conversation.unreadCount };
      delete unreadCount[userId];

      await Conversation.findByIdAndUpdate(conversationId, { unreadCount });

      res.json({ success: true });
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }
}