import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ActivityType {
  PROFILE_VIEW = 'PROFILE_VIEW',
  POST_CREATED = 'POST_CREATED',
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_RECEIVED = 'ORDER_RECEIVED',
  TRACEABILITY_EVENT = 'TRACEABILITY_EVENT',
  COMMENT_ADDED = 'COMMENT_ADDED',
  LIKE_ADDED = 'LIKE_ADDED',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  GROUP_JOINED = 'GROUP_JOINED',
  KNOWLEDGE_ARTICLE_CREATED = 'KNOWLEDGE_ARTICLE_CREATED',
}

export interface IProfileView extends Document {
  viewer: Types.ObjectId;
  viewed: Types.ObjectId;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity extends Document {
  user: Types.ObjectId;
  type: ActivityType;
  title: string;
  description?: string;
  referenceId?: Types.ObjectId; // ID of the related document (post, order, etc.)
  referenceType?: string; // Type of the related document
  metadata?: Record<string, any>; // Additional data for the activity
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const profileViewSchema = new Schema<IProfileView>(
  {
    viewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewed: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    referenceType: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
profileViewSchema.index({ viewer: 1, viewed: 1 });
profileViewSchema.index({ viewed: 1, timestamp: -1 });
profileViewSchema.index({ timestamp: -1 });

activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });
activitySchema.index({ referenceId: 1 });

// Pre-save middleware to increment view count when profile view is created
profileViewSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.viewed, { $inc: { viewCount: 1 } });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
});

export const ProfileView = mongoose.model<IProfileView>('ProfileView', profileViewSchema);
export const Activity = mongoose.model<IActivity>('Activity', activitySchema);