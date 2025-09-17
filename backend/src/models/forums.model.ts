import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IForumTopic extends Document {
  name: string;
  description: string;
  creator: Types.ObjectId;
  postCount: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IForumPost extends Document {
  forumTopic: Types.ObjectId;
  title: string;
  content: string;
  author: Types.ObjectId;
  authorName: string;
  authorAvatarUrl?: string;
  replyCount: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IForumReply extends Document {
  forumPost: Types.ObjectId;
  content: string;
  author: Types.ObjectId;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const forumTopicSchema = new Schema<IForumTopic>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const forumPostSchema = new Schema<IForumPost>(
  {
    forumTopic: {
      type: Schema.Types.ObjectId,
      ref: 'ForumTopic',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatarUrl: String,
    replyCount: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const forumReplySchema = new Schema<IForumReply>(
  {
    forumPost: {
      type: Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatarUrl: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
forumTopicSchema.index({ name: 'text', description: 'text' });
forumTopicSchema.index({ lastActivityAt: -1 });
forumTopicSchema.index({ creator: 1 });

forumPostSchema.index({ forumTopic: 1, createdAt: -1 });
forumPostSchema.index({ author: 1, createdAt: -1 });

forumReplySchema.index({ forumPost: 1, createdAt: 1 });
forumReplySchema.index({ author: 1, createdAt: -1 });

// Middleware to update topic's lastActivityAt when a post is created
forumPostSchema.post('save', async function(doc) {
  try {
    const ForumTopic = mongoose.model('ForumTopic');
    await ForumTopic.findByIdAndUpdate(doc.forumTopic, {
      lastActivityAt: doc.createdAt,
      $inc: { postCount: 1 },
    });
  } catch (error) {
    console.error('Error updating forum topic after post save:', error);
  }
});

// Middleware to update post's replyCount when a reply is created
forumReplySchema.post('save', async function(doc) {
  try {
    const ForumPost = mongoose.model('ForumPost');
    await ForumPost.findByIdAndUpdate(doc.forumPost, {
      $inc: { replyCount: 1 },
    });
  } catch (error) {
    console.error('Error updating forum post after reply save:', error);
  }
});

export const ForumTopic = mongoose.model<IForumTopic>('ForumTopic', forumTopicSchema);
export const ForumPost = mongoose.model<IForumPost>('ForumPost', forumPostSchema);
export const ForumReply = mongoose.model<IForumReply>('ForumReply', forumReplySchema);