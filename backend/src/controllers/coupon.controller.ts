import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Coupon, ICoupon } from '../models/coupon.model';
import { logger } from '../utils/logger';

export class CouponController {
  private couponController: BaseController<ICoupon>;

  constructor() {
    this.couponController = new BaseController(Coupon);
  }

  async validateCoupon(req: Request, res: Response) {
    try {
      const { couponCode, sellerId } = req.body;

      // Find active coupon with the given code and seller
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        sellerId,
        isActive: true,
        $or: [
          { expirationDate: { $gte: new Date() } },
          { expirationDate: { $exists: false } }
        ]
      });

      if (!coupon) {
        return res.status(404).json({ 
          valid: false, 
          message: 'Coupon not found or expired' 
        });
      }

      // Check if coupon has reached max uses
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ 
          valid: false, 
          message: 'Coupon has reached maximum uses' 
        });
      }

      res.json({
        valid: true,
        code: coupon.code,
        discountType: coupon.type,
        discountValue: coupon.value,
        message: 'Coupon is valid'
      });
    } catch (error) {
      logger.error('Error validating coupon:', error);
      res.status(500).json({ error: 'Failed to validate coupon' });
    }
  }

  async createCoupon(req: Request, res: Response) {
    try {
      const couponData = req.body;
      const coupon = new Coupon(couponData);
      await coupon.save();
      res.status(201).json(coupon);
    } catch (error) {
      logger.error('Error creating coupon:', error);
      res.status(500).json({ error: 'Failed to create coupon' });
    }
  }

  async getCouponsBySeller(req: Request, res: Response) {
    try {
      const { sellerId } = req.params;
      const coupons = await Coupon.find({ sellerId });
      res.json(coupons);
    } catch (error) {
      logger.error('Error fetching coupons:', error);
      res.status(500).json({ error: 'Failed to fetch coupons' });
    }
  }
}