import express from 'express';
import { AssetController } from '../controllers/asset.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const assetController = new AssetController();

/**
 * @swagger
 * /api/assets:
 *   post:
 *     tags: [Assets]
 *     summary: Add a new asset
 *     description: Create a new asset for farm management
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
 *             properties:
 *               farmId:
 *                 type: string
 *                 description: Farm ID
 *               name:
 *                 type: string
 *                 description: Asset name
 *               type:
 *                 type: string
 *                 enum: [EQUIPMENT, MACHINERY, VEHICLE, BUILDING, LAND, IRRIGATION, STORAGE, OTHER]
 *               description:
 *                 type: string
 *               assetId:
 *                 type: string
 *                 description: Unique asset identifier
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE, RETIRED, SOLD]
 *                 default: ACTIVE
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               purchasePrice:
 *                 type: number
 *               currentValue:
 *                 type: number
 *               depreciationRate:
 *                 type: number
 *                 description: Annual depreciation rate (percentage)
 *               location:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               warrantyExpiry:
 *                 type: string
 *                 format: date
 *               insuranceExpiry:
 *                 type: string
 *                 format: date
 *               specifications:
 *                 type: object
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *     responses:
 *       200:
 *         description: Asset added successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', requireAuth(), assetController.addAsset);

/**
 * @swagger
 * /api/assets:
 *   get:
 *     tags: [Assets]
 *     summary: Get user assets
 *     description: Get all assets for a farm with optional filtering
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
 *           enum: [EQUIPMENT, MACHINERY, VEHICLE, BUILDING, LAND, IRRIGATION, STORAGE, OTHER]
 *         description: Filter by asset type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, MAINTENANCE, RETIRED, SOLD]
 *         description: Filter by asset status
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
 *         description: Assets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assets:
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
 *                       status:
 *                         type: string
 *                       currentValue:
 *                         type: number
 *                       calculatedCurrentValue:
 *                         type: number
 *                       maintenanceStatus:
 *                         type: string
 *                       ageInYears:
 *                         type: number
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
router.get('/', requireAuth(), assetController.getUserAssets);

/**
 * @swagger
 * /api/assets/{assetId}:
 *   put:
 *     tags: [Assets]
 *     summary: Update asset
 *     description: Update an existing asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
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
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE, RETIRED, SOLD]
 *               currentValue:
 *                 type: number
 *               location:
 *                 type: string
 *               warrantyExpiry:
 *                 type: string
 *                 format: date
 *               insuranceExpiry:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Asset not found
 *       400:
 *         description: Bad request
 */
router.put('/:assetId', requireAuth(), assetController.updateAsset);

/**
 * @swagger
 * /api/assets/{assetId}:
 *   delete:
 *     tags: [Assets]
 *     summary: Delete asset
 *     description: Soft delete an asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Asset not found
 */
router.delete('/:assetId', requireAuth(), assetController.deleteAsset);

/**
 * @swagger
 * /api/assets/{assetId}/maintenance:
 *   post:
 *     tags: [Assets]
 *     summary: Schedule maintenance
 *     description: Schedule maintenance for an asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PREVENTIVE, CORRECTIVE, PREDICTIVE, CONDITION_BASED]
 *               description:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               cost:
 *                 type: number
 *               performedBy:
 *                 type: string
 *               notes:
 *                 type: string
 *               nextMaintenanceDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Maintenance scheduled successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Asset not found
 */
router.post('/:assetId/maintenance', requireAuth(), assetController.scheduleMaintenance);

/**
 * @swagger
 * /api/assets/{assetId}/usage:
 *   post:
 *     tags: [Assets]
 *     summary: Record asset usage
 *     description: Record usage of an asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               purpose:
 *                 type: string
 *               hoursUsed:
 *                 type: number
 *               fuelUsed:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset usage recorded successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Asset not found
 */
router.post('/:assetId/usage', requireAuth(), assetController.recordAssetUsage);

/**
 * @swagger
 * /api/assets/{assetId}/maintenance:
 *   get:
 *     tags: [Assets]
 *     summary: Get asset maintenance history
 *     description: Get maintenance history for a specific asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
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
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Maintenance history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Asset not found
 */
router.get('/:assetId/maintenance', requireAuth(), assetController.getAssetMaintenanceHistory);

/**
 * @swagger
 * /api/assets/{assetId}/usage:
 *   get:
 *     tags: [Assets]
 *     summary: Get asset usage history
 *     description: Get usage history for a specific asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
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
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Usage history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Asset not found
 */
router.get('/:assetId/usage', requireAuth(), assetController.getAssetUsageHistory);

/**
 * @swagger
 * /api/assets/alerts/maintenance:
 *   get:
 *     tags: [Assets]
 *     summary: Get maintenance alerts
 *     description: Get all maintenance-related alerts for assets
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
 *         description: Maintenance alerts retrieved successfully
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
 *                       type:
 *                         type: string
 *                         enum: [warranty_expired, insurance_expired, maintenance_due]
 *                       assetId:
 *                         type: string
 *                       assetName:
 *                         type: string
 *                       assetType:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.get('/alerts/maintenance', requireAuth(), assetController.getMaintenanceAlerts);

export default router;