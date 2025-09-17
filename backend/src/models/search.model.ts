import mongoose, { Document, Schema, Types } from 'mongoose';

export enum SearchableCollection {
  MARKETPLACE_ITEMS = 'marketplaceItems',
  FORUMS = 'forums',
  USERS = 'users',
  AGRI_EVENTS = 'agri_events',
  KNOWLEDGE_ARTICLES = 'knowledge_articles',
  GROUPS = 'groups',
  VTI_REGISTRY = 'vti_registry',
  FARMS = 'farms',
  POSTS = 'posts',
}

export interface ISearchIndex extends Document {
  itemId: string;
  itemCollection: SearchableCollection;
  title: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  searchableText: string;
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
  geohash?: string;
  // Marketplace specific fields
  price?: number;
  currency?: string;
  perUnit?: string;
  listingType?: string;
  // User specific fields
  primaryRole?: string;
  // Common metadata
  category?: string;
  subcategory?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const searchIndexSchema = new Schema<ISearchIndex>(
  {
    itemId: {
      type: String,
      required: true,
      index: true,
    },
    itemCollection: {
      type: String,
      enum: Object.values(SearchableCollection),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      text: true, // Enable text search
    },
    description: {
      type: String,
      required: true,
      text: true, // Enable text search
    },
    imageUrl: String,
    tags: [{
      type: String,
      index: true,
    }],
    searchableText: {
      type: String,
      text: true, // Enable text search
    },
    location: {
      address: {
        type: String,
        index: true,
      },
      coordinates: {
        type: [Number],
        index: '2dsphere', // Enable geospatial queries
      },
    },
    geohash: {
      type: String,
      index: true,
    },
    price: {
      type: Number,
      index: true,
    },
    currency: String,
    perUnit: {
      type: String,
      index: true,
    },
    listingType: {
      type: String,
      index: true,
    },
    primaryRole: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      index: true,
    },
    subcategory: {
      type: String,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
searchIndexSchema.index({ itemCollection: 1, itemId: 1 }, { unique: true });
searchIndexSchema.index({ itemCollection: 1, isActive: 1 });
searchIndexSchema.index({ itemCollection: 1, category: 1 });
searchIndexSchema.index({ itemCollection: 1, tags: 1 });
searchIndexSchema.index({ itemCollection: 1, price: 1 });
searchIndexSchema.index({ itemCollection: 1, 'location.coordinates': '2dsphere' });
searchIndexSchema.index({ itemCollection: 1, geohash: 1 });
searchIndexSchema.index({ itemCollection: 1, updatedAt: -1 });

// Text index for full-text search
searchIndexSchema.index({
  title: 'text',
  description: 'text',
  searchableText: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    searchableText: 3,
    tags: 2,
  },
  name: 'SearchTextIndex'
});

export const SearchIndex = mongoose.model<ISearchIndex>('SearchIndex', searchIndexSchema);