import { Request, Response } from 'express';
import { ApiKey, ApiKeyEnvironment, ApiKeyStatus } from '../models/api-key.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';
import { randomBytes } from 'crypto';

export class ApiKeyController {
  private async checkAgriTechAuth(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'EXPERT') { // Using EXPERT as Agri-Tech Innovator equivalent
      throw new Error('Access denied. Only Agri-Tech Innovators can manage API keys.');
    }

    return userId;
  }

  async generateApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { description, environment } = req.body;

      // Check Agri-Tech Innovator role
      try {
        await this.checkAgriTechAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      // Validate input
      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return res.status(400).json({ error: 'Description is required' });
      }

      if (!environment || !['Sandbox', 'Production'].includes(environment)) {
        return res.status(400).json({ error: 'Invalid environment. Must be Sandbox or Production' });
      }

      // Generate API key
      const keyPrefix = `damdoh_${environment.substring(0, 4).toLowerCase()}`;
      const secret = randomBytes(24).toString('hex');
      const fullKey = `${keyPrefix}_${secret}`;

      // Check for duplicate key (very unlikely but good practice)
      const existingKey = await ApiKey.findOne({
        keyPrefix: `${keyPrefix}_...`,
        lastFour: secret.slice(-4)
      });

      if (existingKey) {
        return res.status(409).json({ error: 'API key collision. Please try again.' });
      }

      // Create API key record
      const apiKey = new ApiKey({
        user: userId,
        description: description.trim(),
        environment: environment as ApiKeyEnvironment,
        keyPrefix: `${keyPrefix}_...`,
        lastFour: secret.slice(-4),
        // TODO: In production, store hashed version of the full key
        // hashedKey: await bcrypt.hash(fullKey, 12),
      });

      await apiKey.save();

      res.json({
        success: true,
        message: 'API Key generated successfully. Please copy it now, you will not be able to see it again.',
        key: fullKey,
        id: apiKey._id,
        description: apiKey.description,
        environment: apiKey.environment,
        status: apiKey.status,
        keyPrefix: apiKey.keyPrefix,
        lastFour: apiKey.lastFour,
        createdAt: apiKey.createdAt.toISOString(),
      });
    } catch (error) {
      logger.error('Error generating API key:', error);
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  }

  async getApiKeys(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      // Check Agri-Tech Innovator role
      try {
        await this.checkAgriTechAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      const { environment, status, page = 1, limit = 50 } = req.query;

      const query: any = { user: userId };

      if (environment) {
        query.environment = environment;
      }

      if (status) {
        query.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const apiKeys = await ApiKey.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await ApiKey.countDocuments(query);

      const formattedKeys = apiKeys.map(key => ({
        id: key._id,
        description: key.description,
        environment: key.environment,
        status: key.status,
        keyPrefix: key.keyPrefix,
        lastFour: key.lastFour,
        displayKey: `${key.keyPrefix}${key.lastFour}`,
        usageCount: key.usageCount,
        lastUsedAt: key.lastUsedAt?.toISOString(),
        expiresAt: key.expiresAt?.toISOString(),
        createdAt: key.createdAt.toISOString(),
        updatedAt: key.updatedAt.toISOString(),
      }));

      res.json({
        keys: formattedKeys,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching API keys:', error);
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  }

  async revokeApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { keyId } = req.params;

      if (!keyId) {
        return res.status(400).json({ error: 'API Key ID is required' });
      }

      // Check Agri-Tech Innovator role
      try {
        await this.checkAgriTechAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      // Find and update the API key
      const apiKey = await ApiKey.findOneAndUpdate(
        { _id: keyId, user: userId },
        {
          status: ApiKeyStatus.REVOKED,
          revokedAt: new Date(),
          revokedBy: userId,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }

      res.json({
        success: true,
        message: 'API Key has been revoked successfully',
        keyId: apiKey._id,
        revokedAt: apiKey.revokedAt?.toISOString(),
      });
    } catch (error) {
      logger.error('Error revoking API key:', error);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  }

  async updateApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { keyId } = req.params;
      const { description, expiresAt } = req.body;

      if (!keyId) {
        return res.status(400).json({ error: 'API Key ID is required' });
      }

      // Check Agri-Tech Innovator role
      try {
        await this.checkAgriTechAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      const updateData: any = { updatedAt: new Date() };

      if (description !== undefined) {
        updateData.description = description.trim();
      }

      if (expiresAt !== undefined) {
        updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }

      const updatedKey = await ApiKey.findOneAndUpdate(
        { _id: keyId, user: userId },
        updateData,
        { new: true }
      );

      if (!updatedKey) {
        return res.status(404).json({ error: 'API key not found' });
      }

      res.json({
        success: true,
        message: 'API Key updated successfully',
        key: {
          id: updatedKey._id,
          description: updatedKey.description,
          environment: updatedKey.environment,
          status: updatedKey.status,
          expiresAt: updatedKey.expiresAt?.toISOString(),
          updatedAt: updatedKey.updatedAt.toISOString(),
        }
      });
    } catch (error) {
      logger.error('Error updating API key:', error);
      res.status(500).json({ error: 'Failed to update API key' });
    }
  }

  async deleteApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { keyId } = req.params;

      if (!keyId) {
        return res.status(400).json({ error: 'API Key ID is required' });
      }

      // Check Agri-Tech Innovator role
      try {
        await this.checkAgriTechAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      const deletedKey = await ApiKey.findOneAndDelete({
        _id: keyId,
        user: userId
      });

      if (!deletedKey) {
        return res.status(404).json({ error: 'API key not found' });
      }

      res.json({
        success: true,
        message: 'API Key deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting API key:', error);
      res.status(500).json({ error: 'Failed to delete API key' });
    }
  }

  async getApiKeyStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      // Check Agri-Tech Innovator role
      try {
        await this.checkAgriTechAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      const stats = await ApiKey.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
              }
            },
            revoked: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Revoked'] }, 1, 0]
              }
            },
            expired: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Expired'] }, 1, 0]
              }
            },
            sandbox: {
              $sum: {
                $cond: [{ $eq: ['$environment', 'Sandbox'] }, 1, 0]
              }
            },
            production: {
              $sum: {
                $cond: [{ $eq: ['$environment', 'Production'] }, 1, 0]
              }
            },
            totalUsage: { $sum: '$usageCount' },
            recentlyUsed: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$lastUsedAt', null] },
                      { $gte: ['$lastUsedAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        active: 0,
        revoked: 0,
        expired: 0,
        sandbox: 0,
        production: 0,
        totalUsage: 0,
        recentlyUsed: 0
      };

      res.json({
        stats: {
          totalKeys: result.total,
          activeKeys: result.active,
          revokedKeys: result.revoked,
          expiredKeys: result.expired,
          sandboxKeys: result.sandbox,
          productionKeys: result.production,
          totalUsage: result.totalUsage,
          recentlyUsedKeys: result.recentlyUsed,
        }
      });
    } catch (error) {
      logger.error('Error fetching API key stats:', error);
      res.status(500).json({ error: 'Failed to fetch API key statistics' });
    }
  }
}