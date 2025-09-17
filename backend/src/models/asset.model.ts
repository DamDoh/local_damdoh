import mongoose, { Document, Schema, Types } from 'mongoose';

export enum AssetType {
  EQUIPMENT = 'EQUIPMENT',
  MACHINERY = 'MACHINERY',
  VEHICLE = 'VEHICLE',
  BUILDING = 'BUILDING',
  LAND = 'LAND',
  IRRIGATION = 'IRRIGATION',
  STORAGE = 'STORAGE',
  OTHER = 'OTHER',
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  SOLD = 'SOLD',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  CONDITION_BASED = 'CONDITION_BASED',
}

export interface IAsset {
  farm: Types.ObjectId;
  name: string;
  type: AssetType;
  description?: string;
  assetId?: string; // Unique identifier
  category?: string;
  status: AssetStatus;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  depreciationRate?: number; // Annual depreciation rate
  location?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  warrantyExpiry?: Date;
  insuranceExpiry?: Date;
  specifications?: Record<string, any>;
  images?: string[];
  documents?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssetMaintenance extends Document {
  asset: Types.ObjectId;
  farm: Types.ObjectId;
  type: MaintenanceType;
  description: string;
  scheduledDate?: Date;
  completedDate?: Date;
  cost?: number;
  performedBy?: string;
  notes?: string;
  nextMaintenanceDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssetUsage extends Document {
  asset: Types.ObjectId;
  farm: Types.ObjectId;
  user: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  purpose?: string;
  hoursUsed?: number;
  fuelUsed?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    farm: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(AssetType),
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assetId: {
      type: String,
      trim: true,
      sparse: true,
    },
    category: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(AssetStatus),
      default: AssetStatus.ACTIVE,
    },
    purchaseDate: Date,
    purchasePrice: {
      type: Number,
      min: 0,
    },
    currentValue: {
      type: Number,
      min: 0,
    },
    depreciationRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    location: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    warrantyExpiry: Date,
    insuranceExpiry: Date,
    specifications: Schema.Types.Mixed,
    images: [String],
    documents: [{
      name: String,
      url: String,
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const assetMaintenanceSchema = new Schema<IAssetMaintenance>(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    farm: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MaintenanceType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    scheduledDate: Date,
    completedDate: Date,
    cost: {
      type: Number,
      min: 0,
    },
    performedBy: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    nextMaintenanceDate: Date,
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const assetUsageSchema = new Schema<IAssetUsage>(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    farm: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    purpose: {
      type: String,
      trim: true,
    },
    hoursUsed: {
      type: Number,
      min: 0,
    },
    fuelUsed: {
      type: Number,
      min: 0,
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

// Indexes
assetSchema.index({ farm: 1, name: 1 });
assetSchema.index({ farm: 1, type: 1 });
assetSchema.index({ farm: 1, status: 1 });
assetSchema.index({ farm: 1, assetId: 1 }, { sparse: true });
assetSchema.index({ farm: 1, isActive: 1 });
assetSchema.index({ warrantyExpiry: 1 });
assetSchema.index({ insuranceExpiry: 1 });

assetMaintenanceSchema.index({ asset: 1, scheduledDate: -1 });
assetMaintenanceSchema.index({ farm: 1, scheduledDate: -1 });
assetMaintenanceSchema.index({ asset: 1, isCompleted: 1 });

assetUsageSchema.index({ asset: 1, startDate: -1 });
assetUsageSchema.index({ user: 1, startDate: -1 });
assetUsageSchema.index({ farm: 1, startDate: -1 });

// Virtual for calculated current value
assetSchema.virtual('calculatedCurrentValue').get(function(this: IAsset) {
  if (!this.purchasePrice || !this.purchaseDate || !this.depreciationRate) {
    return this.currentValue || this.purchasePrice;
  }

  const yearsSincePurchase = (Date.now() - this.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const depreciationAmount = this.purchasePrice * (this.depreciationRate / 100) * yearsSincePurchase;
  const calculatedValue = Math.max(0, this.purchasePrice - depreciationAmount);

  return this.currentValue || calculatedValue;
});

// Virtual for maintenance status
assetSchema.virtual('maintenanceStatus').get(function(this: IAsset) {
  if (this.warrantyExpiry && this.warrantyExpiry < new Date()) {
    return 'warranty_expired';
  }
  if (this.insuranceExpiry && this.insuranceExpiry < new Date()) {
    return 'insurance_expired';
  }
  return 'current';
});

// Virtual for age in years
assetSchema.virtual('ageInYears').get(function(this: IAsset) {
  if (!this.purchaseDate) return null;
  return (Date.now() - this.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
});

// Ensure virtual fields are serialized
assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
export const AssetMaintenance = mongoose.model<IAssetMaintenance>('AssetMaintenance', assetMaintenanceSchema);
export const AssetUsage = mongoose.model<IAssetUsage>('AssetUsage', assetUsageSchema);