import mongoose, { Document, Schema, Types } from 'mongoose';

export enum AgroTourismBookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface IAgroTourismService extends Document {
  sellerId: Types.ObjectId;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    perUnit: string; // e.g., "per night", "per person"
  };
  location: {
    type: string;
    coordinates: number[];
    address: string;
  };
  availability: {
    startDate: Date;
    endDate: Date;
    maxGuests: number;
  };
  amenities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgroTourismBooking extends Document {
  serviceId: Types.ObjectId;
  userId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  guests: number;
  totalPrice: {
    amount: number;
    currency: string;
  };
  status: AgroTourismBookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const agroTourismServiceSchema = new Schema<IAgroTourismService>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        required: true,
      },
      perUnit: {
        type: String,
        required: true,
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    availability: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      maxGuests: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    amenities: [String],
    images: [String],
  },
  {
    timestamps: true,
  }
);

const agroTourismBookingSchema = new Schema<IAgroTourismBooking>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'AgroTourismService',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(AgroTourismBookingStatus),
      default: AgroTourismBookingStatus.PENDING,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
agroTourismServiceSchema.index({ sellerId: 1 });
agroTourismServiceSchema.index({ location: '2dsphere' });
agroTourismServiceSchema.index({ 'availability.startDate': 1, 'availability.endDate': 1 });

agroTourismBookingSchema.index({ serviceId: 1 });
agroTourismBookingSchema.index({ userId: 1 });
agroTourismBookingSchema.index({ status: 1 });
agroTourismBookingSchema.index({ startDate: 1, endDate: 1 });

export const AgroTourismService = mongoose.model<IAgroTourismService>('AgroTourismService', agroTourismServiceSchema);
export const AgroTourismBooking = mongoose.model<IAgroTourismBooking>('AgroTourismBooking', agroTourismBookingSchema);