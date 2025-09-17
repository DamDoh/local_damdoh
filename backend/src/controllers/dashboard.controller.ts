import { Request, Response } from 'express';
import { Farm } from '../models/farm.model';
import { User } from '../models/user.model';
import { Listing } from '../models/marketplace.model';
import { logger } from '../utils/logger';

export class DashboardController {
  async getFarmerDashboardData(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      
      // Get user's farms
      const farms = await Farm.find({ owner: userId, active: true });
      
      // Calculate farm count
      const farmCount = farms.length;
      
      // Calculate crop count and get recent crops
      let cropCount = 0;
      const recentCrops: any[] = [];
      
      farms.forEach(farm => {
        cropCount += farm.crops.length;
        // Get recent crops (last 5)
        farm.crops.slice(-5).forEach(crop => {
          recentCrops.push({
            id: `${farm._id}-${crop.name}`,
            name: crop.name,
            stage: crop.status,
            farmName: farm.name,
            farmId: farm._id,
            plantingDate: crop.plantingDate
          });
        });
      });
      
      // Get KNF batches (using listings as a placeholder)
      const knfBatches = await Listing.find({ 
        seller: userId,
        category: 'KNF_INPUT'
      }).limit(5);
      
      const knfBatchesFormatted = knfBatches.map(batch => ({
        id: batch._id,
        typeName: batch.title,
        status: batch.status,
        nextStepDate: batch.expiryDate
      }));
      
      // Get certifications from farms
      const certifications: any[] = [];
      farms.forEach(farm => {
        if (farm.certifications) {
          farm.certifications.forEach(cert => {
            certifications.push({
              id: `${farm._id}-${cert.name}`,
              name: cert.name,
              issuingBody: cert.issuedBy
            });
          });
        }
      });
      
      // Create financial summary (placeholder)
      const financialSummary = {
        totalIncome: 0,
        totalExpenses: 0,
        netFlow: 0,
        pendingPayments: 0
      };
      
      // Create alerts (placeholder)
      const alerts: any[] = [];
      
      const dashboardData = {
        farmCount,
        cropCount,
        recentCrops,
        knfBatches: knfBatchesFormatted,
        financialSummary,
        alerts,
        certifications
      };
      
      res.json(dashboardData);
    } catch (error) {
      logger.error('Error fetching farmer dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch farmer dashboard data' });
    }
  }
  
  async getBuyerDashboardData(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      // Get supply chain risk data (placeholder)
      const supplyChainRisk = {
        level: 'Medium',
        factor: 'Weather disruption',
        region: 'East Africa',
        action: {
          link: '/network'
        }
      };

      // Get sourcing recommendations (placeholder)
      const sourcingRecommendations = [
        {
          id: '1',
          name: 'Green Valley Farms',
          product: 'Organic Coffee Beans',
          reliability: 85,
          vtiVerified: true
        },
        {
          id: '2',
          name: 'Mountain Ridge Estate',
          product: 'Premium Tea Leaves',
          reliability: 92,
          vtiVerified: true
        },
        {
          id: '3',
          name: 'Sunset Orchards',
          product: 'Fresh Mangoes',
          reliability: 78,
          vtiVerified: false
        }
      ];

      // Get market price intelligence (placeholder)
      const marketPriceIntelligence = {
        product: 'Coffee',
        trend: 'up',
        forecast: 'Prices expected to rise 15% in Q4',
        action: {
          link: '/marketplace'
        }
      };

      const dashboardData = {
        supplyChainRisk,
        sourcingRecommendations,
        marketPriceIntelligence
      };

      res.json(dashboardData);
    } catch (error) {
      logger.error('Error fetching buyer dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch buyer dashboard data' });
    }
  }

  async getUserEngagementStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      // Placeholder engagement stats data
      const engagementStats = {
        profileViews: Math.floor(Math.random() * 100) + 50, // Random between 50-150
        postLikes: Math.floor(Math.random() * 50) + 20, // Random between 20-70
        postComments: Math.floor(Math.random() * 30) + 10 // Random between 10-40
      };

      res.json(engagementStats);
    } catch (error) {
      logger.error('Error fetching user engagement stats:', error);
      res.status(500).json({ error: 'Failed to fetch user engagement stats' });
    }
  }

  async getTrustScore(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Placeholder trust score data
      const trustScoreData = {
        score: 750,
        breakdown: [
          {
            name: 'Character' as const,
            score: 80,
            weight: 100,
            factors: ['Payment history', 'Contract fulfillment']
          },
          {
            name: 'Capacity' as const,
            score: 70,
            weight: 100,
            factors: ['Current debt ratio', 'Income stability']
          },
          {
            name: 'Capital' as const,
            score: 85,
            weight: 100,
            factors: ['Asset value', 'Savings']
          },
          {
            name: 'Collateral' as const,
            score: 75,
            weight: 100,
            factors: ['Land ownership', 'Equipment value']
          },
          {
            name: 'Conditions' as const,
            score: 90,
            weight: 100,
            factors: ['Market conditions', 'Seasonal factors']
          }
        ]
      };

      res.json(trustScoreData);
    } catch (error) {
      logger.error('Error fetching trust score:', error);
      res.status(500).json({ error: 'Failed to fetch trust score' });
    }
  }
}