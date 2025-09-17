import mongoose, { Document, Schema, Types } from 'mongoose';

export enum PostType {
  GENERAL = 'GENERAL',
  QUESTION = 'QUESTION',
  ARTICLE = 'ARTICLE',
  EVENT = 'EVENT',
  MARKET_UPDATE = 'MARKET_UPDATE',
}

export interface IPost extends Document {
  author: Types.ObjectId;
  type: PostType;
  title: string;
  content: string;
  images?: string[];
  tags: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  views: number;
  location?: {
    type: string;
    coordinates: number[];
  };
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  author: Types.ObjectId;
  post: Types.ObjectId;
  parentComment?: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroup extends Document {
  name: string;
  description: string;
  avatar?: string;
  cover?: string;
  creator: Types.ObjectId;
  administrators: Types.ObjectId[];
  members: Types.ObjectId[];
  posts: Types.ObjectId[];
  isPrivate: boolean;
  rules?: string[];
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(PostType),
      default: PostType.GENERAL,
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
    images: [String],
    tags: [String],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    }],
    views: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    content: {
      type: String,
      required: true,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    avatar: String,
    cover: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    administrators: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    posts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post',
    }],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    rules: [String],
    category: {
      type: String,
      required: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ author: 1 });
postSchema.index({ type: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ location: '2dsphere' });
postSchema.index({ createdAt: -1 });
postSchema.index({ publishedAt: -1 });

commentSchema.index({ post: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });

groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ category: 1 });
groupSchema.index({ tags: 1 });
groupSchema.index({ creator: 1 });
groupSchema.index({ 'members': 1 });

// Middleware to set publishedAt date when post is published
postSchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Add creator to administrators array when creating a group
groupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.administrators = [this.creator];
    this.members = [this.creator];
  }
  next();
});

export const Post = mongoose.model<IPost>('Post', postSchema);
export const Comment = mongoose.model<IComment>('Comment', commentSchema);
export const Group = mongoose.model<IGroup>('Group', groupSchema);