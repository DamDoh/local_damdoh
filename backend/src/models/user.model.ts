import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum StakeholderRole {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  SUPPLIER = 'SUPPLIER',
  EXPERT = 'EXPERT',
  FINANCIAL_INSTITUTION = 'FINANCIAL_INSTITUTION',
  ADMIN = 'ADMIN',
  CONSUMER = 'CONSUMER'
}

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: StakeholderRole;
  phoneNumber?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  profileComplete: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for Firebase compatibility
  displayName?: string;
  primaryRole?: StakeholderRole;
  profileSummary?: string;
  bio?: string;
  areasOfInterest?: string[];
  needs?: string[];
  contactInfo?: {
    phone?: string;
    website?: string;
  };
  profileData?: any;
  universalId?: string;
  avatarUrl?: string;
  viewCount?: number;
  fcmToken?: string; // Firebase Cloud Messaging token for push notifications
  notificationPreferences?: any; // For backward compatibility with Firebase
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(StakeholderRole),
      required: true,
    },
    primaryRole: {
      type: String,
      enum: Object.values(StakeholderRole),
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    profileSummary: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    areasOfInterest: [{
      type: String,
      trim: true,
    }],
    needs: [{
      type: String,
      trim: true,
    }],
    contactInfo: {
      phone: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
    },
    profileData: {
      type: mongoose.Schema.Types.Mixed,
    },
    universalId: {
      type: String,
      unique: true,
    },
    avatarUrl: {
      type: String,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    fcmToken: {
      type: String,
    },
    notificationPreferences: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);