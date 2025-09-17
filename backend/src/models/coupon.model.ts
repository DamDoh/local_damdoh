import mongoose, { Document, Schema, Types } from 'mongoose';

export enum CouponType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export interface ICoupon extends Document {
  code: string;
  type: CouponType;
  value: number;
  sellerId: Types.ObjectId;
  maxUses?: number;
  usedCount: number;
  expirationDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: Object.values(CouponType),
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxUses: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expirationDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ sellerId: 1 });
couponSchema.index({ expirationDate: 1 });
couponSchema.index({ isActive: 1 });

// Middleware to check if coupon is expired
couponSchema.pre('find', function() {
  this.where({ 
    $or: [
      { expirationDate: { $gte: new Date() } },
      { expirationDate: { $exists: false } }
    ],
    isActive: true
  });
});

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);