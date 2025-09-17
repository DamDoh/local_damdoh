import express from 'express';
import { AgroTourismController } from '../controllers/agro-tourism.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const agroTourismController = new AgroTourismController();

/**
 * @swagger
 * /api/agro-tourism/book:
 *   post:
 *     tags: [Agro-Tourism]
 *     summary: Book an agro-tourism service
 *     description: Book an agricultural tourism service with booking details
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
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: Service listing ID
 *               bookingDetails:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   numberOfPeople:
 *                     type: integer
 *                     minimum: 1
 *                   specialRequests:
 *                     type: string
 *                   contactInfo:
 *                     type: object
 *                     properties:
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *     responses:
 *       200:
 *         description: Service booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 bookingId:
 *                   type: string
 *                 totalPrice:
 *                   type: number
 *                 currency:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Service not found
 */
router.post('/book', requireAuth(), agroTourismController.bookAgroTourismService);

/**
 * @swagger
 * /api/agro-tourism/checkin:
 *   post:
 *     tags: [Agro-Tourism]
 *     summary: Check in booking
 *     description: Check in a guest for an agro-tourism service (provider/staff only)
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
 *               - attendeeId
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: Service listing ID
 *               attendeeId:
 *                 type: string
 *                 description: User ID of the attendee to check in
 *     responses:
 *       200:
 *         description: Attendee checked in successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not provider or staff
 *       404:
 *         description: Service or attendee not found
 *       400:
 *         description: Bad request
 */
router.post('/checkin', requireAuth(), agroTourismController.checkInAgroTourismBooking);

/**
 * @swagger
 * /api/agro-tourism/{itemId}/staff:
 *   post:
 *     tags: [Agro-Tourism]
 *     summary: Add service staff
 *     description: Add a user as staff for an agro-tourism service (provider only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffUserId
 *             properties:
 *               staffUserId:
 *                 type: string
 *                 description: User ID to add as staff
 *               staffDisplayName:
 *                 type: string
 *                 description: Display name for staff member
 *               staffAvatarUrl:
 *                 type: string
 *                 description: Avatar URL for staff member
 *               role:
 *                 type: string
 *                 description: Staff role
 *     responses:
 *       200:
 *         description: Staff member added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not provider
 *       404:
 *         description: Service or user not found
 *       400:
 *         description: Bad request
 */
router.post('/:itemId/staff', requireAuth(), agroTourismController.addAgroTourismStaff);

/**
 * @swagger
 * /api/agro-tourism/{itemId}/staff:
 *   get:
 *     tags: [Agro-Tourism]
 *     summary: Get service staff
 *     description: Get all staff members for an agro-tourism service (provider only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service listing ID
 *     responses:
 *       200:
 *         description: Service staff retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 staff:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 *                       role:
 *                         type: string
 *                       addedAt:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not provider
 *       404:
 *         description: Service not found
 */
router.get('/:itemId/staff', requireAuth(), agroTourismController.getAgroTourismStaff);

/**
 * @swagger
 * /api/agro-tourism/{itemId}/staff:
 *   delete:
 *     tags: [Agro-Tourism]
 *     summary: Remove service staff
 *     description: Remove a staff member from an agro-tourism service (provider only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffUserId
 *             properties:
 *               staffUserId:
 *                 type: string
 *                 description: User ID to remove from staff
 *     responses:
 *       200:
 *         description: Staff member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not provider
 *       404:
 *         description: Service or staff member not found
 *       400:
 *         description: Bad request
 */
router.delete('/:itemId/staff', requireAuth(), agroTourismController.removeAgroTourismStaff);

/**
 * @swagger
 * /api/agro-tourism/{itemId}/bookings:
 *   get:
 *     tags: [Agro-Tourism]
 *     summary: Get service bookings
 *     description: Get all bookings for an agro-tourism service (provider only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service listing ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filter by booking status
 *       - in: query
 *         name: checkedIn
 *         schema:
 *           type: boolean
 *         description: Filter by check-in status
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
 *         description: Service bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 *                       bookingDetails:
 *                         type: object
 *                       bookedAt:
 *                         type: string
 *                       checkedIn:
 *                         type: boolean
 *                       checkedInAt:
 *                         type: string
 *                       status:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       paymentStatus:
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
 *       403:
 *         description: Forbidden - not provider
 *       404:
 *         description: Service not found
 */
router.get('/:itemId/bookings', requireAuth(), agroTourismController.getAgroTourismBookings);

/**
 * @swagger
 * /api/agro-tourism/my-bookings:
 *   get:
 *     tags: [Agro-Tourism]
 *     summary: Get user bookings
 *     description: Get all agro-tourism bookings for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filter by booking status
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter for upcoming bookings only
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
 *         description: User bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       service:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: object
 *                           currency:
 *                             type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                       bookingDetails:
 *                         type: object
 *                       bookedAt:
 *                         type: string
 *                       checkedIn:
 *                         type: boolean
 *                       checkedInAt:
 *                         type: string
 *                       status:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       paymentStatus:
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
 */
router.get('/my-bookings', requireAuth(), agroTourismController.getUserAgroTourismBookings);

export default router;