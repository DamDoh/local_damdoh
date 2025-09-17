import mongoose, { Document, Schema, Types } from 'mongoose';

export enum EventType {
  CONFERENCE = 'CONFERENCE',
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  TRAINING = 'TRAINING',
  EXHIBITION = 'EXHIBITION',
  NETWORKING = 'NETWORKING',
  FIELD_DAY = 'FIELD_DAY',
  OTHER = 'OTHER',
}

export enum CouponDiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export interface IAgriEvent extends Document {
  title: string;
  description: string;
  eventDate: Date;
  eventTime?: string;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  eventType: EventType;
  organizer?: string;
  organizerId: Types.ObjectId;
  listerId: Types.ObjectId;
  websiteLink?: string;
  imageUrl?: string;
  registrationEnabled: boolean;
  attendeeLimit?: number;
  registeredAttendeesCount: number;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventAttendee extends Document {
  event: Types.ObjectId;
  user: Types.ObjectId;
  email: string;
  displayName: string;
  avatarUrl?: string;
  registeredAt: Date;
  checkedIn: boolean;
  checkedInAt?: Date;
  couponUsed?: string;
  discountApplied?: number;
  finalPrice?: number;
}

export interface IEventCoupon extends Document {
  event: Types.ObjectId;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  expiresAt?: Date;
  usageLimit?: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventStaff extends Document {
  event: Types.ObjectId;
  user: Types.ObjectId;
  displayName: string;
  avatarUrl?: string;
  addedAt: Date;
  addedBy: Types.ObjectId;
}

const agriEventSchema = new Schema<IAgriEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    eventType: {
      type: String,
      enum: Object.values(EventType),
      required: true,
    },
    organizer: {
      type: String,
      trim: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    websiteLink: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    registrationEnabled: {
      type: Boolean,
      default: false,
    },
    attendeeLimit: {
      type: Number,
      min: 1,
    },
    registeredAttendeesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  {
    timestamps: true,
  }
);

const eventAttendeeSchema = new Schema<IEventAttendee>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'AgriEvent',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: Date,
    couponUsed: {
      type: String,
      trim: true,
    },
    discountApplied: {
      type: Number,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const eventCouponSchema = new Schema<IEventCoupon>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'AgriEvent',
      required: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: Object.values(CouponDiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    expiresAt: Date,
    usageLimit: {
      type: Number,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const eventStaffSchema = new Schema<IEventStaff>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'AgriEvent',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
agriEventSchema.index({ organizerId: 1 });
agriEventSchema.index({ listerId: 1 });
agriEventSchema.index({ eventDate: 1 });
agriEventSchema.index({ 'location.coordinates': '2dsphere' });
agriEventSchema.index({ eventType: 1 });
agriEventSchema.index({ registrationEnabled: 1 });

eventAttendeeSchema.index({ event: 1, user: 1 }, { unique: true });
eventAttendeeSchema.index({ event: 1, checkedIn: 1 });
eventAttendeeSchema.index({ user: 1 });

eventCouponSchema.index({ event: 1, code: 1 }, { unique: true });
eventCouponSchema.index({ event: 1 });
eventCouponSchema.index({ expiresAt: 1 });

eventStaffSchema.index({ event: 1, user: 1 }, { unique: true });
eventStaffSchema.index({ event: 1 });

// Middleware to update attendee count
eventAttendeeSchema.post('save', async function(doc) {
  try {
    const AgriEvent = mongoose.model('AgriEvent');
    await AgriEvent.findByIdAndUpdate(doc.event, {
      $inc: { registeredAttendeesCount: 1 },
    });
  } catch (error) {
    console.error('Error updating attendee count after save:', error);
  }
});

eventAttendeeSchema.post('findOneAndDelete', async function(doc) {
  try {
    if (doc) {
      const AgriEvent = mongoose.model('AgriEvent');
      await AgriEvent.findByIdAndUpdate(doc.event, {
        $inc: { registeredAttendeesCount: -1 },
      });
    }
  } catch (error) {
    console.error('Error updating attendee count after delete:', error);
  }
});

// Middleware to update coupon usage
eventAttendeeSchema.post('save', async function(doc) {
  try {
    if (doc.couponUsed) {
      const EventCoupon = mongoose.model('EventCoupon');
      await EventCoupon.findOneAndUpdate(
        { event: doc.event, code: doc.couponUsed },
        { $inc: { usageCount: 1 } }
      );
    }
  } catch (error) {
    console.error('Error updating coupon usage after attendee save:', error);
  }
});

export const AgriEvent = mongoose.model<IAgriEvent>('AgriEvent', agriEventSchema);
export const EventAttendee = mongoose.model<IEventAttendee>('EventAttendee', eventAttendeeSchema);
export const EventCoupon = mongoose.model<IEventCoupon>('EventCoupon', eventCouponSchema);
export const EventStaff = mongoose.model<IEventStaff>('EventStaff', eventStaffSchema);