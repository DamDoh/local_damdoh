
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
