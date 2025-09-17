import { Request, Response } from 'express';
import {
  CarbonFootprintData,
  EmissionFactor,
  SustainablePractice,
  Certification,
  EmissionFactorType,
  EmissionUnit
} from '../models/sustainability.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class SustainabilityController {
  private async getEmissionFactor(criteria: {
    region: string;
    activityType: string;
    inputType?: string;
    factorType?: string;
  }): Promise<any | null> {
    try {
      logger.info('Fetching emission factor for criteria:', criteria);

      const query: any = {
        region: criteria.region,
        activityType: criteria.activityType,
        isActive: true,
      };

      if (criteria.inputType) {
        query.inputType = criteria.inputType;
      }

      if (criteria.factorType) {
        query.factorType = criteria.factorType;
      }

      const emissionFactor = await EmissionFactor.findOne(query)
        .sort({ year: -1 }) // Get the most recent factor
        .lean();

      if (emissionFactor) {
        logger.info('Emission factor found:', emissionFactor);
        return emissionFactor;
      }

      // Fallback to global factors if region-specific not found
      if (criteria.region !== 'Global') {
        const globalFactor = await EmissionFactor.findOne({
          ...query,
          region: 'Global',
        })
          .sort({ year: -1 })
          .lean();

        if (globalFactor) {
          logger.info('Global emission factor found as fallback:', globalFactor);
          return globalFactor;
        }
      }

      logger.warn('No emission factor found for criteria:', criteria);
      return null;
    } catch (error) {
      logger.error('Error fetching emission factor:', error);
      return null;
    }
  }

  private async getRegionForCalculation(data: any): Promise<string> {
    try {
      // Try to get region from user profile
      if (data.userRef || data.actorRef) {
        const userId = data.userRef || data.actorRef;
        const user = await User.findById(userId).lean();

        if (user?.location?.coordinates) {
          // In a real implementation, you would use reverse geocoding
          // to determine the region from coordinates
          // For now, return a default region
          return 'Global';
        }
      }

      return 'Global';
    } catch (error) {
      logger.error('Error determining region for calculation:', error);
      return 'Global';
    }
  }

  async calculateCarbonFootprint(req: Request, res: Response) {
    try {
      const { eventId, eventData } = req.body;

      if (!eventId || !eventData) {
        return res.status(400).json({ error: 'Event ID and event data are required' });
      }

      const relevantEventTypes = ['INPUT_APPLIED', 'TRANSPORTED'];
      const eventType = eventData.eventType;

      if (!eventType || !relevantEventTypes.includes(eventType)) {
        logger.info(`Event type '${eventType}' is not relevant for carbon footprint calculation. Skipping.`);
        return res.json({ message: 'Event type not relevant for carbon footprint calculation' });
      }

      const vtiId = eventData.vtiId || null;
      const userRef = eventData.userRef || eventData.actorRef || null;

      if (!userRef) {
        return res.status(400).json({ error: 'User reference is required' });
      }

      try {
        if (eventType === 'INPUT_APPLIED' &&
            eventData.payload?.inputType &&
            eventData.payload?.quantity &&
            eventData.payload?.unit) {

          const { inputType, quantity, unit } = eventData.payload;
          logger.info(`Processing INPUT_APPLIED event for input type ${inputType}, quantity ${quantity} ${unit}`);

          const region = await this.getRegionForCalculation(eventData);
          const emissionFactor = await this.getEmissionFactor({
            region: region || 'Global',
            activityType: EmissionFactorType.INPUT_APPLIED,
            inputType: inputType,
            factorType: unit,
          });

          if (emissionFactor) {
            const calculatedEmissions = quantity * emissionFactor.value;
            const emissionsUnit = emissionFactor.unit;

            const carbonData = new CarbonFootprintData({
              vtiId,
              user: userRef,
              eventType,
              timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date(),
              calculatedEmissions,
              unit: emissionsUnit,
              emissionFactorUsed: {
                factorId: emissionFactor._id,
                value: emissionFactor.value,
                unit: emissionFactor.unit,
                source: emissionFactor.source,
              },
              dataSource: 'traceability_event',
              region,
              details: eventData.payload,
              category: 'Agriculture',
              subcategory: 'Input Application',
            });

            await carbonData.save();

            logger.info(`Carbon footprint calculated and stored for event/${eventId}. Emissions: ${calculatedEmissions} ${emissionsUnit}`);

            return res.json({
              success: true,
              message: 'Carbon footprint calculated successfully',
              emissions: calculatedEmissions,
              unit: emissionsUnit,
              carbonDataId: carbonData._id,
            });
          } else {
            logger.warn(`Emission factor not found for INPUT_APPLIED event type '${inputType}' in region '${region}'.`);
            return res.json({
              message: 'Emission factor not found for this input type and region'
            });
          }
        } else if (eventType === 'TRANSPORTED' &&
                   eventData.payload?.distance &&
                   eventData.payload?.transport_mode) {
          logger.info('Processing TRANSPORTED event (calculation not implemented yet).');
          return res.json({
            message: 'TRANSPORTED event processing not yet implemented'
          });
        } else {
          logger.info(`Event type '${eventType}' is relevant but detailed calculation not implemented yet.`);
          return res.json({
            message: 'Event type processing not yet implemented'
          });
        }
      } catch (error) {
        logger.error(`Error calculating carbon footprint for event/${eventId}:`, error);
        return res.status(500).json({ error: 'Failed to calculate carbon footprint' });
      }
    } catch (error) {
      logger.error('Error in calculateCarbonFootprint:', error);
      res.status(500).json({ error: 'Failed to process carbon footprint calculation' });
    }
  }

  async getSustainabilityDashboardData(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { period } = req.query; // 'month', 'quarter', 'year'

      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'quarter':
          startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
          break;
        case 'year':
          startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
          break;
        case 'month':
        default:
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
      }

      // Aggregate carbon footprint data
      const carbonData = await CarbonFootprintData.aggregate([
        {
          $match: {
            user: userId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalEmissions: { $sum: '$calculatedEmissions' },
            count: { $sum: 1 },
            avgEmissions: { $avg: '$calculatedEmissions' },
            categories: {
              $push: '$category'
            }
          }
        }
      ]);

      const carbonStats = carbonData[0] || {
        totalEmissions: 0,
        count: 0,
        avgEmissions: 0,
        categories: []
      };

      // Get previous period for trend calculation
      const prevPeriodStart = new Date(startDate.getTime() - (startDate.getTime() - (period === 'year' ? new Date(now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000)) : period === 'quarter' ? new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)) : new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000))).getTime()));

      const prevCarbonData = await CarbonFootprintData.aggregate([
        {
          $match: {
            user: userId,
            timestamp: { $gte: prevPeriodStart, $lt: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalEmissions: { $sum: '$calculatedEmissions' }
          }
        }
      ]);

      const prevTotal = prevCarbonData[0]?.totalEmissions || 0;
      const currentTotal = carbonStats.totalEmissions;
      const trend = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

      // Get sustainable practices
      const practices = await SustainablePractice.find({
        user: userId,
        isActive: true
      })
        .sort({ lastLogged: -1 })
        .limit(10)
        .lean();

      // Get certifications
      const certifications = await Certification.find({
        user: userId,
        status: { $in: ['Active', 'Pending'] }
      })
        .sort({ expiryDate: 1 })
        .lean();

      // Mock water usage and biodiversity data (would be calculated from actual data)
      const waterUsage = {
        efficiency: Math.floor(Math.random() * 20) + 75, // 75-95%
        unit: '% efficiency',
        trend: (Math.random() - 0.5) * 10, // -5 to +5
      };

      const biodiversityScore = {
        score: (Math.random() * 3) + 6, // 6-9
        unit: '/ 10',
        trend: (Math.random() - 0.3) * 2, // -0.6 to +1.4
      };

      res.json({
        carbonFootprint: {
          total: Math.round(currentTotal * 100) / 100,
          unit: 'kg CO2e',
          trend: Math.round(trend * 100) / 100,
          count: carbonStats.count,
        },
        waterUsage,
        biodiversityScore,
        sustainablePractices: practices.map(p => ({
          id: p._id,
          practice: p.practice,
          lastLogged: p.lastLogged.toISOString(),
          category: p.category,
          impact: p.impact,
        })),
        certifications: certifications.map(c => ({
          id: c._id,
          name: c.name,
          status: c.status,
          expiry: c.expiryDate?.toISOString(),
          issuingBody: c.issuingBody,
          category: c.category,
        })),
        period: {
          start: startDate.toISOString(),
          end: now.toISOString(),
          type: period || 'month',
        }
      });
    } catch (error) {
      logger.error('Error fetching sustainability dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch sustainability dashboard data' });
    }
  }

  async addSustainablePractice(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { practice, description, category, frequency, impact } = req.body;

      if (!practice || !category) {
        return res.status(400).json({ error: 'Practice name and category are required' });
      }

      const sustainablePractice = new SustainablePractice({
        user: userId,
        practice,
        description,
        category,
        frequency,
        impact,
        lastLogged: new Date(),
      });

      await sustainablePractice.save();

      res.status(201).json({
        success: true,
        message: 'Sustainable practice added successfully',
        practice: sustainablePractice
      });
    } catch (error) {
      logger.error('Error adding sustainable practice:', error);
      res.status(500).json({ error: 'Failed to add sustainable practice' });
    }
  }

  async getSustainablePractices(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { category, active = true } = req.query;

      const query: any = { user: userId };

      if (active !== undefined) {
        query.isActive = active === 'true';
      }

      if (category) {
        query.category = category;
      }

      const practices = await SustainablePractice.find(query)
        .sort({ lastLogged: -1 })
        .lean();

      res.json({ practices });
    } catch (error) {
      logger.error('Error fetching sustainable practices:', error);
      res.status(500).json({ error: 'Failed to fetch sustainable practices' });
    }
  }

  async addCertification(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { name, issuingBody, certificationNumber, issueDate, expiryDate, category } = req.body;

      if (!name || !issuingBody || !category) {
        return res.status(400).json({ error: 'Name, issuing body, and category are required' });
      }

      const certification = new Certification({
        user: userId,
        name,
        issuingBody,
        certificationNumber,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        category,
      });

      await certification.save();

      res.status(201).json({
        success: true,
        message: 'Certification added successfully',
        certification
      });
    } catch (error) {
      logger.error('Error adding certification:', error);
      res.status(500).json({ error: 'Failed to add certification' });
    }
  }

  async getCertifications(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { status, category } = req.query;

      const query: any = { user: userId };

      if (status) {
        query.status = status;
      }

      if (category) {
        query.category = category;
      }

      const certifications = await Certification.find(query)
        .sort({ expiryDate: 1 })
        .lean();

      res.json({ certifications });
    } catch (error) {
      logger.error('Error fetching certifications:', error);
      res.status(500).json({ error: 'Failed to fetch certifications' });
    }
  }
}