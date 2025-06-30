
import type { UserProfile } from './types'; // Assuming UserProfile is the base type
import { stakeholders } from '/src/lib/stakeholder-data';

// This file defines the detailed profile structures for each of the stakeholder types defined in stakeholder-data.ts.
export interface FarmerProfile extends UserProfile {
    primaryRole: 'farmer';
    farmDetails: {
        farmName: string;
        location: {
            country: string;
            region: string;
            geoJson: object;
        };
        farmSizeAcres: number;
        primaryCrops: string[];
        farmingMethods: ('organic' | 'conventional' | 'regenerative')[];
    };
    certifications?: {
        id: string;
        name: string;
        issuingBody: string;
        validUntil: string;
    }[];
}

export interface BuyerProfile extends UserProfile {
    primaryRole: 'buyer';
    companyDetails: {
        companyName: string;
        companyType: 'Restaurant' | 'Supermarket' | 'Food Service';
        website: string;
    };
    sourcingPreferences: {
        preferredCrops: string[];
        requiredCertifications: string[];
        volumeNeeds: string;
    };
}

export interface RegulatorProfile extends UserProfile {
    primaryRole: 'regulator';
    agencyDetails: {
        agencyName: string;
        jurisdiction: string;
        department: string;
    };
}

// ... and so on for the other 18 stakeholder types.


