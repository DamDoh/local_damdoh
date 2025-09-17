import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFarm extends Document {
  owner: Types.ObjectId;
  name: string;
  location: {
    type: string;
    coordinates: number[];
  };
  size: {
    value: number;
    unit: string;
  };
  crops: Array<{
    name: string;
    variety: string;
    plantedArea: number;
    plantingDate: Date;
    expectedHarvestDate: Date;
    status: string;
  }>;
  soilData: {
    type: string;
    ph: number;
    organicMatter: number;
    lastTestedDate: Date;
  };
  irrigation: {
    type: string;
    source: string;
    schedule: string;
  };
  certifications: Array<{
    name: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    status: string;
  }>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const farmSchema = new Schema<IFarm>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
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
    },
    size: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['hectares', 'acres'],
        required: true,
      },
    },
    crops: [{
      name: {
        type: String,
        required: true,
      },
      variety: String,
      plantedArea: Number,
      plantingDate: Date,
      expectedHarvestDate: Date,
      status: {
        type: String,
        enum: ['planning', 'planted', 'growing', 'harvesting', 'completed'],
        default: 'planning',
      },
    }],
    soilData: {
      type: {
        type: String,
        enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'],
      },
      ph: Number,
      organicMatter: Number,
      lastTestedDate: Date,
    },
    irrigation: {
      type: {
        type: String,
        enum: ['drip', 'sprinkler', 'flood', 'center-pivot', 'other'],
      },
      source: {
        type: String,
        enum: ['well', 'river', 'rainwater', 'municipal', 'other'],
      },
      schedule: String,
    },
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      status: {
        type: String,
        enum: ['active', 'expired', 'pending', 'revoked'],
        default: 'pending',
      },
    }],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
farmSchema.index({ location: '2dsphere' });
farmSchema.index({ owner: 1 });
farmSchema.index({ 'crops.plantingDate': 1 });
farmSchema.index({ 'crops.expectedHarvestDate': 1 });
farmSchema.index({ 'certifications.expiryDate': 1 });

// Middleware to validate coordinates
farmSchema.pre('save', function(next) {
  if (this.isModified('location')) {
    const [longitude, latitude] = this.location.coordinates;
    
    if (longitude < -180 || longitude > 180) {
      next(new Error('Invalid longitude. Must be between -180 and 180.'));
    }
    
    if (latitude < -90 || latitude > 90) {
      next(new Error('Invalid latitude. Must be between -90 and 90.'));
    }
  }
  next();
});

export const Farm = mongoose.model<IFarm>('Farm', farmSchema);