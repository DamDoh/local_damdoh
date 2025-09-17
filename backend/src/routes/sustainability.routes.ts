import express from 'express';
import { SustainabilityController } from '../controllers/sustainability.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const sustainabilityController = new SustainabilityController();

/**
 * @swagger
 * /api/sustainability/dashboard:
 *   get:
 *     tags: [Sustainability]
 *     summary: Get sustainability dashboard data
 *     description: Get comprehensive sustainability metrics and data for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *         description: Time period for data aggregation
 *     responses:
 *       200:
 *         description: Sustainability dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 carbonFootprint:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     trend:
 *                       type: number
 *                     count:
 *                       type: integer
 *                 waterUsage:
 *                   type: object
 *                   properties:
 *                     efficiency:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     trend:
 *                       type: number
 *                 biodiversityScore:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     trend:
 *                       type: number
 *                 sustainablePractices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       practice:
 *                         type: string
 *                       lastLogged:
 *                         type: string
 *                       category:
 *                         type: string
 *                       impact:
 *                         type: object
 *                 certifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       expiry:
 *                         type: string
 *                       issuingBody:
 *                         type: string
 *                       category:
 *                         type: string
 *                 period:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                     end:
 *                       type: string
 *                     type:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', requireAuth(), sustainabilityController.getSustainabilityDashboardData);

/**
 * @swagger
 * /api/sustainability/carbon-footprint:
 *   post:
 *     tags: [Sustainability]
 *     summary: Calculate carbon footprint
 *     description: Calculate carbon footprint from traceability event data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - eventData
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: Unique event identifier
 *               eventData:
 *                 type: object
 *                 properties:
 *                   eventType:
 *                     type: string
 *                     enum: [INPUT_APPLIED, TRANSPORTED]
 *                   vtiId:
 *                     type: string
 *                   userRef:
 *                     type: string
 *                   actorRef:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   payload:
 *                     type: object
 *                     properties:
 *                       inputType:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       unit:
 *                         type: string
 *                       distance:
 *                         type: number
 *                       transport_mode:
 *                         type: string
 *     responses:
 *       200:
 *         description: Carbon footprint calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 emissions:
 *                   type: number
 *                 unit:
 *                   type: string
 *                 carbonDataId:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/carbon-footprint', requireAuth(), sustainabilityController.calculateCarbonFootprint);

/**
 * @swagger
 * /api/sustainability/practices:
 *   post:
 *     tags: [Sustainability]
 *     summary: Add sustainable practice
 *     description: Add a sustainable farming practice for tracking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - practice
 *               - category
 *             properties:
 *               practice:
 *                 type: string
 *                 description: Name of the sustainable practice
 *               description:
 *                 type: string
 *                 description: Description of the practice
 *               category:
 *                 type: string
 *                 description: Category of the practice
 *               frequency:
 *                 type: string
 *                 description: How often the practice is performed
 *               impact:
 *                 type: object
 *                 properties:
 *                   carbonReduction:
 *                     type: number
 *                   waterSavings:
 *                     type: number
 *                   biodiversityScore:
 *                     type: number
 *     responses:
 *       201:
 *         description: Sustainable practice added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/practices', requireAuth(), sustainabilityController.addSustainablePractice);

/**
 * @swagger
 * /api/sustainability/practices:
 *   get:
 *     tags: [Sustainability]
 *     summary: Get sustainable practices
 *     description: Get all sustainable practices for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by practice category
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Sustainable practices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 practices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       practice:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       lastLogged:
 *                         type: string
 *                       frequency:
 *                         type: string
 *                       impact:
 *                         type: object
 *                       isActive:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/practices', requireAuth(), sustainabilityController.getSustainablePractices);

/**
 * @swagger
 * /api/sustainability/certifications:
 *   post:
 *     tags: [Sustainability]
 *     summary: Add certification
 *     description: Add a sustainability certification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - issuingBody
 *               - category
 *               - issueDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Certification name
 *               issuingBody:
 *                 type: string
 *                 description: Organization that issued the certification
 *               certificationNumber:
 *                 type: string
 *                 description: Certification number
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 description: Date when certification was issued
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Date when certification expires
 *               category:
 *                 type: string
 *                 description: Certification category
 *               documentUrl:
 *                 type: string
 *                 description: URL to certification document
 *               verificationUrl:
 *                 type: string
 *                 description: URL for verification
 *     responses:
 *       201:
 *         description: Certification added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/certifications', requireAuth(), sustainabilityController.addCertification);

/**
 * @swagger
 * /api/sustainability/certifications:
 *   get:
 *     tags: [Sustainability]
 *     summary: Get certifications
 *     description: Get all certifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Expired, Pending, Suspended]
 *         description: Filter by certification status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by certification category
 *     responses:
 *       200:
 *         description: Certifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 certifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       issuingBody:
 *                         type: string
 *                       certificationNumber:
 *                         type: string
 *                       status:
 *                         type: string
 *                       issueDate:
 *                         type: string
 *                       expiryDate:
 *                         type: string
 *                       category:
 *                         type: string
 *                       documentUrl:
 *                         type: string
 *                       verificationUrl:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/certifications', requireAuth(), sustainabilityController.getCertifications);

export default router;