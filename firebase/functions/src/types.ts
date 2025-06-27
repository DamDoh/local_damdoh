
import * as admin from "firebase-admin";

export type UserRole =
  | "Admin"
  | "System"
  | "Farmer"
  | "Agronomist"
  | "Operation Team"
  | "Quality Assurance Team"
  | "Processing & Packaging Unit"
  | "Buyer"
  | "Input Supplier"
  | "Financial Institution"
  | "Government Regulator"
  | "Certification Body"
  | "Consumer"
  | "Researcher/Academic"
  | "Logistic Partner"
  | "Storage/Warehouse Facility"
  | "Agronomy Expert"
  | "Agro-Tourism Operator"
  | "Energy Solutions Provider"
  | "Agro-Export Facilitator"
  | "Insurance Provider"
  | "Packaging Supplier"
  | "Crowdfunder";

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
  yieldData: YieldData[];
  irrigationSchedule: IrrigationSchedule;
  matchedBuyers: MatchedBuyer[];
  trustScore: TrustScore;
}

export interface YieldData {
    crop: string;
    historical: number;
    predicted: number;
    unit: string;
  }

export interface IrrigationSchedule {
    next_run: string;
    duration_minutes: number;
    recommendation: string;
  }

export interface MatchedBuyer {
    id: string;
    name: string;
    matchScore: number;
    request: string;
    contactId: string;
  }

export interface TrustScore {
    reputation: number;
    certifications: Certification[];
  }

export interface Certification {
    id: string;
    name: string;
    issuingBody: string;
  }

export interface AgroTourismDashboardData {
  upcomingBookings: {
    id: string;
    experienceTitle: string;
    guestName: string;
    date: string; // ISO string
    actionLink: string;
  }[];
  listedExperiences: {
    id: string;
    title: string;
    location: string;
    status: 'Published' | 'Draft';
    bookingsCount: number;
    actionLink: string;
  }[];
  guestReviews: {
    id: string;
    guestName: string;
    experienceTitle: string;
    rating: number; // e.g., 1-5
    comment: string;
    actionLink: string;
  }[];
}

export interface InsuranceProviderDashboardData {
  pendingClaims: {
    id: string;
    policyHolderName: string;
    policyType: 'Crop' | 'Livestock';
    claimDate: string; // ISO string
    status: 'Submitted' | 'Under Review';
    actionLink: string;
  }[];
  riskAssessmentAlerts: {
    id: string;
    policyHolderName: string;
    alert: string;
    severity: 'High' | 'Medium' | 'Low';
    actionLink: string;
  }[];
  activePolicies: {
    id: string;
    policyHolderName: string;
    policyType: string;
    coverageAmount: number;
    expiryDate: string; // ISO string
    actionLink: string;
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
