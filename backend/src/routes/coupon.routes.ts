import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { CouponController } from '../controllers/coupon.controller';
import { body } from 'express-validator';

const router = express.Router();
const couponController = new CouponController();

router.post('/validate',
  [
    body('couponCode').trim().notEmpty(),
    body('sellerId').isMongoId(),
  ],
  couponController.validateCoupon.bind(couponController)
);

router.post('/',
  requireAuth(),
  [
    body('code').trim().notEmpty(),
    body('type').isIn(['FIXED', 'PERCENTAGE']),
    body('value').isNumeric(),
    body('sellerId').isMongoId(),
  ],
  couponController.createCoupon.bind(couponController)
);

router.get('/seller/:sellerId',
  requireAuth(),
  couponController.getCouponsBySeller.bind(couponController)
);

export default router;