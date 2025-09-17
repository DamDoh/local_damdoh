import express from 'express';
import { InsuranceController } from '../controllers/insurance.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const insuranceController = new InsuranceController();

/**
 * @swagger
 * /api/insurance/policies:
 *   post:
 *     tags: [Insurance]
 *     summary: Process insurance application
 *     description: Submit an application for an insurance policy
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - insurerId
 *               - coverageAmount
 *               - premium
 *               - startDate
 *               - endDate
 *             properties:
 *               insurerId:
 *                 type: string
 *                 description: ID of the insurance provider
 *               coverageAmount:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 default: USD
 *               premium:
 *                 type: number
 *                 minimum: 0
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               insuredAssets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     asset:
 *                       type: string
 *               parametricThresholds:
 *                 type: object
 *     responses:
 *       200:
 *         description: Insurance application processed successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/policies', requireAuth(), insuranceController.processInsuranceApplication);

/**
 * @swagger
 * /api/insurance/policies:
 *   get:
 *     tags: [Insurance]
 *     summary: Get insurance policies
 *     description: Get all insurance policies for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, EXPIRED, CANCELLED]
 *     responses:
 *       200:
 *         description: Insurance policies retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/policies', requireAuth(), insuranceController.getInsurancePolicies);

/**
 * @swagger
 * /api/insurance/claims:
 *   post:
 *     tags: [Insurance]
 *     summary: Submit insurance claim
 *     description: Submit a claim for an insurance policy
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyId
 *               - incidentDate
 *               - claimedAmount
 *               - description
 *             properties:
 *               policyId:
 *                 type: string
 *               incidentDate:
 *                 type: string
 *                 format: date
 *               claimedAmount:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 default: USD
 *               description:
 *                 type: string
 *               supportingDocumentsUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Insurance claim submitted successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Policy not found
 */
router.post('/claims', requireAuth(), insuranceController.submitInsuranceClaim);

/**
 * @swagger
 * /api/insurance/claims:
 *   get:
 *     tags: [Insurance]
 *     summary: Get insurance claims
 *     description: Get all insurance claims for the authenticated user (as policyholder or insurer)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, PROCESSING_ERROR]
 *     responses:
 *       200:
 *         description: Insurance claims retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/claims', requireAuth(), insuranceController.getInsuranceClaims);

/**
 * @swagger
 * /api/insurance/weather-readings:
 *   post:
 *     tags: [Insurance]
 *     summary: Create weather reading
 *     description: Record a weather reading that may trigger parametric insurance payouts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *               - timestamp
 *               - source
 *             properties:
 *               location:
 *                 type: object
 *                 required:
 *                   - coordinates
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               temperature:
 *                 type: number
 *               humidity:
 *                 type: number
 *               rainfall:
 *                 type: number
 *               windSpeed:
 *                 type: number
 *               windDirection:
 *                 type: number
 *               pressure:
 *                 type: number
 *               source:
 *                 type: string
 *     responses:
 *       200:
 *         description: Weather reading recorded successfully
 *       400:
 *         description: Bad request
 */
router.post('/weather-readings', insuranceController.createWeatherReading);

export default router;