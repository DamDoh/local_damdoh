
import { z } from 'zod';

// Base schema for common fields
const baseProfileSchema = z.object({
    location: z.string().optional(),
    profileSummary: z.string().optional(),
    needs: z.array(z.string()).optional(),
});

// 1. Farmer
export const farmerProfileSchema = baseProfileSchema.extend({
    farmSize: z.number().optional(),
    crops: z.array(z.string()).optional(),
    livestock: z.array(z.string()).optional(),
});

// 2. Field Agent / Agronomist
export const fieldAgentProfileSchema = baseProfileSchema.extend({
    specialization: z.string().optional(),
    yearsOfExperience: z.number().optional(),
});

// 3. Operations / Logistics Team
export const logisticsTeamProfileSchema = baseProfileSchema.extend({
    fleetSize: z.number().optional(),
    coverageArea: z.string().optional(),
});

// 4. Quality Assurance (QA) Team
export const qaTeamProfileSchema = baseProfileSchema.extend({
    certifications: z.array(z.string()).optional(),
    inspectionCapacity: z.string().optional(),
});

// 5. Processing & Packaging Unit
export const processingUnitProfileSchema = baseProfileSchema.extend({
    processingTypes: z.array(z.string()).optional(),
    capacity: z.string().optional(),
});

// 6. Buyer (Restaurant, Supermarket, etc.)
export const buyerProfileSchema = baseProfileSchema.extend({
    businessType: z.string().optional(),
    productNeeds: z.array(z.string()).optional(),
});

// 7. Input Supplier
export const inputSupplierProfileSchema = baseProfileSchema.extend({
    productCategories: z.array(z.string()).optional(),
    distributionReach: z.string().optional(),
});

// 8. Financial Institution
export const financialInstitutionProfileSchema = baseProfileSchema.extend({
    servicesOffered: z.array(z.string()).optional(),
    loanProducts: z.array(z.string()).optional(),
});

// 9. Government Regulator / Auditor
export const regulatorProfileSchema = baseProfileSchema.extend({
    jurisdiction: z.string().optional(),
    regulatoryFocus: z.array(z.string()).optional(),
});

// 10. Certification Body
export const certificationBodyProfileSchema = baseProfileSchema.extend({
    certificationsOffered: z.array(z.string()).optional(),
    accreditation: z.string().optional(),
});

// 11. Consumer
export const consumerProfileSchema = baseProfileSchema.extend({
    dietaryPreferences: z.array(z.string()).optional(),
    sustainabilityFocus: z.boolean().optional(),
});

// 12. Researcher / Academic
export const researcherProfileSchema = baseProfileSchema.extend({
    institution: z.string().optional(),
    researchInterests: z.array(z.string()).optional(),
});

// 13. Logistics Partner
export const logisticsPartnerProfileSchema = baseProfileSchema.extend({
    transportModes: z.array(z.string()).optional(),
    warehouseLocations: z.array(z.string()).optional(),
});

// 14. Storage / Warehouse Facility
export const warehouseProfileSchema = baseProfileSchema.extend({
    storageCapacity: z.string().optional(),
    storageConditions: z.array(z.string()).optional(),
});

// 15. Agronomy Expert / Consultant
export const agronomyExpertProfileSchema = baseProfileSchema.extend({
    consultingAreas: z.array(z.string()).optional(),
    hourlyRate: z.number().optional(),
});

// 16. Agro-Tourism Operator
export const agroTourismOperatorProfileSchema = baseProfileSchema.extend({
    experiencesOffered: z.array(z.string()).optional(),
    bookingLink: z.string().optional(),
});

// 17. Energy Solutions Provider
export const energyProviderProfileSchema = baseProfileSchema.extend({
    energySolutions: z.array(z.string()).optional(),
    installationServices: z.boolean().optional(),
});

// 18. Agro-Export Facilitator / Customs Broker
export const agroExportFacilitatorProfileSchema = baseProfileSchema.extend({
    countriesOfOperation: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
});

// 19. Insurance Provider
export const insuranceProviderProfileSchema = baseProfileSchema.extend({
    insuranceProducts: z.array(z.string()).optional(),
    coverageArea: z.string().optional(),
});

// 20. Packaging Supplier
export const packagingSupplierProfileSchema = baseProfileSchema.extend({
    packagingTypes: z.array(z.string()).optional(),
    sustainabilityOptions: z.boolean().optional(),
});

// 21. Crowdfunder
export const crowdfunderProfileSchema = baseProfileSchema.extend({
    investmentInterests: z.array(z.string()).optional(),
    averageInvestmentSize: z.string().optional(),
});

export const stakeholderProfileSchemas = {
    'Farmer': farmerProfileSchema,
    'Field Agent / Agronomist': fieldAgentProfileSchema,
    'Operations / Logistics Team': logisticsTeamProfileSchema,
    'Quality Assurance (QA) Team': qaTeamProfileSchema,
    'Processing & Packaging Unit': processingUnitProfileSchema,
    'Buyer': buyerProfileSchema,
    'Input Supplier': inputSupplierProfileSchema,
    'Financial Institution': financialInstitutionProfileSchema,
    'Government Regulator / Auditor': regulatorProfileSchema,
    'Certification Body': certificationBodyProfileSchema,
    'Consumer': consumerProfileSchema,
    'Researcher / Academic': researcherProfileSchema,
    'Logistics Partner': logisticsPartnerProfileSchema,
    'Storage / Warehouse Facility': warehouseProfileSchema,
    'Agronomy Expert / Consultant': agronomyExpertProfileSchema,
    'Agro-Tourism Operator': agroTourismOperatorProfileSchema,
    'Energy Solutions Provider': energyProviderProfileSchema,
    'Agro-Export Facilitator / Customs Broker': agroExportFacilitatorProfileSchema,
    'Insurance Provider': insuranceProviderProfileSchema,
    'Packaging Supplier': packagingSupplierProfileSchema,
    'Crowdfunder': crowdfunderProfileSchema,
};
