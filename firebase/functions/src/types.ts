
export interface YieldDataPoint {
    crop: string;
    historical: number;
    predicted: number;
    unit: string;
}

export interface FarmerDashboardData {
  yieldData: YieldDataPoint[];
  irrigationSchedule: {
    next_run: string;
    duration_minutes: number;
    recommendation: string;
  };
  matchedBuyers: {
    id: string;
    name: string;
    matchScore: number;
    request: string;
    contactId: string;
  }[];
  trustScore: {
      reputation: number;
      certifications: {
          id: string;
          name: string;
          issuingBody: string;
      }[];
  }
}

export interface KnfBatch {
    id: string;
    userId: string;
    type: 'fpj' | 'faa' | 'wca' | 'imo' | 'lab';
    typeName: string;
    ingredients: string;
    startDate: FirebaseFirestore.Timestamp;
    status: 'Fermenting' | 'Ready' | 'Used' | 'Archived';
    nextStep: string;
    nextStepDate: FirebaseFirestore.Timestamp;
    createdAt: FirebaseFirestore.Timestamp;
}

