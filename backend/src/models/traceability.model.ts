import mongoose, { Document, Schema, Types } from 'mongoose';

export enum VtiStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  TRANSFERRED = 'TRANSFERRED',
}

export enum TraceabilityEventType {
  HARVESTED = 'HARVESTED',
  INPUT_APPLIED = 'INPUT_APPLIED',
  OBSERVED = 'OBSERVED',
  PROCESSED = 'PROCESSED',
  PACKAGED = 'PACKAGED',
  SHIPPED = 'SHIPPED',
  RECEIVED = 'RECEIVED',
  SOLD = 'SOLD',
  CONSUMED = 'CONSUMED',
}

export interface IVtiRegistry extends Document {
  vtiId: string;
  type: string;
  creationTime: Date;
  currentLocation?: {
    type: string;
    coordinates: number[];
  };
  status: VtiStatus;
  linkedVtis: string[];
  metadata: Record<string, any>;
  isPublicTraceable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITraceabilityEvent extends Document {
  vtiId?: string;
  farmFieldId?: string;
  timestamp: Date;
  eventType: TraceabilityEventType;
  actorRef: string;
  geoLocation?: {
    lat: number;
    lng: number;
  };
  payload: Record<string, any>;
  isPublicTraceable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vtiRegistrySchema = new Schema<IVtiRegistry>(
  {
    vtiId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    creationTime: {
      type: Date,
      default: Date.now,
    },
    currentLocation: {
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
    status: {
      type: String,
      enum: Object.values(VtiStatus),
      default: VtiStatus.ACTIVE,
    },
    linkedVtis: [{
      type: String,
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isPublicTraceable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const traceabilityEventSchema = new Schema<ITraceabilityEvent>(
  {
    vtiId: {
      type: String,
      index: true,
    },
    farmFieldId: {
      type: String,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    eventType: {
      type: String,
      enum: Object.values(TraceabilityEventType),
      required: true,
    },
    actorRef: {
      type: String,
      required: true,
      index: true,
    },
    geoLocation: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isPublicTraceable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vtiRegistrySchema.index({ type: 1 });
vtiRegistrySchema.index({ status: 1 });
vtiRegistrySchema.index({ isPublicTraceable: 1 });
vtiRegistrySchema.index({ creationTime: -1 });
vtiRegistrySchema.index({ currentLocation: '2dsphere' });

traceabilityEventSchema.index({ eventType: 1 });
traceabilityEventSchema.index({ actorRef: 1 });
traceabilityEventSchema.index({ 'geoLocation.lat': 1, 'geoLocation.lng': 1 });

// Compound indexes for efficient queries
traceabilityEventSchema.index({ vtiId: 1, timestamp: -1 });
traceabilityEventSchema.index({ farmFieldId: 1, timestamp: -1 });
traceabilityEventSchema.index({ farmFieldId: 1, vtiId: 1 });

export const VtiRegistry = mongoose.model<IVtiRegistry>('VtiRegistry', vtiRegistrySchema);
export const TraceabilityEvent = mongoose.model<ITraceabilityEvent>('TraceabilityEvent', traceabilityEventSchema);