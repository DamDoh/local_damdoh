import { z } from "zod";

// Base profile schema
const baseProfileSchema = z.object({
  location: z.string().optional(),
  profileSummary: z.string().optional(),
  needs: z.array(z.string()).optional(),
});

export const farmerProfileSchema = baseProfileSchema.extend({
  farmSize: z.number().optional(),
  crops: z.array(z.string()).optional(),
  livestock: z.array(z.string()).optional(),
});

export const fieldAgentProfileSchema = baseProfileSchema.extend({
  specialization: z.string().optional(),
  yearsOfExperience: z.number().optional(),
});

export const logisticsTeamProfileSchema = baseProfileSchema.extend({
  fleetSize: z.number().optional(),
  coverageArea: z.string().optional(),
});

export const qaTeamProfileSchema = baseProfileSchema.extend({
  certifications: z.array(z.string()).optional(),
  inspectionCapacity: z.string().optional(),
});

export const processingUnitProfileSchema = baseProfileSchema.extend({
  processingTypes: z.array(z.string()).optional(),
  capacity: z.string().optional(),
});

export const buyerProfileSchema = baseProfileSchema.extend({
  businessType: z.string().optional(),
  productNeeds: z.array(z.string()).optional(),
});

export const inputSupplierProfileSchema = baseProfileSchema.extend({
  productCategories: z.array(z.string()).optional(),
  distributionReach: z.string().optional(),
});

export const financialInstitutionProfileSchema = baseProfileSchema.extend({
  servicesOffered: z.array(z.string()).optional(),
  loanProducts: z.array(z.string()).optional(),
});

export const regulatorProfileSchema = baseProfileSchema.extend({
  jurisdiction: z.string().optional(),
  regulatoryFocus: z.array(z.string()).optional(),
});

export const certificationBodyProfileSchema = baseProfileSchema.extend({
  certificationsOffered: z.array(z.string()).optional(),
  accreditation: z.string().optional(),
});

export const consumerProfileSchema = baseProfileSchema.extend({
  dietaryPreferences: z.array(z.string()).optional(),
  sustainabilityFocus: z.boolean().optional(),
});

export const researcherProfileSchema = baseProfileSchema.extend({
  institution: z.string().optional(),
  researchInterests: z.array(z.string()).optional(),
});

export const logisticsPartnerProfileSchema = baseProfileSchema.extend({
  transportModes: z.array(z.string()).optional(),
  warehouseLocations: z.array(z.string()).optional(),
});

export const warehouseProfileSchema = baseProfileSchema.extend({
  storageCapacity: z.string().optional(),
  storageConditions: z.array(z.string()).optional(),
});

export const agronomyExpertProfileSchema = baseProfileSchema.extend({
  consultingAreas: z.array(z.string()).optional(),
  hourlyRate: z.number().optional(),
});

export const agroTourismOperatorProfileSchema = baseProfileSchema.extend({
  experiencesOffered: z.array(z.string()).optional(),
  bookingLink: z.string().optional(),
});

export const energyProviderProfileSchema = baseProfileSchema.extend({
  energySolutions: z.array(z.string()).optional(),
  installationServices: z.boolean().optional(),
});

export const agroExportFacilitatorProfileSchema = baseProfileSchema.extend({
  countriesOfOperation: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
});

export const insuranceProviderProfileSchema = baseProfileSchema.extend({
  insuranceProducts: z.array(z.string()).optional(),
  coverageArea: z.string().optional(),
});

export const packagingSupplierProfileSchema = baseProfileSchema.extend({
  packagingTypes: z.array(z.string()).optional(),
  sustainabilityOptions: z.boolean().optional(),
});

export const crowdfunderProfileSchema = baseProfileSchema.extend({
  investmentInterests: z.array(z.string()).optional(),
  averageInvestmentSize: z.string().optional(),
});

export const agriTechInnovatorProfileSchema = baseProfileSchema.extend({
    technologyFocus: z.array(z.string()).optional(),
    integrationCapabilities: z.array(z.string()).optional(),
});

export const wasteManagementProfileSchema = baseProfileSchema.extend({
    wasteTypesAccepted: z.array(z.string()).optional(),
    outputProducts: z.array(z.string()).optional(),
});

export const equipmentSupplierProfileSchema = baseProfileSchema.extend({
    equipmentTypes: z.array(z.string()).optional(),
    brandsCarried: z.array(z.string()).optional(),
});

// A comprehensive map of role names to their respective schemas
export const stakeholderProfileSchemas = {
  "Farmer": farmerProfileSchema,
  "Agricultural Cooperative": baseProfileSchema,
  "Field Agent/Agronomist (DamDoh Internal)": fieldAgentProfileSchema,
  "Operations/Logistics Team (DamDoh Internal)": logisticsTeamProfileSchema,
  "Quality Assurance Team (DamDoh Internal)": qaTeamProfileSchema,
  "Processing & Packaging Unit": processingUnitProfileSchema,
  "Buyer (Restaurant, Supermarket, Exporter)": buyerProfileSchema,
  "Input Supplier (Seed, Fertilizer, Pesticide)": inputSupplierProfileSchema,
  "Equipment Supplier (Sales of Machinery/IoT)": equipmentSupplierProfileSchema,
  "Financial Institution (Micro-finance/Loans)": financialInstitutionProfileSchema,
  "Government Regulator/Auditor": regulatorProfileSchema,
  "Certification Body (Organic, Fair Trade etc.)": certificationBodyProfileSchema,
  "Consumer": consumerProfileSchema,
  "Researcher/Academic": researcherProfileSchema,
  "Logistics Partner (Third-Party Transporter)": logisticsPartnerProfileSchema,
  "Storage/Warehouse Facility": warehouseProfileSchema,
  "Agronomy Expert/Consultant (External)": agronomyExpertProfileSchema,
  "Agro-Tourism Operator": agroTourismOperatorProfileSchema,
  "Energy Solutions Provider (Solar, Biogas)": energyProviderProfileSchema,
  "Agro-Export Facilitator/Customs Broker": agroExportFacilitatorProfileSchema,
  "Agri-Tech Innovator/Developer": agriTechInnovatorProfileSchema,
  "Waste Management & Compost Facility": wasteManagementProfileSchema,
  "Crowdfunder (Impact Investor, Individual)": crowdfunderProfileSchema,
  "Insurance Provider": insuranceProviderProfileSchema,
  "Packaging Supplier": packagingSupplierProfileSchema,
};
