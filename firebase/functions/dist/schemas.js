"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stakeholderProfileSchemas = exports.equipmentSupplierProfileSchema = exports.wasteManagementProfileSchema = exports.agriTechInnovatorProfileSchema = exports.crowdfunderProfileSchema = exports.packagingSupplierProfileSchema = exports.insuranceProviderProfileSchema = exports.agroExportFacilitatorProfileSchema = exports.energyProviderProfileSchema = exports.agroTourismOperatorProfileSchema = exports.agronomyExpertProfileSchema = exports.warehouseProfileSchema = exports.logisticsPartnerProfileSchema = exports.researcherProfileSchema = exports.consumerProfileSchema = exports.certificationBodyProfileSchema = exports.regulatorProfileSchema = exports.financialInstitutionProfileSchema = exports.inputSupplierProfileSchema = exports.buyerProfileSchema = exports.processingUnitProfileSchema = exports.qaTeamProfileSchema = exports.logisticsTeamProfileSchema = exports.fieldAgentProfileSchema = exports.farmerProfileSchema = void 0;
const zod_1 = require("zod");
// Base profile schema
const baseProfileSchema = zod_1.z.object({
    location: zod_1.z.string().optional(),
    profileSummary: zod_1.z.string().optional(),
    needs: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.farmerProfileSchema = baseProfileSchema.extend({
    farmSize: zod_1.z.number().optional(),
    crops: zod_1.z.array(zod_1.z.string()).optional(),
    livestock: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.fieldAgentProfileSchema = baseProfileSchema.extend({
    specialization: zod_1.z.string().optional(),
    yearsOfExperience: zod_1.z.number().optional(),
});
exports.logisticsTeamProfileSchema = baseProfileSchema.extend({
    fleetSize: zod_1.z.number().optional(),
    coverageArea: zod_1.z.string().optional(),
});
exports.qaTeamProfileSchema = baseProfileSchema.extend({
    certifications: zod_1.z.array(zod_1.z.string()).optional(),
    inspectionCapacity: zod_1.z.string().optional(),
});
exports.processingUnitProfileSchema = baseProfileSchema.extend({
    processingTypes: zod_1.z.array(zod_1.z.string()).optional(),
    capacity: zod_1.z.string().optional(),
});
exports.buyerProfileSchema = baseProfileSchema.extend({
    businessType: zod_1.z.string().optional(),
    productNeeds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.inputSupplierProfileSchema = baseProfileSchema.extend({
    productCategories: zod_1.z.array(zod_1.z.string()).optional(),
    distributionReach: zod_1.z.string().optional(),
});
exports.financialInstitutionProfileSchema = baseProfileSchema.extend({
    servicesOffered: zod_1.z.array(zod_1.z.string()).optional(),
    loanProducts: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.regulatorProfileSchema = baseProfileSchema.extend({
    jurisdiction: zod_1.z.string().optional(),
    regulatoryFocus: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.certificationBodyProfileSchema = baseProfileSchema.extend({
    certificationsOffered: zod_1.z.array(zod_1.z.string()).optional(),
    accreditation: zod_1.z.string().optional(),
});
exports.consumerProfileSchema = baseProfileSchema.extend({
    dietaryPreferences: zod_1.z.array(zod_1.z.string()).optional(),
    sustainabilityFocus: zod_1.z.boolean().optional(),
});
exports.researcherProfileSchema = baseProfileSchema.extend({
    institution: zod_1.z.string().optional(),
    researchInterests: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.logisticsPartnerProfileSchema = baseProfileSchema.extend({
    transportModes: zod_1.z.array(zod_1.z.string()).optional(),
    warehouseLocations: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.warehouseProfileSchema = baseProfileSchema.extend({
    storageCapacity: zod_1.z.string().optional(),
    storageConditions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.agronomyExpertProfileSchema = baseProfileSchema.extend({
    consultingAreas: zod_1.z.array(zod_1.z.string()).optional(),
    hourlyRate: zod_1.z.number().optional(),
});
exports.agroTourismOperatorProfileSchema = baseProfileSchema.extend({
    experiencesOffered: zod_1.z.array(zod_1.z.string()).optional(),
    bookingLink: zod_1.z.string().optional(),
});
exports.energyProviderProfileSchema = baseProfileSchema.extend({
    energySolutions: zod_1.z.array(zod_1.z.string()).optional(),
    installationServices: zod_1.z.boolean().optional(),
});
exports.agroExportFacilitatorProfileSchema = baseProfileSchema.extend({
    countriesOfOperation: zod_1.z.array(zod_1.z.string()).optional(),
    services: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.insuranceProviderProfileSchema = baseProfileSchema.extend({
    insuranceProducts: zod_1.z.array(zod_1.z.string()).optional(),
    coverageArea: zod_1.z.string().optional(),
});
exports.packagingSupplierProfileSchema = baseProfileSchema.extend({
    packagingTypes: zod_1.z.array(zod_1.z.string()).optional(),
    sustainabilityOptions: zod_1.z.boolean().optional(),
});
exports.crowdfunderProfileSchema = baseProfileSchema.extend({
    investmentInterests: zod_1.z.array(zod_1.z.string()).optional(),
    averageInvestmentSize: zod_1.z.string().optional(),
});
exports.agriTechInnovatorProfileSchema = baseProfileSchema.extend({
    technologyFocus: zod_1.z.array(zod_1.z.string()).optional(),
    integrationCapabilities: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.wasteManagementProfileSchema = baseProfileSchema.extend({
    wasteTypesAccepted: zod_1.z.array(zod_1.z.string()).optional(),
    outputProducts: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.equipmentSupplierProfileSchema = baseProfileSchema.extend({
    equipmentTypes: zod_1.z.array(zod_1.z.string()).optional(),
    brandsCarried: zod_1.z.array(zod_1.z.string()).optional(),
});
// A comprehensive map of role names to their respective schemas
exports.stakeholderProfileSchemas = {
    "Farmer": exports.farmerProfileSchema,
    "Agricultural Cooperative": baseProfileSchema,
    "Field Agent/Agronomist (DamDoh Internal)": exports.fieldAgentProfileSchema,
    "Operations/Logistics Team (DamDoh Internal)": exports.logisticsTeamProfileSchema,
    "Quality Assurance Team (DamDoh Internal)": exports.qaTeamProfileSchema,
    "Processing & Packaging Unit": exports.processingUnitProfileSchema,
    "Buyer (Restaurant, Supermarket, Exporter)": exports.buyerProfileSchema,
    "Input Supplier (Seed, Fertilizer, Pesticide)": exports.inputSupplierProfileSchema,
    "Equipment Supplier (Sales of Machinery/IoT)": exports.equipmentSupplierProfileSchema,
    "Financial Institution (Micro-finance/Loans)": exports.financialInstitutionProfileSchema,
    "Government Regulator/Auditor": exports.regulatorProfileSchema,
    "Certification Body (Organic, Fair Trade etc.)": exports.certificationBodyProfileSchema,
    "Consumer": exports.consumerProfileSchema,
    "Researcher/Academic": exports.researcherProfileSchema,
    "Logistics Partner (Third-Party Transporter)": exports.logisticsPartnerProfileSchema,
    "Storage/Warehouse Facility": exports.warehouseProfileSchema,
    "Agronomy Expert/Consultant (External)": exports.agronomyExpertProfileSchema,
    "Agro-Tourism Operator": exports.agroTourismOperatorProfileSchema,
    "Energy Solutions Provider (Solar, Biogas)": exports.energyProviderProfileSchema,
    "Agro-Export Facilitator/Customs Broker": exports.agroExportFacilitatorProfileSchema,
    "Agri-Tech Innovator/Developer": exports.agriTechInnovatorProfileSchema,
    "Waste Management & Compost Facility": exports.wasteManagementProfileSchema,
    "Crowdfunder (Impact Investor, Individual)": exports.crowdfunderProfileSchema,
    "Insurance Provider": exports.insuranceProviderProfileSchema,
    "Packaging Supplier": exports.packagingSupplierProfileSchema,
};
//# sourceMappingURL=schemas.js.map