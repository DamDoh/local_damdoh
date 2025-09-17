import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { AgroTourismController } from '../controllers/agroTourism.controller';
import { body } from 'express-validator';

const router = express.Router();
const agroTourismController = new AgroTourismController();

router.post('/services',
  requireAuth(),
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('price.amount').isNumeric(),
    body('price.currency').isLength({ min: 3, max: 3 }),
    body('price.perUnit').trim().notEmpty(),
    body('location.coordinates').isArray().isLength({ min: 2, max: 2 }),
    body('location.address').trim().notEmpty(),
    body('availability.startDate').isISO8601(),
    body('availability.endDate').isISO8601(),
    body('availability.maxGuests').isInt({ min: 1 }),
  ],
  agroTourismController.createService.bind(agroTourismController)
);

router.get('/services/seller/:sellerId',
  requireAuth(),
  agroTourismController.getServicesBySeller.bind(agroTourismController)
);

router.get('/services/:id',
  agroTourismController.getServiceById.bind(agroTourismController)
);

router.post('/bookings',
  requireAuth(),
  [
    body('serviceId').isMongoId(),
    body('bookingDetails.startDate').isISO8601(),
    body('bookingDetails.endDate').isISO8601(),
    body('bookingDetails.guests').isInt({ min: 1 }),
    body('bookingDetails.totalPrice').isNumeric(),
  ],
  agroTourismController.bookService.bind(agroTourismController)
);

router.get('/bookings/user',
  requireAuth(),
  agroTourismController.getUserBookings.bind(agroTourismController)
);

router.get('/bookings/service/:serviceId',
  requireAuth(),
  agroTourismController.getServiceBookings.bind(agroTourismController)
);

export default router;