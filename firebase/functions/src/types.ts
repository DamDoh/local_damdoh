
export interface KnfBatch {
    id: string;
    userId: string;
    type: 'fpj' | 'faa' | 'wca' | 'imo' | 'lab';
    typeName: string;
    startDate: FirebaseFirestore.Timestamp;
    ingredients: string;
    status: 'Fermenting' | 'Ready' | 'Used';
    nextStep: string;
    nextStepDate: FirebaseFirestore.Timestamp;
    createdAt: FirebaseFirestore.FieldValue;
}
