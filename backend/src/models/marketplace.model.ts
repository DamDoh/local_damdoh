import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ListingType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  EQUIPMENT = 'EQUIPMENT',
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface IListing extends Document {
  seller: Types.ObjectId;
  type: ListingType;
  title: string;
  description: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    unit?: string;
  };
  quantity: {
    available: number;
    unit: string;
  };
  images: string[];
  location: {
    type: string;
    coordinates: number[];
  };
  specifications?: Record<string, any>;
  certifications?: Array<{
    name: string;
    issuedBy: string;
    verificationUrl?: string;
  }>;
  status: ListingStatus;
  visibility: boolean;
  expiryDate?: Date;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends Document {
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  listing: Types.ObjectId;
  quantity: number;
  totalPrice: {
    amount: number;
    currency: string;
  };
  status: OrderStatus;
  paymentId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShop extends Document {
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  stakeholderType: string;
  createdAt: Date;
  updatedAt: Date;
  logoUrl?: string;
  bannerUrl?: string;
  contactInfo?: Record<string, any>;
  itemCount: number;
  rating: number;
}

const listingSchema = new Schema<IListing>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ListingType),
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
    category: {
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
      unit: String,
    },
    quantity: {
      available: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        required: true,
      },
    },
    images: [String],
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
    },
    specifications: Schema.Types.Mixed,
    certifications: [{
      name: String,
      issuedBy: String,
      verificationUrl: String,
    }],
    status: {
      type: String,
      enum: Object.values(ListingStatus),
      default: ListingStatus.DRAFT,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
    expiryDate: Date,
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const orderSchema = new Schema<IOrder>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    quantity: {
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
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentId: String,
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    deliveryDate: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
listingSchema.index({ seller: 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ location: '2dsphere' });
listingSchema.index({ status: 1 });
listingSchema.index({ 'price.amount': 1 });
listingSchema.index({ createdAt: -1 });

orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ listing: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for calculating time until expiry
listingSchema.virtual('timeUntilExpiry').get(function(this: IListing) {
  if (!this.expiryDate) return null;
  return this.expiryDate.getTime() - Date.now();
});

// Middleware to check quantity and update status
listingSchema.pre('save', function(next) {
  if (this.quantity.available <= 0) {
    this.status = ListingStatus.SOLD;
  }
  next();
});

export const Listing = mongoose.model<IListing>('Listing', listingSchema);
export const Order = mongoose.model<IOrder>('Order', orderSchema);

const shopSchema = new Schema<IShop>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    stakeholderType: {
      type: String,
      required: true,
    },
    logoUrl: String,
    bannerUrl: String,
    contactInfo: Schema.Types.Mixed,
    itemCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

shopSchema.index({ ownerId: 1 });

export const Shop = mongoose.model<IShop>('Shop', shopSchema);