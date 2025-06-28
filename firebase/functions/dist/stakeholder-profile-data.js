"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stakeholderProfileSchemas = exports.crowdfunderProfileSchema = exports.packagingSupplierProfileSchema = exports.insuranceProviderProfileSchema = exports.agroExportFacilitatorProfileSchema = exports.energyProviderProfileSchema = exports.agroTourismOperatorProfileSchema = exports.agronomyExpertProfileSchema = exports.warehouseProfileSchema = exports.logisticsPartnerProfileSchema = exports.researcherProfileSchema = exports.consumerProfileSchema = exports.certificationBodyProfileSchema = exports.regulatorProfileSchema = exports.financialInstitutionProfileSchema = exports.inputSupplierProfileSchema = exports.buyerProfileSchema = exports.processingUnitProfileSchema = exports.qaTeamProfileSchema = exports.logisticsTeamProfileSchema = exports.fieldAgentProfileSchema = exports.farmerProfileSchema = void 0;
const zod_1 = require("zod");
// Base schema for common fields
const baseProfileSchema = zod_1.z.object({
    location: zod_1.z.string().optional(),
    profileSummary: zod_1.z.string().optional(),
    needs: zod_1.z.array(zod_1.z.string()).optional(),
});
// 1. Farmer
exports.farmerProfileSchema = baseProfileSchema.extend({
    farmSize: zod_1.z.number().optional(),
    crops: zod_1.z.array(zod_1.z.string()).optional(),
    livestock: zod_1.z.array(zod_1.z.string()).optional(),
});
// 2. Field Agent / Agronomist
exports.fieldAgentProfileSchema = baseProfileSchema.extend({
    specialization: zod_1.z.string().optional(),
    yearsOfExperience: zod_1.z.number().optional(),
});
// 3. Operations / Logistics Team
exports.logisticsTeamProfileSchema = baseProfileSchema.extend({
    fleetSize: zod_1.z.number().optional(),
    coverageArea: zod_1.z.string().optional(),
});
// 4. Quality Assurance (QA) Team
exports.qaTeamProfileSchema = baseProfileSchema.extend({
    certifications: zod_1.z.array(zod_1.z.string()).optional(),
    inspectionCapacity: zod_1.z.string().optional(),
});
// 5. Processing & Packaging Unit
exports.processingUnitProfileSchema = baseProfileSchema.extend({
    processingTypes: zod_1.z.array(zod_1.z.string()).optional(),
    capacity: zod_1.z.string().optional(),
});
// 6. Buyer (Restaurant, Supermarket, etc.)
exports.buyerProfileSchema = baseProfileSchema.extend({
    businessType: zod_1.z.string().optional(),
    productNeeds: zod_1.z.array(zod_1.z.string()).optional(),
});
// 7. Input Supplier
exports.inputSupplierProfileSchema = baseProfileSchema.extend({
    productCategories: zod_1.z.array(zod_1.z.string()).optional(),
    distributionReach: zod_1.z.string().optional(),
});
// 8. Financial Institution
exports.financialInstitutionProfileSchema = baseProfileSchema.extend({
    servicesOffered: zod_1.z.array(zod_1.z.string()).optional(),
    loanProducts: zod_1.z.array(zod_1.z.string()).optional(),
});
// 9. Government Regulator / Auditor
exports.regulatorProfileSchema = baseProfileSchema.extend({
    jurisdiction: zod_1.z.string().optional(),
    regulatoryFocus: zod_1.z.array(zod_1.z.string()).optional(),
});
// 10. Certification Body
exports.certificationBodyProfileSchema = baseProfileSchema.extend({
    certificationsOffered: zod_1.z.array(zod_1.z.string()).optional(),
    accreditation: zod_1.z.string().optional(),
});
// 11. Consumer
exports.consumerProfileSchema = baseProfileSchema.extend({
    dietaryPreferences: zod_1.z.array(zod_1.z.string()).optional(),
    sustainabilityFocus: zod_1.z.boolean().optional(),
});
// 12. Researcher / Academic
exports.researcherProfileSchema = baseProfileSchema.extend({
    institution: zod_1.z.string().optional(),
    researchInterests: zod_1.z.array(zod_1.z.string()).optional(),
});
// 13. Logistics Partner
exports.logisticsPartnerProfileSchema = baseProfileSchema.extend({
    transportModes: zod_1.z.array(zod_1.z.string()).optional(),
    warehouseLocations: zod_1.z.array(zod_1.z.string()).optional(),
});
// 14. Storage / Warehouse Facility
exports.warehouseProfileSchema = baseProfileSchema.extend({
    storageCapacity: zod_1.z.string().optional(),
    storageConditions: zod_1.z.array(zod_1.z.string()).optional(),
});
// 15. Agronomy Expert / Consultant
exports.agronomyExpertProfileSchema = baseProfileSchema.extend({
    consultingAreas: zod_1.z.array(zod_1.z.string()).optional(),
    hourlyRate: zod_1.z.number().optional(),
});
// 16. Agro-Tourism Operator
exports.agroTourismOperatorProfileSchema = baseProfileSchema.extend({
    experiencesOffered: zod_1.z.array(zod_1.z.string()).optional(),
    bookingLink: zod_1.z.string().optional(),
});
// 17. Energy Solutions Provider
exports.energyProviderProfileSchema = baseProfileSchema.extend({
    energySolutions: zod_1.z.array(zod_1.z.string()).optional(),
    installationServices: zod_1.z.boolean().optional(),
});
// 18. Agro-Export Facilitator / Customs Broker
exports.agroExportFacilitatorProfileSchema = baseProfileSchema.extend({
    countriesOfOperation: zod_1.z.array(zod_1.z.string()).optional(),
    services: zod_1.z.array(zod_1.z.string()).optional(),
});
// 19. Insurance Provider
exports.insuranceProviderProfileSchema = baseProfileSchema.extend({
    insuranceProducts: zod_1.z.array(zod_1.z.string()).optional(),
    coverageArea: zod_1.z.string().optional(),
});
// 20. Packaging Supplier
exports.packagingSupplierProfileSchema = baseProfileSchema.extend({
    packagingTypes: zod_1.z.array(zod_1.z.string()).optional(),
    sustainabilityOptions: zod_1.z.boolean().optional(),
});
// 21. Crowdfunder
exports.crowdfunderProfileSchema = baseProfileSchema.extend({
    investmentInterests: zod_1.z.array(zod_1.z.string()).optional(),
    averageInvestmentSize: zod_1.z.string().optional(),
});
exports.stakeholderProfileSchemas = {
    "Farmer": exports.farmerProfileSchema,
    "Field Agent / Agronomist": exports.fieldAgentProfileSchema,
    "Operations / Logistics Team": exports.logisticsTeamProfileSchema,
    "Quality Assurance (QA) Team": exports.qaTeamProfileSchema,
    "Processing & Packaging Unit": exports.processingUnitProfileSchema,
    "Buyer": exports.buyerProfileSchema,
    "Input Supplier": exports.inputSupplierProfileSchema,
    "Financial Institution": exports.financialInstitutionProfileSchema,
    "Government Regulator / Auditor": exports.regulatorProfileSchema,
    "Certification Body": exports.certificationBodyProfileSchema,
    "Consumer": exports.consumerProfileSchema,
    "Researcher / Academic": exports.researcherProfileSchema,
    "Logistics Partner": exports.logisticsPartnerProfileSchema,
    "Storage / Warehouse Facility": exports.warehouseProfileSchema,
    "Agronomy Expert / Consultant": exports.agronomyExpertProfileSchema,
    "Agro-Tourism Operator": exports.agroTourismOperatorProfileSchema,
    "Energy Solutions Provider": exports.energyProviderProfileSchema,
    "Agro-Export Facilitator / Customs Broker": exports.agroExportFacilitatorProfileSchema,
    "Insurance Provider": exports.insuranceProviderProfileSchema,
    "Packaging Supplier": exports.packagingSupplierProfileSchema,
    "Crowdfunder": exports.crowdfunderProfileSchema,
};
//# sourceMappingURL=stakeholder-profile-data.js.map