import express from 'express';
import { AgriEventsController } from '../controllers/agri-events.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const agriEventsController = new AgriEventsController();

/**
 * @swagger
 * /api/agri-events:
 *   post:
 *     tags: [Agri-Events]
 *     summary: Create a new agricultural event
 *     description: Create a new agricultural event with registration and coupon support
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - eventDate
 *               - location
 *               - eventType
 *             properties:
 *               title:
 *                 type: string
 *                 description: Event title
 *               description:
 *                 type: string
 *                 description: Event description
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 description: Event date
 *               eventTime:
 *                 type: string
 *                 description: Event time
 *               location:
 *                 type: object
 *                 required:
 *                   - address
 *                 properties:
 *                   address:
 *                     type: string
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *               eventType:
 *                 type: string
 *                 enum: [CONFERENCE, WORKSHOP, SEMINAR, TRAINING, EXHIBITION, NETWORKING, FIELD_DAY, OTHER]
 *               organizer:
 *                 type: string
 *               websiteLink:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               registrationEnabled:
 *                 type: boolean
 *                 default: false
 *               attendeeLimit:
 *                 type: integer
 *               price:
 *                 type: number
 *                 default: 0
 *               currency:
 *                 type: string
 *                 default: USD
 *     responses:
 *       200:
 *         description: Agricultural event created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', requireAuth(), agriEventsController.createAgriEvent);

/**
 * @swagger
 * /api/agri-events:
 *   get:
 *     tags: [Agri-Events]
 *     summary: Get agricultural events
 *     description: Get all agricultural events with optional filtering
 *     parameters:
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [CONFERENCE, WORKSHOP, SEMINAR, TRAINING, EXHIBITION, NETWORKING, FIELD_DAY, OTHER]
 *         description: Filter by event type
 *       - in: query
 *         name: organizerId
 *         schema:
 *           type: string
 *         description: Filter by organizer ID
 *       - in: query
 *         name: registrationEnabled
 *         schema:
 *           type: boolean
 *         description: Filter by registration status
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter for upcoming events only
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
 *         description: Agricultural events retrieved successfully
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
 *                       title:
 *                         type: string
 *                       eventDate:
 *                         type: string
 *                       location:
 *                         type: object
 *                       eventType:
 *                         type: string
 *                       registrationEnabled:
 *                         type: boolean
 *                       price:
 *                         type: number
 *                       currency:
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
 *       400:
 *         description: Bad request
 */
router.get('/', agriEventsController.getAgriEvents);

/**
 * @swagger
 * /api/agri-events/{eventId}:
 *   get:
 *     tags: [Agri-Events]
 *     summary: Get event details
 *     description: Get detailed information about a specific agricultural event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 eventDate:
 *                   type: string
 *                 location:
 *                   type: object
 *                 registrationEnabled:
 *                   type: boolean
 *                 isRegistered:
 *                   type: boolean
 *       404:
 *         description: Event not found
 *       400:
 *         description: Bad request
 */
router.get('/:eventId', agriEventsController.getEventDetails);

/**
 * @swagger
 * /api/agri-events/{eventId}/register:
 *   post:
 *     tags: [Agri-Events]
 *     summary: Register for event
 *     description: Register for an agricultural event with optional coupon code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponCode:
 *                 type: string
 *                 description: Optional coupon code for discount
 *     responses:
 *       200:
 *         description: Successfully registered for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 finalPrice:
 *                   type: number
 *                 discountApplied:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Event not found
 */
router.post('/:eventId/register', requireAuth(), agriEventsController.registerForEvent);

/**
 * @swagger
 * /api/agri-events/{eventId}/checkin:
 *   post:
 *     tags: [Agri-Events]
 *     summary: Check in attendee
 *     description: Check in an attendee for an event (organizer/staff only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendeeId
 *             properties:
 *               attendeeId:
 *                 type: string
 *                 description: Attendee ID to check in
 *     responses:
 *       200:
 *         description: Attendee checked in successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not organizer or staff
 *       404:
 *         description: Event or attendee not found
 *       400:
 *         description: Bad request
 */
router.post('/:eventId/checkin', requireAuth(), agriEventsController.checkInAttendee);

/**
 * @swagger
 * /api/agri-events/{eventId}/attendees:
 *   get:
 *     tags: [Agri-Events]
 *     summary: Get event attendees
 *     description: Get list of attendees for an event (organizer/staff only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
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
 *         description: Event attendees retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not organizer or staff
 *       404:
 *         description: Event not found
 */
router.get('/:eventId/attendees', requireAuth(), agriEventsController.getEventAttendees);

/**
 * @swagger
 * /api/agri-events/{eventId}/coupons:
 *   post:
 *     tags: [Agri-Events]
 *     summary: Create event coupon
 *     description: Create a coupon for an event (organizer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountType
 *               - discountValue
 *             properties:
 *               code:
 *                 type: string
 *                 description: Coupon code
 *               discountType:
 *                 type: string
 *                 enum: [FIXED, PERCENTAGE]
 *               discountValue:
 *                 type: number
 *                 description: Discount value
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               usageLimit:
 *                 type: integer
 *                 description: Maximum usage count
 *     responses:
 *       200:
 *         description: Event coupon created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not organizer
 *       400:
 *         description: Bad request
 */
router.post('/:eventId/coupons', requireAuth(), agriEventsController.createEventCoupon);

/**
 * @swagger
 * /api/agri-events/{eventId}/coupons:
 *   get:
 *     tags: [Agri-Events]
 *     summary: Get event coupons
 *     description: Get all coupons for an event (organizer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event coupons retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not organizer
 *       404:
 *         description: Event not found
 */
router.get('/:eventId/coupons', requireAuth(), agriEventsController.getEventCoupons);

/**
 * @swagger
 * /api/agri-events/{eventId}/staff:
 *   post:
 *     tags: [Agri-Events]
 *     summary: Add event staff
 *     description: Add a user as staff for an event (organizer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
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
 *     responses:
 *       200:
 *         description: Staff member added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not organizer
 *       404:
 *         description: Event or user not found
 *       400:
 *         description: Bad request
 */
router.post('/:eventId/staff', requireAuth(), agriEventsController.addEventStaff);

/**
 * @swagger
 * /api/agri-events/{eventId}/staff:
 *   get:
 *     tags: [Agri-Events]
 *     summary: Get event staff
 *     description: Get all staff members for an event (organizer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event staff retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not organizer
 *       404:
 *         description: Event not found
 */
router.get('/:eventId/staff', requireAuth(), agriEventsController.getEventStaff);

/**
 * @swagger
 * /api/agri-events/{eventId}/staff:
 *   delete:
 *     tags: [Agri-Events]
 *     summary: Remove event staff
 *     description: Remove a staff member from an event (organizer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
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
 *         description: Forbidden - not organizer
 *       404:
 *         description: Event or staff member not found
 *       400:
 *         description: Bad request
 */
router.delete('/:eventId/staff', requireAuth(), agriEventsController.removeEventStaff);

export default router;