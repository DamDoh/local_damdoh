import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  participantIds: Types.ObjectId[];
  participantInfo: {
    [userId: string]: {
      displayName: string;
      avatarUrl?: string;
    };
  };
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new Schema<IConversation>(
  {
    participantIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    participantInfo: {
      type: Map,
      of: new Schema({
        displayName: {
          type: String,
          required: true,
        },
        avatarUrl: String,
      }, { _id: false }),
    },
    lastMessage: {
      type: String,
      default: 'Conversation started.',
    },
    lastMessageTimestamp: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversation: 1, timestamp: -1 });
messageSchema.index({ sender: 1, timestamp: -1 });

conversationSchema.index({ participantIds: 1 });
conversationSchema.index({ lastMessageTimestamp: -1 });
conversationSchema.index({ 'participantIds': 1 });

// Virtual for conversation ID (for compatibility with Firebase-style IDs)
conversationSchema.virtual('conversationId').get(function(this: IConversation) {
  const sortedIds = this.participantIds.map(id => id.toString()).sort();
  return sortedIds.join('_');
});

// Pre-save middleware to update unread counts
messageSchema.post('save', async function(doc) {
  try {
    const Conversation = mongoose.model('Conversation');
    const conversation = await Conversation.findById(doc.conversation);

    if (conversation) {
      // Update unread count for all participants except sender
      const unreadCount: { [key: string]: number } = {};
      Object.keys(conversation.unreadCount || {}).forEach(key => {
        unreadCount[key] = conversation.unreadCount[key];
      });

      conversation.participantIds.forEach((participantId: Types.ObjectId) => {
        const participantIdStr = participantId.toString();
        if (participantIdStr !== doc.sender.toString()) {
          unreadCount[participantIdStr] = (unreadCount[participantIdStr] || 0) + 1;
        }
      });

      await Conversation.findByIdAndUpdate(doc.conversation, {
        unreadCount,
        lastMessage: doc.content,
        lastMessageTimestamp: doc.timestamp,
      });
    }
  } catch (error) {
    console.error('Error updating conversation after message save:', error);
  }
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);