import express from 'express';
import { TraceabilityController } from '../controllers/traceability.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const traceabilityController = new TraceabilityController();

/**
 * @swagger
 * /api/traceability/generate-vti:
 *   post:
 *     tags: [Traceability]
 *     summary: Generate a new Verifiable Traceability Identifier (VTI)
 *     description: Create a new VTI for tracking agricultural products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of VTI (e.g., farm_batch, product)
 *               linkedVtis:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of linked VTI IDs
 *               metadata:
 *                 type: object
 *                 description: Additional metadata for the VTI
 *     responses:
 *       200:
 *         description: VTI generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vtiId:
 *                   type: string
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/generate-vti', requireAuth(), traceabilityController.generateVTI);

/**
 * @swagger
 * /api/traceability/log-event:
 *   post:
 *     tags: [Traceability]
 *     summary: Log a traceability event
 *     description: Log an event in the traceability chain
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - actorRef
 *             properties:
 *               vtiId:
 *                 type: string
 *                 description: VTI ID for post-harvest events
 *               farmFieldId:
 *                 type: string
 *                 description: Farm field ID for pre-harvest events
 *               eventType:
 *                 type: string
 *                 enum: [HARVESTED, INPUT_APPLIED, OBSERVED, PROCESSED, PACKAGED, SHIPPED, RECEIVED, SOLD, CONSUMED]
 *               actorRef:
 *                 type: string
 *                 description: Reference to the actor performing the event
 *               geoLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               payload:
 *                 type: object
 *                 description: Event-specific data
 *     responses:
 *       200:
 *         description: Event logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/log-event', requireAuth(), traceabilityController.logTraceEvent);

/**
 * @swagger
 * /api/traceability/harvest-event:
 *   post:
 *     tags: [Traceability]
 *     summary: Handle harvest event
 *     description: Log a harvest event and create a new VTI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmFieldId
 *               - cropType
 *               - actorVtiId
 *             properties:
 *               farmFieldId:
 *                 type: string
 *               cropType:
 *                 type: string
 *               yieldKg:
 *                 type: number
 *               qualityGrade:
 *                 type: string
 *               actorVtiId:
 *                 type: string
 *               geoLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Harvest event handled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 vtiId:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not a farmer
 *       400:
 *         description: Bad request
 */
router.post('/harvest-event', requireAuth(), traceabilityController.handleHarvestEvent);

/**
 * @swagger
 * /api/traceability/input-application-event:
 *   post:
 *     tags: [Traceability]
 *     summary: Handle input application event
 *     description: Log an input application event (fertilizer, pesticide, etc.)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmFieldId
 *               - inputId
 *               - applicationDate
 *               - quantity
 *               - unit
 *               - actorVtiId
 *             properties:
 *               farmFieldId:
 *                 type: string
 *               inputId:
 *                 type: string
 *               applicationDate:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               method:
 *                 type: string
 *               actorVtiId:
 *                 type: string
 *               geoLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Input application event logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not a farmer
 *       400:
 *         description: Bad request
 */
router.post('/input-application-event', requireAuth(), traceabilityController.handleInputApplicationEvent);

/**
 * @swagger
 * /api/traceability/observation-event:
 *   post:
 *     tags: [Traceability]
 *     summary: Handle observation event
 *     description: Log an observation event for a farm field
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmFieldId
 *               - observationType
 *               - observationDate
 *               - details
 *               - actorVtiId
 *             properties:
 *               farmFieldId:
 *                 type: string
 *               observationType:
 *                 type: string
 *               observationDate:
 *                 type: string
 *                 format: date
 *               details:
 *                 type: string
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               actorVtiId:
 *                 type: string
 *               geoLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               aiAnalysis:
 *                 type: string
 *     responses:
 *       200:
 *         description: Observation event logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/observation-event', requireAuth(), traceabilityController.handleObservationEvent);

/**
 * @swagger
 * /api/traceability/events/farm-field/{farmFieldId}:
 *   get:
 *     tags: [Traceability]
 *     summary: Get traceability events by farm field
 *     description: Get all traceability events for a specific farm field
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmFieldId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the farm field
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       vtiId:
 *                         type: string
 *                       farmFieldId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       eventType:
 *                         type: string
 *                       actorRef:
 *                         type: string
 *                       geoLocation:
 *                         type: object
 *                       payload:
 *                         type: object
 *                       actor:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           role:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Farm field not found
 */
router.get('/events/farm-field/:farmFieldId', requireAuth(), traceabilityController.getTraceabilityEventsByFarmField);

/**
 * @swagger
 * /api/traceability/vti/{vtiId}/history:
 *   get:
 *     tags: [Traceability]
 *     summary: Get VTI traceability history
 *     description: Get the complete traceability history for a VTI
 *     parameters:
 *       - in: path
 *         name: vtiId
 *         required: true
 *         schema:
 *           type: string
 *         description: VTI ID
 *     responses:
 *       200:
 *         description: Traceability history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vti:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     vtiId:
 *                       type: string
 *                     type:
 *                       type: string
 *                     creationTime:
 *                       type: string
 *                     status:
 *                       type: string
 *                     metadata:
 *                       type: object
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: VTI not found
 */
router.get('/vti/:vtiId/history', traceabilityController.getVtiTraceabilityHistory);

/**
 * @swagger
 * /api/traceability/recent-batches:
 *   get:
 *     tags: [Traceability]
 *     summary: Get recent VTI batches
 *     description: Get the most recent traceable VTI batches
 *     responses:
 *       200:
 *         description: Recent batches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       productName:
 *                         type: string
 *                       producerName:
 *                         type: string
 *                       harvestDate:
 *                         type: string
 */
router.get('/recent-batches', traceabilityController.getRecentVtiBatches);

export default router;