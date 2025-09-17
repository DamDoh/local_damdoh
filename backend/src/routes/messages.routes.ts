import express from 'express';
import { MessagesController } from '../controllers/messages.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const messagesController = new MessagesController();

/**
 * @swagger
 * /api/messages/conversation:
 *   post:
 *     tags: [Messages]
 *     summary: Get or create a conversation
 *     description: Get an existing conversation or create a new one between two users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: ID of the user to start conversation with
 *     responses:
 *       200:
 *         description: Conversation retrieved or created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversationId:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/conversation', requireAuth(), messagesController.getOrCreateConversation);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Get user conversations
 *     description: Get all conversations for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       participant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 *                       lastMessage:
 *                         type: string
 *                       lastMessageTimestamp:
 *                         type: string
 *                       unreadCount:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations', requireAuth(), messagesController.getConversationsForUser);

/**
 * @swagger
 * /api/messages/conversation/{conversationId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get messages for conversation
 *     description: Get all messages in a specific conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       conversationId:
 *                         type: string
 *                       senderId:
 *                         type: string
 *                       content:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       readBy:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a participant in this conversation
 *       404:
 *         description: Conversation not found
 */
router.get('/conversation/:conversationId', requireAuth(), messagesController.getMessagesForConversation);

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message
 *     description: Send a new message to a conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - content
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messageId:
 *                   type: string
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     conversationId:
 *                       type: string
 *                     senderId:
 *                       type: string
 *                     content:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a participant in this conversation
 *       404:
 *         description: Conversation not found
 */
router.post('/send', requireAuth(), messagesController.sendMessage);

/**
 * @swagger
 * /api/messages/conversation/{conversationId}/read:
 *   post:
 *     tags: [Messages]
 *     summary: Mark messages as read
 *     description: Mark all messages in a conversation as read for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a participant in this conversation
 *       404:
 *         description: Conversation not found
 */
router.post('/conversation/:conversationId/read', requireAuth(), messagesController.markMessagesAsRead);

export default router;