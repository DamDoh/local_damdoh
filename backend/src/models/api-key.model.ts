import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ApiKeyEnvironment {
  SANDBOX = 'Sandbox',
  PRODUCTION = 'Production',
}

export enum ApiKeyStatus {
  ACTIVE = 'Active',
  REVOKED = 'Revoked',
  EXPIRED = 'Expired',
}

export interface IApiKey extends Document {
  user: Types.ObjectId;
  description: string;
  environment: ApiKeyEnvironment;
  status: ApiKeyStatus;
  keyPrefix: string;
  lastFour: string;
  hashedKey?: string; // For future security enhancement
  expiresAt?: Date;
  usageCount: number;
  lastUsedAt?: Date;
  revokedAt?: Date;
  revokedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    environment: {
      type: String,
      enum: Object.values(ApiKeyEnvironment),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApiKeyStatus),
      default: ApiKeyStatus.ACTIVE,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    lastFour: {
      type: String,
      required: true,
      length: 4,
    },
    hashedKey: {
      type: String,
    },
    expiresAt: Date,
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: Date,
    revokedAt: Date,
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
apiKeySchema.index({ user: 1, environment: 1 });
apiKeySchema.index({ user: 1, status: 1 });
apiKeySchema.index({ user: 1, createdAt: -1 });
apiKeySchema.index({ keyPrefix: 1, lastFour: 1 }, { unique: true });
apiKeySchema.index({ expiresAt: 1 });

// Virtual for full key display (without revealing the secret)
apiKeySchema.virtual('displayKey').get(function(this: IApiKey) {
  return `${this.keyPrefix}...${this.lastFour}`;
});

// Virtual for checking if key is expired
apiKeySchema.virtual('isExpired').get(function(this: IApiKey) {
  return this.expiresAt && this.expiresAt < new Date();
});

// Middleware to update status when expired
apiKeySchema.pre('save', function(next) {
  if (this.expiresAt && this.expiresAt < new Date() && this.status === ApiKeyStatus.ACTIVE) {
    this.status = ApiKeyStatus.EXPIRED;
  }
  next();
});

// Ensure virtual fields are serialized
apiKeySchema.set('toJSON', { virtuals: true });
apiKeySchema.set('toObject', { virtuals: true });

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);