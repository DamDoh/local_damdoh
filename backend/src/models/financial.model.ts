import mongoose, { Document, Schema, Types } from 'mongoose';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  PAYOUT = 'PAYOUT',
  INVESTMENT = 'INVESTMENT',
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT',
  GRANT_DISBURSEMENT = 'GRANT_DISBURSEMENT',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MORE_INFO_REQUIRED = 'MORE_INFO_REQUIRED',
  COMPLETED = 'COMPLETED',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

export enum ProductType {
  LOAN = 'LOAN',
  GRANT = 'GRANT',
  INSURANCE = 'INSURANCE',
  SAVINGS = 'SAVINGS',
}

export interface IFinancialTransaction extends Document {
  transactionId: string;
  user: Types.ObjectId;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  category?: string;
  timestamp: Date;
  linkedOrderId?: string;
  linkedLoanApplicationId?: string;
  linkedGrantApplicationId?: string;
  linkedCrowdfundingProjectId?: string;
  linkedInvestmentId?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFinancialApplication extends Document {
  applicant: Types.ObjectId;
  applicantName: string;
  fi: Types.ObjectId;
  type: ProductType;
  amount: number;
  currency: string;
  status: ApplicationStatus;
  purpose: string;
  submittedAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  disbursedAt?: Date;
  notes?: string;
}

export interface IFinancialProduct extends Document {
  fi: Types.ObjectId;
  name: string;
  type: ProductType;
  description: string;
  interestRate?: number;
  maxAmount?: number;
  minAmount?: number;
  term?: number; // in months
  targetRoles: string[];
  status: ProductStatus;
  requirements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreditScore extends Document {
  user: Types.ObjectId;
  score: number;
  riskFactors: string[];
  lastUpdated: Date;
  aiModelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFundingRecommendation extends Document {
  user: Types.ObjectId;
  recommendations: Array<{
    opportunityId: string;
    relevanceScore: number;
    reason: string;
  }>;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const financialTransactionSchema = new Schema<IFinancialTransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
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
    category: {
      type: String,
      default: 'Uncategorized',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    linkedOrderId: String,
    linkedLoanApplicationId: String,
    linkedGrantApplicationId: String,
    linkedCrowdfundingProjectId: String,
    linkedInvestmentId: String,
    paymentId: String,
  },
  {
    timestamps: true,
  }
);

const financialApplicationSchema = new Schema<IFinancialApplication>(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    fi: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    purpose: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: Date,
    rejectedAt: Date,
    disbursedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

const financialProductSchema = new Schema<IFinancialProduct>(
  {
    fi: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    interestRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    maxAmount: {
      type: Number,
      min: 0,
    },
    minAmount: {
      type: Number,
      min: 0,
    },
    term: {
      type: Number,
      min: 1,
    },
    targetRoles: [{
      type: String,
    }],
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
    requirements: [String],
  },
  {
    timestamps: true,
  }
);

const creditScoreSchema = new Schema<ICreditScore>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },
    riskFactors: [{
      type: String,
    }],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    aiModelVersion: {
      type: String,
      default: 'v1.0',
    },
  },
  {
    timestamps: true,
  }
);

const fundingRecommendationSchema = new Schema<IFundingRecommendation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    recommendations: [{
      opportunityId: String,
      relevanceScore: Number,
      reason: String,
    }],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
financialTransactionSchema.index({ user: 1, timestamp: -1 });
financialTransactionSchema.index({ type: 1 });
financialTransactionSchema.index({ category: 1 });

financialApplicationSchema.index({ applicant: 1, submittedAt: -1 });
financialApplicationSchema.index({ fi: 1, status: 1, submittedAt: -1 });
financialApplicationSchema.index({ status: 1 });

financialProductSchema.index({ fi: 1, type: 1 });
financialProductSchema.index({ status: 1 });
financialProductSchema.index({ targetRoles: 1 });

creditScoreSchema.index({ user: 1 }, { unique: true });
creditScoreSchema.index({ score: -1 });

fundingRecommendationSchema.index({ user: 1 }, { unique: true });

export const FinancialTransaction = mongoose.model<IFinancialTransaction>('FinancialTransaction', financialTransactionSchema);
export const FinancialApplication = mongoose.model<IFinancialApplication>('FinancialApplication', financialApplicationSchema);
export const FinancialProduct = mongoose.model<IFinancialProduct>('FinancialProduct', financialProductSchema);
export const CreditScore = mongoose.model<ICreditScore>('CreditScore', creditScoreSchema);
export const FundingRecommendation = mongoose.model<IFundingRecommendation>('FundingRecommendation', fundingRecommendationSchema);