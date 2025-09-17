import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ContentType {
  ARTICLE = 'ARTICLE',
  TUTORIAL = 'TUTORIAL',
  GUIDE = 'GUIDE',
  COURSE = 'COURSE',
  VIDEO = 'VIDEO',
}

export enum ContentLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export interface IContent extends Document {
  author: Types.ObjectId;
  type: ContentType;
  title: string;
  description: string;
  content: string;
  featuredImage?: string;
  gallery?: string[];
  tags: string[];
  category: string;
  level: ContentLevel;
  estimatedReadTime?: number;
  likes: Types.ObjectId[];
  views: number;
  language: string;
  references?: string[];
  isPublished: boolean;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: Types.ObjectId;
  level: ContentLevel;
  duration: number; // in minutes
  language: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  modules: Array<{
    title: string;
    description: string;
    content: Types.ObjectId[];
    duration: number;
    order: number;
  }>;
  enrolledUsers: Types.ObjectId[];
  ratings: Array<{
    user: Types.ObjectId;
    rating: number;
    review?: string;
    createdAt: Date;
  }>;
  averageRating: number;
  totalEnrollments: number;
  isPublished: boolean;
  price?: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ContentType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    featuredImage: String,
    gallery: [String],
    tags: [String],
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: Object.values(ContentLevel),
      required: true,
    },
    estimatedReadTime: Number,
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      required: true,
    },
    references: [String],
    isPublished: {
      type: Boolean,
      default: false,
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: String,
      enum: Object.values(ContentLevel),
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    thumbnail: String,
    modules: [{
      title: {
        type: String,
        required: true,
      },
      description: String,
      content: [{
        type: Schema.Types.ObjectId,
        ref: 'Content',
      }],
      duration: Number,
      order: {
        type: Number,
        required: true,
      },
    }],
    enrolledUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    ratings: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      review: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    price: {
      amount: Number,
      currency: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
contentSchema.index({ author: 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ category: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ language: 1 });
contentSchema.index({ level: 1 });
contentSchema.index({ 'title': 'text', 'description': 'text', 'content': 'text' });

courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ language: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ 'title': 'text', 'description': 'text' });

// Pre-save middleware to update course statistics
courseSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
  }
  
  if (this.enrolledUsers) {
    this.totalEnrollments = this.enrolledUsers.length;
  }
  
  next();
});

// Set publishedAt date when content is published
contentSchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Content = mongoose.model<IContent>('Content', contentSchema);
export const Course = mongoose.model<ICourse>('Course', courseSchema);