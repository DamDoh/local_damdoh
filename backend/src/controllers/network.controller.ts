import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

interface SuggestedConnectionsInput {
  userId: string;
  count: number;
  language: string;
}

interface SuggestedConnectionsOutput {
  suggestions: Array<{
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    reason?: string;
  }>;
}

export class NetworkController {
  async sendConnectionRequest(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { recipientId } = req.body;
      if (!recipientId) {
        return res.status(400).json({ error: 'Recipient ID is required' });
      }

      const senderId = (req.user as any).userId || (req.user as any).id;

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // In a real app, you would create a connection request in the database
      // For now, we'll just return a success response
      logger.info(`Connection request sent from ${senderId} to ${recipientId}`);

      res.json({
        success: true,
        message: 'Connection request sent successfully'
      });
    } catch (error) {
      logger.error('Error sending connection request:', error);
      res.status(500).json({ error: 'Failed to send connection request' });
    }
  }

  async suggestConnections(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const input: SuggestedConnectionsInput = req.body;
      const { count = 3 } = input;

      // Get current user
      const currentUserId = (req.user as any).userId || (req.user as any).id;
      const currentUser = await User.findById(currentUserId);

      if (!currentUser) {
        return res.status(404).json({ error: 'Current user not found' });
      }

      // Get random users as suggestions (excluding current user)
      const suggestions = await User.aggregate([
        { $match: { _id: { $ne: currentUser._id }, active: true } },
        { $sample: { size: count } },
        {
          $project: {
            id: '$_id',
            name: '$name',
            role: '$role',
            avatarUrl: '$avatarUrl'
          }
        }
      ]);

      // Add reasons for suggestions
      const suggestionsWithReasons = suggestions.map(suggestion => ({
        ...suggestion,
        reason: this.generateSuggestionReason(currentUser.role, suggestion.role)
      }));

      const output: SuggestedConnectionsOutput = {
        suggestions: suggestionsWithReasons
      };

      res.json(output);
    } catch (error) {
      logger.error('Error suggesting connections:', error);
      res.status(500).json({ error: 'Failed to suggest connections' });
    }
  }

  private generateSuggestionReason(currentUserRole: string, suggestedUserRole: string): string {
    const reasons = [
      "Based on your shared interests in agriculture",
      "Complementary roles in the supply chain",
      "Located in your region",
      "Active in similar agricultural activities",
      "Potential collaboration opportunities"
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  }
}