import express from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const inventoryController = new InventoryController();

/**
 * @swagger
 * /api/inventory/items:
 *   post:
 *     tags: [Inventory]
 *     summary: Add a new inventory item
 *     description: Create a new inventory item for farm management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmId
 *               - name
 *               - type
 *               - unitOfMeasure
 *             properties:
 *               farmId:
 *                 type: string
 *                 description: Farm ID
 *               name:
 *                 type: string
 *                 description: Item name
 *               type:
 *                 type: string
 *                 enum: [SEED, FERTILIZER, PESTICIDE, EQUIPMENT, FEED, SUPPLY, HARVEST, OTHER]
 *               description:
 *                 type: string
 *               sku:
 *                 type: string
 *               category:
 *                 type: string
 *               unitOfMeasure:
 *                 type: string
 *                 enum: [KG, LITERS, PIECES, BAGS, BOXES, TONS, ACRES, HOURS]
 *               currentStock:
 *                 type: number
 *                 default: 0
 *               minimumStock:
 *                 type: number
 *               maximumStock:
 *                 type: number
 *               unitCost:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               supplier:
 *                 type: string
 *               location:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               batchNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory item added successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/items', requireAuth(), inventoryController.addInventoryItem);

/**
 * @swagger
 * /api/inventory/items:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory items
 *     description: Get all inventory items for a farm with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SEED, FERTILIZER, PESTICIDE, EQUIPMENT, FEED, SUPPLY, HARVEST, OTHER]
 *         description: Filter by item type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filter for low stock items only
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       currentStock:
 *                         type: number
 *                       minimumStock:
 *                         type: number
 *                       unitOfMeasure:
 *                         type: string
 *                       isLowStock:
 *                         type: boolean
 *                       stockStatus:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.get('/items', requireAuth(), inventoryController.getInventory);

/**
 * @swagger
 * /api/inventory/items/{itemId}:
 *   put:
 *     tags: [Inventory]
 *     summary: Update inventory item
 *     description: Update an existing inventory item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               currentStock:
 *                 type: number
 *               minimumStock:
 *                 type: number
 *               maximumStock:
 *                 type: number
 *               unitCost:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               supplier:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       400:
 *         description: Bad request
 */
router.put('/items/:itemId', requireAuth(), inventoryController.updateInventoryItem);

/**
 * @swagger
 * /api/inventory/items/{itemId}:
 *   delete:
 *     tags: [Inventory]
 *     summary: Delete inventory item
 *     description: Soft delete an inventory item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.delete('/items/:itemId', requireAuth(), inventoryController.deleteInventoryItem);

/**
 * @swagger
 * /api/inventory/transactions:
 *   post:
 *     tags: [Inventory]
 *     summary: Record inventory transaction
 *     description: Record a transaction that affects inventory levels
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - type
 *               - quantity
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: Inventory item ID
 *               type:
 *                 type: string
 *                 enum: [PURCHASE, SALE, USAGE, ADJUSTMENT, TRANSFER, RETURN]
 *               quantity:
 *                 type: number
 *                 description: Quantity (positive for increase, negative for decrease)
 *               unitCost:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               reference:
 *                 type: string
 *                 description: Reference ID (order, sale, etc.)
 *               notes:
 *                 type: string
 *               transactionDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Transaction recorded successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Item not found
 */
router.post('/transactions', requireAuth(), inventoryController.recordInventoryTransaction);

/**
 * @swagger
 * /api/inventory/transactions:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory transactions
 *     description: Get transaction history for inventory items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         description: Filter by specific item
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PURCHASE, SALE, USAGE, ADJUSTMENT, TRANSFER, RETURN]
 *         description: Filter by transaction type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.get('/transactions', requireAuth(), inventoryController.getInventoryTransactions);

/**
 * @swagger
 * /api/inventory/alerts/low-stock:
 *   get:
 *     tags: [Inventory]
 *     summary: Get low stock alerts
 *     description: Get all inventory items that are below minimum stock levels
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *     responses:
 *       200:
 *         description: Low stock alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       currentStock:
 *                         type: number
 *                       minimumStock:
 *                         type: number
 *                       unitOfMeasure:
 *                         type: string
 *                       supplier:
 *                         type: string
 *                       category:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.get('/alerts/low-stock', requireAuth(), inventoryController.getLowStockAlerts);

export default router;