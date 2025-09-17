import { Request, Response } from 'express';
import {
  InventoryItem,
  InventoryTransaction,
  InventoryCategory,
  InventoryTransactionType,
  IInventoryItem,
  IInventoryTransaction
} from '../models/inventory.model';
import { logger } from '../utils/logger';

export class InventoryController {
  async addInventoryItem(req: Request, res: Response) {
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
        sku,
        category,
        unitOfMeasure,
        currentStock,
        minimumStock,
        maximumStock,
        unitCost,
        unitPrice,
        supplier,
        location,
        expiryDate,
        batchNumber
      } = req.body;

      if (!farmId || !name || !type || !unitOfMeasure) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // TODO: Check if user has access to the farm
      // For now, we'll assume the user owns the farm

      const inventoryItem = new InventoryItem({
        farm: farmId,
        name: name.trim(),
        type,
        description: description?.trim(),
        sku: sku?.trim(),
        category: category?.trim(),
        unitOfMeasure,
        currentStock: currentStock || 0,
        minimumStock,
        maximumStock,
        unitCost,
        unitPrice,
        supplier: supplier?.trim(),
        location: location?.trim(),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        batchNumber: batchNumber?.trim(),
      });

      await inventoryItem.save();

      res.json({
        success: true,
        itemId: inventoryItem._id,
        message: 'Inventory item added successfully'
      });
    } catch (error) {
      logger.error('Error adding inventory item:', error);
      res.status(500).json({ error: 'Failed to add inventory item' });
    }
  }

  async getInventory(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { farmId, type, category, lowStock, page = 1, limit = 50 } = req.query;

      if (!farmId) {
        return res.status(400).json({ error: 'Farm ID is required' });
      }

      // TODO: Check if user has access to the farm

      const query: any = { farm: farmId, isActive: true };

      if (type) {
        query.type = type;
      }

      if (category) {
        query.category = category;
      }

      if (lowStock === 'true') {
        query.minimumStock = { $exists: true };
        // We'll filter for low stock items in the aggregation
      }

      const skip = (Number(page) - 1) * Number(limit);

      let items;
      if (lowStock === 'true') {
        // Use aggregation to filter low stock items
        items = await InventoryItem.aggregate([
          { $match: query },
          {
            $addFields: {
              isLowStock: {
                $cond: {
                  if: { $and: ['$minimumStock', { $lte: ['$currentStock', '$minimumStock'] }] },
                  then: true,
                  else: false
                }
              }
            }
          },
          { $match: { isLowStock: true } },
          { $sort: { name: 1 } },
          { $skip: skip },
          { $limit: Number(limit) }
        ]);
      } else {
        items = await InventoryItem.find(query)
          .sort({ name: 1 })
          .skip(skip)
          .limit(Number(limit));
      }

      const total = await InventoryItem.countDocuments(query);

      const formattedItems = items.map(item => ({
        id: item._id,
        name: item.name,
        type: item.type,
        description: item.description,
        sku: item.sku,
        category: item.category,
        unitOfMeasure: item.unitOfMeasure,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        maximumStock: item.maximumStock,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        supplier: item.supplier,
        location: item.location,
        expiryDate: item.expiryDate?.toISOString(),
        batchNumber: item.batchNumber,
        isLowStock: item.minimumStock && item.currentStock <= item.minimumStock,
        stockStatus: this.getStockStatus(item),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));

      res.json({
        items: formattedItems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching inventory:', error);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }

  async updateInventoryItem(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { itemId } = req.params;
      const updateData = req.body;

      if (!itemId) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      // TODO: Check if user has access to the item

      const updatedItem = await InventoryItem.findByIdAndUpdate(
        itemId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      res.json({
        success: true,
        item: {
          id: updatedItem._id,
          name: updatedItem.name,
          currentStock: updatedItem.currentStock,
          updatedAt: updatedItem.updatedAt.toISOString(),
        }
      });
    } catch (error) {
      logger.error('Error updating inventory item:', error);
      res.status(500).json({ error: 'Failed to update inventory item' });
    }
  }

  async deleteInventoryItem(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { itemId } = req.params;

      if (!itemId) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      // TODO: Check if user has access to the item

      // Soft delete by setting isActive to false
      const deletedItem = await InventoryItem.findByIdAndUpdate(
        itemId,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!deletedItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      res.json({
        success: true,
        message: 'Inventory item deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting inventory item:', error);
      res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  }

  async recordInventoryTransaction(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const {
        itemId,
        type,
        quantity,
        unitCost,
        unitPrice,
        reference,
        notes,
        transactionDate
      } = req.body;

      if (!itemId || !type || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if item exists and get farm ID
      const item = await InventoryItem.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      // TODO: Check if user has access to the farm

      const totalValue = quantity * (unitCost || unitPrice || 0);

      const transaction = new InventoryTransaction({
        item: itemId,
        farm: item.farm,
        type,
        quantity: Number(quantity),
        unitCost,
        unitPrice,
        totalValue,
        reference,
        notes,
        performedBy: userId,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      });

      await transaction.save();

      res.json({
        success: true,
        transactionId: transaction._id,
        message: 'Inventory transaction recorded successfully'
      });
    } catch (error) {
      logger.error('Error recording inventory transaction:', error);
      res.status(500).json({ error: 'Failed to record inventory transaction' });
    }
  }

  async getInventoryTransactions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { itemId, farmId, type, page = 1, limit = 50 } = req.query;

      if (!farmId) {
        return res.status(400).json({ error: 'Farm ID is required' });
      }

      // TODO: Check if user has access to the farm

      const query: any = { farm: farmId };

      if (itemId) {
        query.item = itemId;
      }

      if (type) {
        query.type = type;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const transactions = await InventoryTransaction.find(query)
        .populate('item', 'name type unitOfMeasure')
        .populate('performedBy', 'name')
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await InventoryTransaction.countDocuments(query);

      const formattedTransactions = transactions.map(transaction => ({
        id: transaction._id,
        item: {
          id: (transaction as any).item._id,
          name: (transaction as any).item.name,
          type: (transaction as any).item.type,
          unitOfMeasure: (transaction as any).item.unitOfMeasure,
        },
        type: transaction.type,
        quantity: transaction.quantity,
        unitCost: transaction.unitCost,
        unitPrice: transaction.unitPrice,
        totalValue: transaction.totalValue,
        reference: transaction.reference,
        notes: transaction.notes,
        performedBy: {
          id: (transaction as any).performedBy._id,
          name: (transaction as any).performedBy.name,
        },
        transactionDate: transaction.transactionDate.toISOString(),
        createdAt: transaction.createdAt.toISOString(),
      }));

      res.json({
        transactions: formattedTransactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching inventory transactions:', error);
      res.status(500).json({ error: 'Failed to fetch inventory transactions' });
    }
  }

  async getLowStockAlerts(req: Request, res: Response) {
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

      const lowStockItems = await InventoryItem.find({
        farm: farmId,
        isActive: true,
        minimumStock: { $exists: true },
        $expr: { $lte: ['$currentStock', '$minimumStock'] }
      }).sort({ currentStock: 1 });

      const alerts = lowStockItems.map(item => ({
        id: item._id,
        name: item.name,
        type: item.type,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        unitOfMeasure: item.unitOfMeasure,
        supplier: item.supplier,
        category: item.category,
      }));

      res.json({ alerts });
    } catch (error) {
      logger.error('Error fetching low stock alerts:', error);
      res.status(500).json({ error: 'Failed to fetch low stock alerts' });
    }
  }

  private getStockStatus(item: IInventoryItem): string {
    if (!item.minimumStock) return 'normal';
    if (item.currentStock <= item.minimumStock) return 'low';
    if (item.maximumStock && item.currentStock >= item.maximumStock) return 'high';
    return 'normal';
  }
}