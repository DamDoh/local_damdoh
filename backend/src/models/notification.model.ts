import mongoose, { Document, Schema, Types } from 'mongoose';

export enum NotificationType {
  PROFILE_VIEW = 'profile_view',
  NEW_CONNECTION_REQUEST = 'new_connection_request',
  LIKE = 'like',
  COMMENT = 'comment',
  NEW_ORDER = 'new_order',
  EVENT_REMINDER = 'event_reminder',
  SERVICE_REMINDER = 'service_reminder',
  SYSTEM = 'system',
  MARKETPLACE = 'marketplace',
  COMMUNITY = 'community',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export interface INotification extends Document {
  notificationId: string;
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  actor?: Types.ObjectId; // User who performed the action
  linkedEntity?: {
    collection: string;
    documentId: string;
  };
  data?: Record<string, any>; // Additional data for the notification
  status: NotificationStatus;
  isRead: boolean; // For backward compatibility
  fcmToken?: string; // FCM token for push notifications
  pushSent: boolean;
  pushError?: string;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

export interface INotificationPreferences extends Document {
  user: Types.ObjectId;
  email: {
    enabled: boolean;
    types: NotificationType[];
  };
  push: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    notificationId: {
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
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    linkedEntity: {
      collection: {
        type: String,
        index: true,
      },
      documentId: {
        type: String,
        index: true,
      },
    },
    data: Schema.Types.Mixed,
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.UNREAD,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    fcmToken: String,
    pushSent: {
      type: Boolean,
      default: false,
    },
    pushError: String,
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, status: 1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ actor: 1, createdAt: -1 });
notificationSchema.index({ 'linkedEntity.collection': 1, 'linkedEntity.documentId': 1 });

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    email: {
      enabled: {
        type: Boolean,
        default: true,
      },
      types: [{
        type: String,
        enum: Object.values(NotificationType),
        default: Object.values(NotificationType),
      }],
    },
    push: {
      enabled: {
        type: Boolean,
        default: true,
      },
      types: [{
        type: String,
        enum: Object.values(NotificationType),
        default: Object.values(NotificationType),
      }],
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true,
      },
      types: [{
        type: String,
        enum: Object.values(NotificationType),
        default: Object.values(NotificationType),
      }],
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      start: {
        type: String,
        default: '22:00',
      },
      end: {
        type: String,
        default: '08:00',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export const NotificationPreferences = mongoose.model<INotificationPreferences>('NotificationPreferences', notificationPreferencesSchema);