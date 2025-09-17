import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
}

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface IInsurancePolicy extends Document {
  policyId: string;
  policyholder: Types.ObjectId;
  insurer: Types.ObjectId;
  coverageAmount: number;
  currency: string;
  premium: number;
  status: PolicyStatus;
  startDate: Date;
  endDate: Date;
  insuredAssets: Array<{
    type: string;
    asset: Types.ObjectId;
  }>;
  parametricThresholds?: {
    rainfall?: {
      threshold: number;
      periodHours: number;
      payoutPercentage: number;
    };
    temperature?: {
      threshold: number;
      periodHours: number;
      payoutPercentage: number;
    };
  };
  riskAssessment?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInsuranceClaim extends Document {
  claimId: string;
  policy: Types.ObjectId;
  policyholder: Types.ObjectId;
  insurer: Types.ObjectId;
  incidentDate: Date;
  submissionDate: Date;
  status: ClaimStatus;
  claimedAmount: number;
  currency: string;
  description: string;
  supportingDocumentsUrls?: string[];
  assessmentDetails?: any;
  payoutAmount?: number;
  payoutDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRiskAssessment extends Document {
  assessmentId: string;
  user: Types.ObjectId;
  policy: Types.ObjectId;
  assessmentDate: Date;
  score: number;
  riskFactors: string[];
  aiModelVersion: string;
  recommendations: {
    en: string[];
    local?: { [key: string]: string[] };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IWeatherReading extends Document {
  location: {
    type: string;
    coordinates: number[];
  };
  timestamp: Date;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  windSpeed?: number;
  windDirection?: number;
  pressure?: number;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const insurancePolicySchema = new Schema<IInsurancePolicy>(
  {
    policyId: {
      type: String,
      required: true,
      unique: true,
    },
    policyholder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    insurer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverageAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    premium: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PolicyStatus),
      default: PolicyStatus.ACTIVE,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    insuredAssets: [{
      type: {
        type: String,
        required: true,
      },
      asset: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'insuredAssets.type',
      },
    }],
    parametricThresholds: {
      rainfall: {
        threshold: Number,
        periodHours: Number,
        payoutPercentage: Number,
      },
      temperature: {
        threshold: Number,
        periodHours: Number,
        payoutPercentage: Number,
      },
    },
    riskAssessment: {
      type: Schema.Types.ObjectId,
      ref: 'RiskAssessment',
    },
  },
  {
    timestamps: true,
  }
);

const insuranceClaimSchema = new Schema<IInsuranceClaim>(
  {
    claimId: {
      type: String,
      required: true,
      unique: true,
    },
    policy: {
      type: Schema.Types.ObjectId,
      ref: 'InsurancePolicy',
      required: true,
    },
    policyholder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    insurer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    incidentDate: {
      type: Date,
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(ClaimStatus),
      default: ClaimStatus.PENDING,
    },
    claimedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    description: {
      type: String,
      required: true,
    },
    supportingDocumentsUrls: [String],
    assessmentDetails: Schema.Types.Mixed,
    payoutAmount: {
      type: Number,
      min: 0,
    },
    payoutDate: Date,
  },
  {
    timestamps: true,
  }
);

const riskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    assessmentId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    policy: {
      type: Schema.Types.ObjectId,
      ref: 'InsurancePolicy',
      required: true,
    },
    assessmentDate: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    riskFactors: [{
      type: String,
    }],
    aiModelVersion: {
      type: String,
      default: 'v1.0',
    },
    recommendations: {
      en: [{
        type: String,
      }],
      local: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const weatherReadingSchema = new Schema<IWeatherReading>(
  {
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
    timestamp: {
      type: Date,
      required: true,
    },
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    windSpeed: Number,
    windDirection: Number,
    pressure: Number,
    source: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
insurancePolicySchema.index({ policyholder: 1, status: 1 });
insurancePolicySchema.index({ insurer: 1, status: 1 });
insurancePolicySchema.index({ startDate: 1, endDate: 1 });

insuranceClaimSchema.index({ policy: 1, status: 1 });
insuranceClaimSchema.index({ policyholder: 1, status: 1 });
insuranceClaimSchema.index({ insurer: 1, status: 1 });
insuranceClaimSchema.index({ incidentDate: -1 });

riskAssessmentSchema.index({ user: 1, assessmentDate: -1 });
riskAssessmentSchema.index({ policy: 1 });

weatherReadingSchema.index({ location: '2dsphere' });
weatherReadingSchema.index({ timestamp: -1 });
weatherReadingSchema.index({ source: 1 });

export const InsurancePolicy = mongoose.model<IInsurancePolicy>('InsurancePolicy', insurancePolicySchema);
export const InsuranceClaim = mongoose.model<IInsuranceClaim>('InsuranceClaim', insuranceClaimSchema);
export const RiskAssessment = mongoose.model<IRiskAssessment>('RiskAssessment', riskAssessmentSchema);
export const WeatherReading = mongoose.model<IWeatherReading>('WeatherReading', weatherReadingSchema);