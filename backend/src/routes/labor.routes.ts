import express from 'express';
import { LaborController } from '../controllers/labor.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const laborController = new LaborController();

/**
 * @swagger
 * /api/labor/workers:
 *   post:
 *     tags: [Labor]
 *     summary: Add a new worker
 *     description: Create a new worker profile for farm labor management
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Worker name
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   address:
 *                     type: string
 *               payRate:
 *                 type: number
 *                 description: Pay rate per unit
 *               payRateUnit:
 *                 type: string
 *                 enum: [hour, day, week, month]
 *     responses:
 *       200:
 *         description: Worker added successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/workers', requireAuth(), laborController.addWorker);

/**
 * @swagger
 * /api/labor/workers:
 *   get:
 *     tags: [Labor]
 *     summary: Get all workers
 *     description: Get all active workers for the authenticated farmer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workers retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/workers', requireAuth(), laborController.getWorkers);

/**
 * @swagger
 * /api/labor/hours:
 *   post:
 *     tags: [Labor]
 *     summary: Log hours worked
 *     description: Log hours worked by a worker
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerId
 *               - hours
 *               - date
 *             properties:
 *               workerId:
 *                 type: string
 *                 description: Worker ID
 *               hours:
 *                 type: number
 *                 minimum: 0
 *               date:
 *                 type: string
 *                 format: date
 *               taskDescription:
 *                 type: string
 *                 default: General farm work
 *     responses:
 *       200:
 *         description: Hours logged successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Worker not found
 */
router.post('/hours', requireAuth(), laborController.logHours);

/**
 * @swagger
 * /api/labor/payments:
 *   post:
 *     tags: [Labor]
 *     summary: Log payment to worker
 *     description: Log a payment made to a worker (automatically creates financial transaction)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerId
 *               - amount
 *               - currency
 *               - date
 *             properties:
 *               workerId:
 *                 type: string
 *                 description: Worker ID
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 default: USD
 *               date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *                 default: Payment for services rendered
 *     responses:
 *       200:
 *         description: Payment logged successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Worker not found
 */
router.post('/payments', requireAuth(), laborController.logPayment);

/**
 * @swagger
 * /api/labor/workers/{workerId}:
 *   get:
 *     tags: [Labor]
 *     summary: Get worker details
 *     description: Get detailed information about a worker including work logs and payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     contactInfo:
 *                       type: object
 *                     payRate:
 *                       type: number
 *                     payRateUnit:
 *                       type: string
 *                     totalHoursLogged:
 *                       type: number
 *                     totalPaid:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                 workLogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       hours:
 *                         type: number
 *                       date:
 *                         type: string
 *                       taskDescription:
 *                         type: string
 *                       isPaid:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       date:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 */
router.get('/workers/:workerId', requireAuth(), laborController.getWorkerDetails);

/**
 * @swagger
 * /api/labor/workers/{workerId}/worklogs:
 *   get:
 *     tags: [Labor]
 *     summary: Get work logs for worker
 *     description: Get work logs for a specific worker with optional date filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *     responses:
 *       200:
 *         description: Work logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 */
router.get('/workers/:workerId/worklogs', requireAuth(), laborController.getWorkLogs);

/**
 * @swagger
 * /api/labor/workers/{workerId}/payments:
 *   get:
 *     tags: [Labor]
 *     summary: Get payments for worker
 *     description: Get payment records for a specific worker with optional date filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 */
router.get('/workers/:workerId/payments', requireAuth(), laborController.getPayments);

export default router;