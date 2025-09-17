import { Request, Response } from 'express';
import { Asset, AssetMaintenance, AssetUsage, IAsset, IAssetMaintenance, IAssetUsage } from '../models/asset.model';
import { logger } from '../utils/logger';

export class AssetController {
  async addAsset(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const {
        farmId,
        name,
        type,
        description,
        assetId,
        category,
        status,
        purchaseDate,
        purchasePrice,
        currentValue,
        depreciationRate,
        location,
        manufacturer,
        model,
        serialNumber,
        warrantyExpiry,
        insuranceExpiry,
        specifications,
        images,
        documents
      } = req.body;

      if (!farmId || !name || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // TODO: Check if user has access to the farm

      const asset = new Asset({
        farm: farmId,
        name: name.trim(),
        type,
        description: description?.trim(),
        assetId: assetId?.trim(),
        category: category?.trim(),
        status: status || 'ACTIVE',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        purchasePrice,
        currentValue,
        depreciationRate,
        location: location?.trim(),
        manufacturer: manufacturer?.trim(),
        model: model?.trim(),
        serialNumber: serialNumber?.trim(),
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
        specifications,
        images,
        documents,
      });

      await asset.save();

      res.json({
        success: true,
        assetId: asset._id,
        message: 'Asset added successfully'
      });
    } catch (error) {
      logger.error('Error adding asset:', error);
      res.status(500).json({ error: 'Failed to add asset' });
    }
  }

  async getUserAssets(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { farmId, type, status, page = 1, limit = 50 } = req.query;

      if (!farmId) {
        return res.status(400).json({ error: 'Farm ID is required' });
      }

      // TODO: Check if user has access to the farm

      const query: any = { farm: farmId, isActive: true };

      if (type) {
        query.type = type;
      }

      if (status) {
        query.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const assets = await Asset.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Asset.countDocuments(query);

      const formattedAssets = assets.map(asset => ({
        id: asset._id,
        name: asset.name,
        type: asset.type,
        description: asset.description,
        assetId: asset.assetId,
        category: asset.category,
        status: asset.status,
        purchaseDate: asset.purchaseDate?.toISOString(),
        purchasePrice: asset.purchasePrice,
        currentValue: asset.currentValue,
        calculatedCurrentValue: (asset as any).calculatedCurrentValue,
        depreciationRate: asset.depreciationRate,
        location: asset.location,
        manufacturer: asset.manufacturer,
        model: asset.model,
        serialNumber: asset.serialNumber,
        warrantyExpiry: asset.warrantyExpiry?.toISOString(),
        insuranceExpiry: asset.insuranceExpiry?.toISOString(),
        specifications: asset.specifications,
        images: asset.images,
        documents: asset.documents,
        maintenanceStatus: (asset as any).maintenanceStatus,
        ageInYears: (asset as any).ageInYears,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
      }));

      res.json({
        assets: formattedAssets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching user assets:', error);
      res.status(500).json({ error: 'Failed to fetch assets' });
    }
  }

  async updateAsset(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { assetId } = req.params;
      const updateData = req.body;

      if (!assetId) {
        return res.status(400).json({ error: 'Asset ID is required' });
      }

      // TODO: Check if user has access to the asset

      // Handle date fields
      if (updateData.purchaseDate) {
        updateData.purchaseDate = new Date(updateData.purchaseDate);
      }
      if (updateData.warrantyExpiry) {
        updateData.warrantyExpiry = new Date(updateData.warrantyExpiry);
      }
      if (updateData.insuranceExpiry) {
        updateData.insuranceExpiry = new Date(updateData.insuranceExpiry);
      }

      const updatedAsset = await Asset.findByIdAndUpdate(
        assetId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedAsset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      res.json({
        success: true,
        asset: {
          id: updatedAsset._id,
          name: updatedAsset.name,
          status: updatedAsset.status,
          updatedAt: updatedAsset.updatedAt.toISOString(),
        }
      });
    } catch (error) {
      logger.error('Error updating asset:', error);
      res.status(500).json({ error: 'Failed to update asset' });
    }
  }

  async deleteAsset(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { assetId } = req.params;

      if (!assetId) {
        return res.status(400).json({ error: 'Asset ID is required' });
      }

      // TODO: Check if user has access to the asset

      // Soft delete by setting isActive to false
      const deletedAsset = await Asset.findByIdAndUpdate(
        assetId,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!deletedAsset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      res.json({
        success: true,
        message: 'Asset deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting asset:', error);
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  }

  async scheduleMaintenance(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const {
        assetId,
        type,
        description,
        scheduledDate,
        cost,
        performedBy,
        notes,
        nextMaintenanceDate
      } = req.body;

      if (!assetId || !type || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if asset exists and get farm ID
      const asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      // TODO: Check if user has access to the farm

      const maintenance = new AssetMaintenance({
        asset: assetId,
        farm: asset.farm,
        type,
        description,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        cost,
        performedBy,
        notes,
        nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : undefined,
      });

      await maintenance.save();

      res.json({
        success: true,
        maintenanceId: maintenance._id,
        message: 'Maintenance scheduled successfully'
      });
    } catch (error) {
      logger.error('Error scheduling maintenance:', error);
      res.status(500).json({ error: 'Failed to schedule maintenance' });
    }
  }

  async recordAssetUsage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const {
        assetId,
        startDate,
        endDate,
        purpose,
        hoursUsed,
        fuelUsed,
        notes
      } = req.body;

      if (!assetId || !startDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if asset exists and get farm ID
      const asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      // TODO: Check if user has access to the farm

      const usage = new AssetUsage({
        asset: assetId,
        farm: asset.farm,
        user: userId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        purpose,
        hoursUsed,
        fuelUsed,
        notes,
      });

      await usage.save();

      res.json({
        success: true,
        usageId: usage._id,
        message: 'Asset usage recorded successfully'
      });
    } catch (error) {
      logger.error('Error recording asset usage:', error);
      res.status(500).json({ error: 'Failed to record asset usage' });
    }
  }

  async getAssetMaintenanceHistory(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { assetId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!assetId) {
        return res.status(400).json({ error: 'Asset ID is required' });
      }

      // Check if asset exists and user has access
      const asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      // TODO: Check if user has access to the farm

      const skip = (Number(page) - 1) * Number(limit);

      const maintenance = await AssetMaintenance.find({ asset: assetId })
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await AssetMaintenance.countDocuments({ asset: assetId });

      const formattedMaintenance = maintenance.map(m => ({
        id: m._id,
        type: m.type,
        description: m.description,
        scheduledDate: m.scheduledDate?.toISOString(),
        completedDate: m.completedDate?.toISOString(),
        cost: m.cost,
        performedBy: m.performedBy,
        notes: m.notes,
        nextMaintenanceDate: m.nextMaintenanceDate?.toISOString(),
        isCompleted: m.isCompleted,
        createdAt: m.createdAt.toISOString(),
      }));

      res.json({
        maintenance: formattedMaintenance,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching asset maintenance history:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance history' });
    }
  }

  async getAssetUsageHistory(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { assetId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!assetId) {
        return res.status(400).json({ error: 'Asset ID is required' });
      }

      // Check if asset exists and user has access
      const asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      // TODO: Check if user has access to the farm

      const skip = (Number(page) - 1) * Number(limit);

      const usage = await AssetUsage.find({ asset: assetId })
        .populate('user', 'name')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await AssetUsage.countDocuments({ asset: assetId });

      const formattedUsage = usage.map(u => ({
        id: u._id,
        user: {
          id: (u as any).user._id,
          name: (u as any).user.name,
        },
        startDate: u.startDate.toISOString(),
        endDate: u.endDate?.toISOString(),
        purpose: u.purpose,
        hoursUsed: u.hoursUsed,
        fuelUsed: u.fuelUsed,
        notes: u.notes,
        createdAt: u.createdAt.toISOString(),
      }));

      res.json({
        usage: formattedUsage,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching asset usage history:', error);
      res.status(500).json({ error: 'Failed to fetch usage history' });
    }
  }

  async getMaintenanceAlerts(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { farmId } = req.query;

      if (!farmId) {
        return res.status(400).json({ error: 'Farm ID is required' });
      }

      // TODO: Check if user has access to the farm

      // Get assets with expired warranty or insurance
      const expiredAssets = await Asset.find({
        farm: farmId,
        isActive: true,
        $or: [
          { warrantyExpiry: { $lt: new Date() } },
          { insuranceExpiry: { $lt: new Date() } }
        ]
      });

      // Get upcoming maintenance
      const upcomingMaintenance = await AssetMaintenance.find({
        farm: farmId,
        isCompleted: false,
        scheduledDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // Next 30 days
      }).populate('asset', 'name type');

      const alerts: any[] = [];

      // Add expiry alerts
      expiredAssets.forEach(asset => {
        if (asset.warrantyExpiry && asset.warrantyExpiry < new Date()) {
          alerts.push({
            type: 'warranty_expired',
            assetId: asset._id,
            assetName: asset.name,
            assetType: asset.type,
            expiryDate: asset.warrantyExpiry.toISOString(),
            message: `Warranty expired for ${asset.name}`,
          });
        }

        if (asset.insuranceExpiry && asset.insuranceExpiry < new Date()) {
          alerts.push({
            type: 'insurance_expired',
            assetId: asset._id,
            assetName: asset.name,
            assetType: asset.type,
            expiryDate: asset.insuranceExpiry.toISOString(),
            message: `Insurance expired for ${asset.name}`,
          });
        }
      });

      // Add maintenance alerts
      upcomingMaintenance.forEach(maintenance => {
        alerts.push({
          type: 'maintenance_due',
          assetId: (maintenance as any).asset._id,
          assetName: (maintenance as any).asset.name,
          assetType: (maintenance as any).asset.type,
          maintenanceId: maintenance._id,
          scheduledDate: maintenance.scheduledDate?.toISOString(),
          description: maintenance.description,
          message: `Maintenance due for ${maintenance.description}`,
        });
      });

      res.json({ alerts });
    } catch (error) {
      logger.error('Error fetching maintenance alerts:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance alerts' });
    }
  }
}