
import type { UserProfile } from './types'; // Assuming UserProfile is the base type

// This file defines the detailed profile structures for each of the 21 stakeholder types.
// It extends the base UserProfile with role-specific data.

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

// Example of creating a stakeholder profile object
const exampleFarmer: FarmerProfile = {
    id: "user123",
    primaryRole: 'farmer',
    displayName: "John Appleseed",
    email: "john@example.com",
    profilePictureUrl: "",
    kycStatus: "verified",
    farmDetails: {
        farmName: "Apple Valley Farms",
        location: {
            country: "USA",
            region: "California",
            geoJson: {}
        },
        farmSizeAcres: 100,
        primaryCrops: ["Apples", "Pears"],
        farmingMethods: ['organic']
    },
    certifications: [
        { id: "cert1", name: "USDA Organic", issuingBody: "USDA", validUntil: "2025-12-31" }
    ]
};
