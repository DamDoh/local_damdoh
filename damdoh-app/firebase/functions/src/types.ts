
import * as admin from "firebase-admin";

export type UserRole =
  | "Admin"
  | "System"
  | "Farmer"
  | "Agricultural Cooperative"
  | "Field Agent/Agronomist (DamDoh Internal)"
  | "Operations/Logistics Team (DamDoh Internal)"
  | "Quality Assurance Team (DamDoh Internal)"
  | "Processing & Packaging Unit"
  | "Buyer (Restaurant, Supermarket, Exporter)"
  | "Input Supplier (Seed, Fertilizer, Pesticide)"
  | "Equipment Supplier (Sales of Machinery/IoT)"
  | "Financial Institution (Micro-finance/Loans)"
  | "Government Regulator/Auditor"
  | "Certification Body (Organic, Fair Trade etc.)"
  | "Consumer"
  | "Researcher/Academic"
  | "Logistics Partner (Third-Party Transporter)"
  | "Storage/Warehouse Facility"
  | "Agronomy Expert/Consultant (External)"
  | "Agro-Tourism Operator"
  | "Energy Solutions Provider (Solar, Biogas)"
  | "Agro-Export Facilitator/Customs Broker"
  | "Agri-Tech Innovator/Developer"
  | "Waste Management & Compost Facility"
  | "Insurance Provider"
  | "Crowdfunder (Impact Investor, Individual)";

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  primaryRole: UserRole;
  secondaryRoles?: UserRole[];
  organization?: {
    id: string;
    name: string;
  } | null;
  location?: {
    country: string;
    city?: string;
  } | null;
  lastLogin: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}
export interface KnfBatch {
  id: string;
  userId: string;
  type: string;
  typeName: string;
  ingredients: string[];
  startDate: admin.firestore.Timestamp;
  status: "Fermenting" | "Ready" | "Used" | "Archived";
  nextStep: string;
  nextStepDate: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}

export interface FarmerDashboardData {
  farmCount: number;
  cropCount: number;
  recentCrops: {
    id: string;
    cropType: string;
    plantingDate: string | null; // ISO String
  }[];
  knfBatches: {
    id: string;
    typeName: string;
    status: string;
    nextStepDate: string | null; // ISO String
  }[];
}

export interface BuyerDashboardData {
  supplyChainRisk: {
    region: string;
    level: string;
    factor: string;
    action: {
      label: string;
      link: string;
    };
  };
  sourcingRecommendations: {
    id: string;
    name: string;
    product: string;
    reliability: number;
    vtiVerified: boolean;
  }[];
  marketPriceIntelligence: {
    product: string;
    trend: 'up' | 'down' | 'stable';
    forecast: string;
    action: {
      label: string;
      link: string;
    };
  };
}

export interface FiDashboardData {
    pendingApplications: {
        id: string;
        applicantName: string;
        type: string;
        amount: number;
        riskScore: number;
        actionLink: string;
    }[];
    portfolioAtRisk: {
        count: number;
        value: number;
        highestRisk: {
            name: string;
            reason: string;
        };
        actionLink: string;
    };
    marketUpdates: {
        id: string;
        content: string;
        actionLink: string;
    }[];
}

export interface InputSupplierDashboardData {
    demandForecast: {
        id: string;
        region: string;
        product: string;
        trend: 'High' | 'Steady' | 'Low';
        reason: string;
    }[];
    productPerformance: {
        id: string;
        productName: string;
        rating: number;
        feedback: string;
        link: string;
    }[];
    activeOrders: {
        count: number;
        value: number;
        link: string;
    };
}

export interface MarketplaceItem {
    id: string;
    name: string;
    listingType: 'Product' | 'Service';
    description: string;
    price?: number;
    currency?: string;
    perUnit?: string;
    sellerId: string;
    category: string;
    location: string;
    imageUrl?: string;
    createdAt: string | null; // ISO string
    updatedAt: string | null; // ISO string
    contactInfo?: string;
    dataAiHint?: string;
    isSustainable?: boolean;
    sellerVerification?: 'Verified' | 'Pending' | 'Unverified';
    aiPriceSuggestion?: { min: number; max: number; confidence: 'Low' | 'Medium' | 'High' };
    stockQuantity?: number;
    relatedTraceabilityId?: string;
    serviceType?: string;
    priceDisplay?: string;
    availabilityStatus?: string;
    serviceArea?: string;
    relatedFinancialProductId?: string;
    relatedInsuranceProductId?: string;
    skillsRequired?: string[];
    experienceLevel?: string;
    compensation?: string;
    serviceAvailability?: string;
    brand?: string;
    condition?: 'New' | 'Used' | 'Refurbished';
    certifications?: string[];
    traceabilityLink?: string;
}

export interface MarketplaceCoupon {
  id: string;
  sellerId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: admin.firestore.Timestamp | null;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  applicableToListingIds?: string[];
  applicableToCategories?: string[];
  createdAt: admin.firestore.Timestamp | null;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  stakeholderType: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  itemCount: number;
  rating: number;
  createdAt: admin.firestore.Timestamp | null;
  updatedAt: admin.firestore.Timestamp | null;
}

export interface MarketplaceOrder {
  id: string;
  listingId: string;
  listingName: string;
  listingImageUrl?: string | null;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

export interface ForumTopic {
  id: string;
  name: string;
  description: string;
  postCount: number;
  lastActivity: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}

export interface ForumPost {
    id: string;
    title: string;
    content: string;
    authorRef: string;
    timestamp: admin.firestore.Timestamp;
    replyCount: number;
    likeCount: number;
}

export interface PostReply {
  id: string;
  content: string;
  authorRef: string;
  timestamp: admin.firestore.Timestamp;
}

export interface AgriEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string; // ISO string
  eventTime?: string;
  location: string;
  eventType: 'Conference' | 'Webinar' | 'Workshop' | 'Trade Show' | 'Field Day' | 'Networking Event' | 'Online Course Launch' | 'Policy Briefing';
  organizer?: string;
  organizerId: string;
  websiteLink?: string;
  imageUrl?: string;
  dataAiHint?: string;
  registrationEnabled: boolean;
  attendeeLimit?: number;
  registeredAttendeesCount: number;
  price?: number;
  currency?: string;
}

export interface EventCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: admin.firestore.Timestamp | null;
  usageLimit?: number | null;
  usageCount: number;
}
