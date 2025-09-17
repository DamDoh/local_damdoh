import mongoose, { Document, Schema, Types } from 'mongoose';

export enum GroupMemberRole {
  OWNER = 'OWNER',
  ADMINISTRATOR = 'ADMINISTRATOR',
  MEMBER = 'MEMBER',
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
  memberCount: number;
  postCount: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupMember extends Document {
  group: Types.ObjectId;
  user: Types.ObjectId;
  role: GroupMemberRole;
  displayName: string;
  avatarUrl?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupPost extends Document {
  group: Types.ObjectId;
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

export interface IGroupReply extends Document {
  groupPost: Types.ObjectId;
  content: string;
  author: Types.ObjectId;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
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
      ref: 'GroupPost',
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
    memberCount: {
      type: Number,
      default: 0,
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

const groupMemberSchema = new Schema<IGroupMember>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(GroupMemberRole),
      default: GroupMemberRole.MEMBER,
    },
    displayName: {
      type: String,
      required: true,
    },
    avatarUrl: String,
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const groupPostSchema = new Schema<IGroupPost>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
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

const groupReplySchema = new Schema<IGroupReply>(
  {
    groupPost: {
      type: Schema.Types.ObjectId,
      ref: 'GroupPost',
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
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ category: 1 });
groupSchema.index({ tags: 1 });
groupSchema.index({ creator: 1 });
groupSchema.index({ isPrivate: 1 });
groupSchema.index({ lastActivityAt: -1 });

groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });
groupMemberSchema.index({ group: 1 });
groupMemberSchema.index({ user: 1 });

groupPostSchema.index({ group: 1, createdAt: -1 });
groupPostSchema.index({ author: 1, createdAt: -1 });

groupReplySchema.index({ groupPost: 1, createdAt: 1 });
groupReplySchema.index({ author: 1, createdAt: -1 });

// Middleware to update group member count
groupMemberSchema.post('save', async function(doc) {
  try {
    const Group = mongoose.model('Group');
    await Group.findByIdAndUpdate(doc.group, {
      $inc: { memberCount: 1 },
    });
  } catch (error) {
    console.error('Error updating group member count after save:', error);
  }
});

// Middleware to update group post count
groupPostSchema.post('save', async function(doc) {
  try {
    const Group = mongoose.model('Group');
    await Group.findByIdAndUpdate(doc.group, {
      $inc: { postCount: 1 },
      lastActivityAt: doc.createdAt,
    });
  } catch (error) {
    console.error('Error updating group post count after save:', error);
  }
});

// Middleware to update post reply count
groupReplySchema.post('save', async function(doc) {
  try {
    const GroupPost = mongoose.model('GroupPost');
    await GroupPost.findByIdAndUpdate(doc.groupPost, {
      $inc: { replyCount: 1 },
    });
  } catch (error) {
    console.error('Error updating group post reply count after save:', error);
  }
});

// Add creator to administrators and members when creating a group
groupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.administrators = [this.creator];
    this.members = [this.creator];
  }
  next();
});

export const Group = mongoose.model<IGroup>('Group', groupSchema);
export const GroupMember = mongoose.model<IGroupMember>('GroupMember', groupMemberSchema);
export const GroupPost = mongoose.model<IGroupPost>('GroupPost', groupPostSchema);
export const GroupReply = mongoose.model<IGroupReply>('GroupReply', groupReplySchema);