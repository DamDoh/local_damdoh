import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAgroTourismBooking extends Document {
  service: Types.ObjectId; // Reference to marketplace listing
  user: Types.ObjectId;
  displayName: string;
  avatarUrl?: string;
  bookingDetails: {
    startDate?: Date;
    endDate?: Date;
    numberOfPeople?: number;
    specialRequests?: string;
    contactInfo?: {
      phone?: string;
      email?: string;
    };
  };
  bookedAt: Date;
  checkedIn: boolean;
  checkedInAt?: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice?: number;
  currency?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  notes?: string;
}

export interface IAgroTourismStaff extends Document {
  service: Types.ObjectId; // Reference to marketplace listing
  user: Types.ObjectId;
  displayName: string;
  avatarUrl?: string;
  role?: string;
  addedAt: Date;
  addedBy: Types.ObjectId;
  isActive: boolean;
}

const agroTourismBookingSchema = new Schema<IAgroTourismBooking>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
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
    bookingDetails: {
      startDate: Date,
      endDate: Date,
      numberOfPeople: {
        type: Number,
        min: 1,
      },
      specialRequests: {
        type: String,
        trim: true,
      },
      contactInfo: {
        phone: {
          type: String,
          trim: true,
        },
        email: {
          type: String,
          trim: true,
          lowercase: true,
        },
      },
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: Date,
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const agroTourismStaffSchema = new Schema<IAgroTourismStaff>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
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
    role: {
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
agroTourismBookingSchema.index({ service: 1, user: 1 }, { unique: true });
agroTourismBookingSchema.index({ service: 1, bookedAt: -1 });
agroTourismBookingSchema.index({ user: 1, bookedAt: -1 });
agroTourismBookingSchema.index({ service: 1, status: 1 });
agroTourismBookingSchema.index({ service: 1, checkedIn: 1 });

agroTourismStaffSchema.index({ service: 1, user: 1 }, { unique: true });
agroTourismStaffSchema.index({ service: 1, isActive: 1 });

// Middleware to update booking count on marketplace listing
agroTourismBookingSchema.post('save', async function(doc) {
  try {
    const Listing = mongoose.model('Listing');
    await Listing.findByIdAndUpdate(doc.service, {
      $inc: { bookingsCount: 1 },
    });
  } catch (error) {
    console.error('Error updating booking count after save:', error);
  }
});

agroTourismBookingSchema.post('findOneAndDelete', async function(doc) {
  try {
    if (doc) {
      const Listing = mongoose.model('Listing');
      await Listing.findByIdAndUpdate(doc.service, {
        $inc: { bookingsCount: -1 },
      });
    }
  } catch (error) {
    console.error('Error updating booking count after delete:', error);
  }
});

export const AgroTourismBooking = mongoose.model<IAgroTourismBooking>('AgroTourismBooking', agroTourismBookingSchema);
export const AgroTourismStaff = mongoose.model<IAgroTourismStaff>('AgroTourismStaff', agroTourismStaffSchema);