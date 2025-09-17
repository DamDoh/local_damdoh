import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Farm, IFarm } from '../models/farm.model';
import { logger } from '../utils/logger';

export class FarmController extends BaseController<IFarm> {
  constructor() {
    super(Farm);
  }

  async getNearbyFarms(req: Request, res: Response) {
    try {
      const { longitude, latitude, maxDistance = 10000 } = req.query;

      if (!longitude || !latitude) {
        return res.status(400).json({ error: 'Location coordinates are required' });
      }

      const farms = await Farm.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: Number(maxDistance), // in meters
          },
        },
      });

      res.json(farms);
    } catch (error) {
      logger.error('Error finding nearby farms:', error);
      res.status(500).json({ error: 'Failed to find nearby farms' });
    }
  }

  async getFarmsByOwner(req: Request, res: Response) {
    try {
      const { ownerId } = req.params;
      const { active } = req.query;

      const filter: any = { owner: ownerId };
      if (active !== undefined) {
        filter.active = active === 'true';
      }

      const result = await this.findWithPagination(
        filter,
        Number(req.query.page),
        Number(req.query.limit),
        req.query.sort as string
      );

      res.json(result);
    } catch (error) {
      logger.error('Error fetching farms by owner:', error);
      res.status(500).json({ error: 'Failed to fetch farms by owner' });
    }
  }

  async addCrop(req: Request, res: Response) {
    try {
      const { farmId } = req.params;
      const cropData = req.body;

      const farm = await Farm.findById(farmId);
      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }

      farm.crops.push(cropData);
      await farm.save();

      res.json(farm);
    } catch (error) {
      logger.error('Error adding crop:', error);
      res.status(500).json({ error: 'Failed to add crop' });
    }
  }

  async updateCrop(req: Request, res: Response) {
    try {
      const { farmId, cropId } = req.params;
      const cropData = req.body;

      const farm = await Farm.findOneAndUpdate(
        { _id: farmId, 'crops._id': cropId },
        { $set: { 'crops.$': { ...cropData, _id: cropId } } },
        { new: true }
      );

      if (!farm) {
        return res.status(404).json({ error: 'Farm or crop not found' });
      }

      res.json(farm);
    } catch (error) {
      logger.error('Error updating crop:', error);
      res.status(500).json({ error: 'Failed to update crop' });
    }
  }

  async deleteCrop(req: Request, res: Response) {
    try {
      const { farmId, cropId } = req.params;

      const farm = await Farm.findByIdAndUpdate(
        farmId,
        { $pull: { crops: { _id: cropId } } },
        { new: true }
      );

      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }

      res.json(farm);
    } catch (error) {
      logger.error('Error deleting crop:', error);
      res.status(500).json({ error: 'Failed to delete crop' });
    }
  }

  async updateSoilData(req: Request, res: Response) {
    try {
      const { farmId } = req.params;
      const soilData = req.body;

      const farm = await Farm.findByIdAndUpdate(
        farmId,
        { $set: { soilData: { ...soilData, lastTestedDate: new Date() } } },
        { new: true }
      );

      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }

      res.json(farm);
    } catch (error) {
      logger.error('Error updating soil data:', error);
      res.status(500).json({ error: 'Failed to update soil data' });
    }
  }
}