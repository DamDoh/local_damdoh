import mongoose, { Document, Schema, Types } from 'mongoose';

export enum EmissionFactorType {
  INPUT_APPLIED = 'INPUT_APPLIED',
  TRANSPORTED = 'TRANSPORTED',
  ENERGY_USE = 'ENERGY_USE',
  WASTE = 'WASTE',
}

export enum EmissionUnit {
  KG_CO2E = 'kg CO2e',
  TON_CO2E = 'ton CO2e',
  G_CO2E = 'g CO2e',
}

export interface IEmissionFactor extends Document {
  region: string;
  activityType: EmissionFactorType;
  inputType?: string;
  factorType?: string;
  value: number;
  unit: EmissionUnit;
  source: string;
  year: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICarbonFootprintData extends Document {
  vtiId?: string;
  user: Types.ObjectId;
  eventType: string;
  eventRef?: Types.ObjectId; // Reference to traceability event
  timestamp: Date;
  calculatedEmissions: number;
  unit: EmissionUnit;
  emissionFactorUsed: {
    factorId: Types.ObjectId;
    value: number;
    unit: EmissionUnit;
    source: string;
  };
  dataSource: string;
  region: string;
  details: Record<string, any>;
  category: string;
  subcategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISustainablePractice extends Document {
  user: Types.ObjectId;
  practice: string;
  description?: string;
  category: string;
  lastLogged: Date;
  frequency?: string; // daily, weekly, monthly
  impact?: {
    carbonReduction?: number;
    waterSavings?: number;
    biodiversityScore?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertification extends Document {
  user: Types.ObjectId;
  name: string;
  issuingBody: string;
  certificationNumber?: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Suspended';
  issueDate: Date;
  expiryDate?: Date;
  documentUrl?: string;
  verificationUrl?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const emissionFactorSchema = new Schema<IEmissionFactor>(
  {
    region: {
      type: String,
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: Object.values(EmissionFactorType),
      required: true,
      index: true,
    },
    inputType: {
      type: String,
      index: true,
    },
    factorType: {
      type: String,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: Object.values(EmissionUnit),
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
emissionFactorSchema.index({ region: 1, activityType: 1, inputType: 1 });
emissionFactorSchema.index({ region: 1, activityType: 1, factorType: 1 });

const carbonFootprintDataSchema = new Schema<ICarbonFootprintData>(
  {
    vtiId: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    eventRef: {
      type: Schema.Types.ObjectId,
      ref: 'TraceabilityEvent',
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    calculatedEmissions: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: Object.values(EmissionUnit),
      required: true,
    },
    emissionFactorUsed: {
      factorId: {
        type: Schema.Types.ObjectId,
        ref: 'EmissionFactor',
      },
      value: Number,
      unit: {
        type: String,
        enum: Object.values(EmissionUnit),
      },
      source: String,
    },
    dataSource: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient aggregation queries
carbonFootprintDataSchema.index({ user: 1, timestamp: -1 });
carbonFootprintDataSchema.index({ user: 1, category: 1 });
carbonFootprintDataSchema.index({ user: 1, region: 1 });
carbonFootprintDataSchema.index({ timestamp: -1 });

const sustainablePracticeSchema = new Schema<ISustainablePractice>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    practice: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      required: true,
      index: true,
    },
    lastLogged: {
      type: Date,
      required: true,
    },
    frequency: String,
    impact: {
      carbonReduction: Number,
      waterSavings: Number,
      biodiversityScore: Number,
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

const certificationSchema = new Schema<ICertification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    issuingBody: {
      type: String,
      required: true,
    },
    certificationNumber: String,
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Pending', 'Suspended'],
      required: true,
      default: 'Active',
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expiryDate: Date,
    documentUrl: String,
    verificationUrl: String,
    category: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
sustainablePracticeSchema.index({ user: 1, category: 1 });
sustainablePracticeSchema.index({ user: 1, lastLogged: -1 });
certificationSchema.index({ user: 1, status: 1 });
certificationSchema.index({ user: 1, expiryDate: 1 });

export const EmissionFactor = mongoose.model<IEmissionFactor>('EmissionFactor', emissionFactorSchema);
export const CarbonFootprintData = mongoose.model<ICarbonFootprintData>('CarbonFootprintData', carbonFootprintDataSchema);
export const SustainablePractice = mongoose.model<ISustainablePractice>('SustainablePractice', sustainablePracticeSchema);
export const Certification = mongoose.model<ICertification>('Certification', certificationSchema);