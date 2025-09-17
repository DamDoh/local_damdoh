import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { VtiRegistry, TraceabilityEvent, VtiStatus, TraceabilityEventType, IVtiRegistry, ITraceabilityEvent } from '../models/traceability.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class TraceabilityController {
  async generateVTI(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { type, linkedVtis = [], metadata = {} } = req.body;

      if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'Type parameter is required and must be a string' });
      }

      const vtiId = uuidv4();

      const vti = new VtiRegistry({
        vtiId,
        type,
        linkedVtis,
        metadata: { ...metadata, carbon_footprint_kgCO2e: 0 },
        isPublicTraceable: true,
      });

      await vti.save();

      res.json({ vtiId, status: 'success' });
    } catch (error) {
      logger.error('Error generating VTI:', error);
      res.status(500).json({ error: 'Failed to generate VTI' });
    }
  }

  async logTraceEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { vtiId, eventType, actorRef, geoLocation, payload = {}, farmFieldId } = req.body;

      if ((!farmFieldId && !vtiId) || !eventType || !actorRef) {
        return res.status(400).json({
          error: 'Either farmFieldId or vtiId, eventType, and actorRef are required'
        });
      }

      // Validate geoLocation if provided
      if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
        return res.status(400).json({ error: 'Invalid geoLocation format' });
      }

      // Check if VTI exists if provided
      if (vtiId) {
        const vti = await VtiRegistry.findOne({ vtiId });
        if (!vti) {
          return res.status(404).json({ error: `VTI with ID ${vtiId} not found` });
        }
      }

      const event = new TraceabilityEvent({
        vtiId: vtiId || undefined,
        farmFieldId: farmFieldId || undefined,
        eventType,
        actorRef,
        geoLocation: geoLocation || undefined,
        payload,
        isPublicTraceable: false,
      });

      await event.save();

      res.json({
        status: 'success',
        message: `Event ${eventType} logged successfully for ${farmFieldId || vtiId}`
      });
    } catch (error) {
      logger.error('Error logging trace event:', error);
      res.status(500).json({ error: 'Failed to log trace event' });
    }
  }

  async handleHarvestEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const user = await User.findById(userId);

      if (!user || (user.role !== 'FARMER' && user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Only farmers or admins can log harvest events' });
      }

      const { farmFieldId, cropType, yieldKg, qualityGrade, actorVtiId, geoLocation } = req.body;

      if (!farmFieldId || !cropType || !actorVtiId) {
        return res.status(400).json({ error: 'farmFieldId, cropType, and actorVtiId are required' });
      }

      // Generate VTI for the harvest
      const vtiId = uuidv4();
      const vti = new VtiRegistry({
        vtiId,
        type: 'farm_batch',
        metadata: {
          cropType,
          initialYieldKg: yieldKg,
          initialQualityGrade: qualityGrade,
          farmFieldId,
        },
        isPublicTraceable: true,
      });

      await vti.save();

      // Log the HARVESTED event
      const event = new TraceabilityEvent({
        vtiId,
        eventType: TraceabilityEventType.HARVESTED,
        actorRef: actorVtiId,
        geoLocation: geoLocation || undefined,
        payload: { yieldKg, qualityGrade },
        farmFieldId,
        isPublicTraceable: false,
      });

      await event.save();

      res.json({
        status: 'success',
        message: `Harvest event logged and VTI ${vtiId} created.`,
        vtiId,
      });
    } catch (error) {
      logger.error('Error handling harvest event:', error);
      res.status(500).json({ error: 'Failed to handle harvest event' });
    }
  }

  async handleInputApplicationEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const user = await User.findById(userId);

      if (!user || (user.role !== 'FARMER' && user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Only farmers or admins can log input application events' });
      }

      const {
        farmFieldId,
        inputId,
        applicationDate,
        quantity,
        unit,
        method,
        actorVtiId,
        geoLocation,
      } = req.body;

      if (!farmFieldId || !inputId || !applicationDate || quantity === undefined || !unit || !actorVtiId) {
        return res.status(400).json({
          error: 'farmFieldId, inputId, applicationDate, quantity, unit, and actorVtiId are required'
        });
      }

      if (quantity < 0) {
        return res.status(400).json({ error: 'Quantity must be non-negative' });
      }

      const event = new TraceabilityEvent({
        eventType: TraceabilityEventType.INPUT_APPLIED,
        actorRef: actorVtiId,
        geoLocation: geoLocation || undefined,
        payload: {
          inputId,
          quantity,
          unit,
          applicationDate: new Date(applicationDate).toISOString(),
          method: method || null,
        },
        farmFieldId,
        isPublicTraceable: false,
      });

      await event.save();

      res.json({
        status: 'success',
        message: `Input application event logged for farm field ${farmFieldId}.`,
      });
    } catch (error) {
      logger.error('Error handling input application event:', error);
      res.status(500).json({ error: 'Failed to handle input application event' });
    }
  }

  async handleObservationEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        farmFieldId,
        observationType,
        observationDate,
        details,
        mediaUrls,
        actorVtiId,
        geoLocation,
        aiAnalysis,
      } = req.body;

      if (!farmFieldId || !observationType || !observationDate || !details || !actorVtiId) {
        return res.status(400).json({
          error: 'farmFieldId, observationType, observationDate, details, and actorVtiId are required'
        });
      }

      const event = new TraceabilityEvent({
        eventType: TraceabilityEventType.OBSERVED,
        actorRef: actorVtiId,
        geoLocation: geoLocation || undefined,
        payload: {
          observationType,
          details,
          mediaUrls: mediaUrls || [],
          farmFieldId,
          aiAnalysis: aiAnalysis || 'No AI analysis was performed for this observation.',
        },
        farmFieldId,
        isPublicTraceable: false,
      });

      await event.save();

      res.json({
        status: 'success',
        message: `Observation event logged for farm field ${farmFieldId}.`
      });
    } catch (error) {
      logger.error('Error handling observation event:', error);
      res.status(500).json({ error: 'Failed to handle observation event' });
    }
  }

  async getTraceabilityEventsByFarmField(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { farmFieldId } = req.params;
      if (!farmFieldId) {
        return res.status(400).json({ error: 'Farm field ID is required' });
      }

      const events = await TraceabilityEvent.find({ farmFieldId })
        .sort({ timestamp: 1 })
        .populate('actorRef', 'name avatarUrl role');

      const formattedEvents = events.map(event => ({
        id: event._id,
        ...event.toObject(),
        timestamp: event.timestamp.toISOString(),
        actor: {
          name: (event as any).actorRef?.name || 'Unknown Actor',
          role: (event as any).actorRef?.role || 'System',
          avatarUrl: (event as any).actorRef?.avatarUrl || null,
        },
      }));

      res.json({ events: formattedEvents });
    } catch (error) {
      logger.error('Error fetching traceability events by farm field:', error);
      res.status(500).json({ error: 'Failed to fetch traceability events' });
    }
  }

  async getVtiTraceabilityHistory(req: Request, res: Response) {
    try {
      const { vtiId } = req.params;
      if (!vtiId) {
        return res.status(400).json({ error: 'VTI ID is required' });
      }

      const vti = await VtiRegistry.findOne({ vtiId });
      if (!vti) {
        return res.status(404).json({ error: `VTI batch with ID ${vtiId} not found` });
      }

      // Get post-harvest events
      const postHarvestEvents = await TraceabilityEvent.find({ vtiId })
        .sort({ timestamp: 1 });

      // Get pre-harvest events if farmFieldId exists
      let preHarvestEvents: ITraceabilityEvent[] = [];
      const farmFieldId = vti.metadata?.farmFieldId;

      if (farmFieldId) {
        preHarvestEvents = await TraceabilityEvent.find({
          farmFieldId,
          vtiId: { $exists: false }
        }).sort({ timestamp: 1 });
      }

      // Combine and sort all events
      const allEvents = [...preHarvestEvents, ...postHarvestEvents]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Get unique actor IDs and fetch profiles
      const actorIds = [...new Set(allEvents.map(event => event.actorRef))];
      const actorProfiles: Record<string, any> = {};

      if (actorIds.length > 0) {
        const users = await User.find({ _id: { $in: actorIds } });
        users.forEach(user => {
          actorProfiles[user._id.toString()] = {
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
          };
        });
      }

      const enrichedEvents = allEvents.map(event => ({
        ...event.toObject(),
        timestamp: event.timestamp.toISOString(),
        actor: actorProfiles[event.actorRef] || { name: 'System', role: 'Platform' },
      }));

      const formattedVti = {
        id: vti._id,
        ...vti.toObject(),
        creationTime: vti.creationTime.toISOString(),
      };

      res.json({
        vti: formattedVti,
        events: enrichedEvents,
      });
    } catch (error) {
      logger.error('Error fetching VTI traceability history:', error);
      res.status(500).json({ error: 'Failed to fetch traceability history' });
    }
  }

  async getRecentVtiBatches(req: Request, res: Response) {
    try {
      const vtis = await VtiRegistry.find({ isPublicTraceable: true })
        .sort({ creationTime: -1 })
        .limit(10);

      const batches = await Promise.all(
        vtis.map(async (vti) => {
          // Find harvest event for this VTI
          const harvestEvent = await TraceabilityEvent.findOne({
            vtiId: vti.vtiId,
            eventType: TraceabilityEventType.HARVESTED,
          });

          let producerName = 'Unknown';
          let harvestDate = vti.creationTime.toISOString();

          if (harvestEvent) {
            harvestDate = harvestEvent.timestamp.toISOString();
            if (harvestEvent.actorRef) {
              const user = await User.findById(harvestEvent.actorRef);
              if (user) {
                producerName = user.name;
              }
            }
          }

          return {
            id: vti._id,
            productName: vti.metadata?.cropType || 'Unknown Product',
            producerName,
            harvestDate,
          };
        })
      );

      res.json({ batches });
    } catch (error) {
      logger.error('Error fetching recent VTI batches:', error);
      res.status(500).json({ error: 'Failed to fetch recent batches' });
    }
  }
}