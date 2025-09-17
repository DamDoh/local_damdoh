import mongoose, { Document, Schema, Types } from 'mongoose';

export enum OfflineChangeOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum OfflineChangeStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CONFLICT = 'conflict',
  FAILED = 'failed',
}

export interface IOfflineChangeLog extends Document {
  changeId: string;
  user: Types.ObjectId;
  timestamp: Date;
  collectionPath: string;
  documentId: string;
  operation: OfflineChangeOperation;
  payload?: Record<string, any>;
  status: OfflineChangeStatus;
  clientDeviceId?: string;
  processingAttempts: number;
  lastAttemptTimestamp?: Date;
  errorMessage?: string;
  conflictDetails?: Record<string, any>;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const offlineChangeLogSchema = new Schema<IOfflineChangeLog>(
  {
    changeId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    collectionPath: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    operation: {
      type: String,
      enum: Object.values(OfflineChangeOperation),
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: Object.values(OfflineChangeStatus),
      default: OfflineChangeStatus.PENDING,
      index: true,
    },
    clientDeviceId: {
      type: String,
      index: true,
    },
    processingAttempts: {
      type: Number,
      default: 0,
    },
    lastAttemptTimestamp: Date,
    errorMessage: String,
    conflictDetails: Schema.Types.Mixed,
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
offlineChangeLogSchema.index({ user: 1, status: 1 });
offlineChangeLogSchema.index({ user: 1, createdAt: -1 });
offlineChangeLogSchema.index({ status: 1, createdAt: -1 });
offlineChangeLogSchema.index({ collectionPath: 1, documentId: 1 });

// Index for finding pending changes to process
offlineChangeLogSchema.index({ status: 1, processingAttempts: 1, createdAt: 1 });

export const OfflineChangeLog = mongoose.model<IOfflineChangeLog>('OfflineChangeLog', offlineChangeLogSchema);

// Helper function to get model by collection name
export function getModelByCollectionName(collectionName: string): mongoose.Model<any> | null {
  const modelMap: Record<string, mongoose.Model<any>> = {
    'users': require('./user.model').User,
    'posts': require('./community.model').Post,
    'comments': require('./community.model').Comment,
    'groups': require('./community.model').Group,
    'listings': require('./marketplace.model').Listing,
    'orders': require('./marketplace.model').Order,
    'shops': require('./marketplace.model').Shop,
    'farms': require('./farm.model').Farm,
    'crops': require('./farm.model').Crop,
    // Add other models as needed
  };

  return modelMap[collectionName] || null;
}