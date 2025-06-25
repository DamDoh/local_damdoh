
import { z } from 'zod';

// =================================================================================
// MODULE 1: THE CORE DATA & TRACEABILITY ENGINE
// =================================================================================

// ... (existing Module 1 schemas: MasterDataProductSchema, MasterDataInputSchema, VtiRegistrySchema, TraceabilityEventSchema, GeospatialAssetSchema) ...

/**
 * Schema for master data of certifications.
 */
export const MasterDataCertificationSchema = z.object({
  certificationId: z.string().uuid(),
  name_en: z.string(),
  issuingBody: z.string(),
  scope: z.enum(['organic', 'fair_trade', 'gmo_free', 'sustainability']),
});


// =================================================================================
// MODULE 3: THE FARMER'S HUB (Farmer Companion App)
// =================================================================================

/**
 * Schema for the Digital Filing Cabinet.
 * Stores simple income and expense records for a farmer's business.
 * This data is crucial for financial tracking and building a credit score.
 */
export const FarmFinancialsSchema = z.object({
  financialRecordId: z.string().uuid().describe("Unique ID for the financial record."),
  farmerId: z.string().describe("Reference to the farmer (user) this record belongs to."),
  type: z.enum(['income', 'expense']).describe("The type of financial transaction."),
  amount: z.number().positive().describe("The monetary value of the transaction."),
  currency: z.string().length(3).describe("The 3-letter currency code (e.g., USD, KHR)."),
  description: z.string().describe("A brief description of the transaction (e.g., 'Sale of 50kg Maize', 'Purchase of fertilizer')."),
  category: z.string().describe("A simple category for the transaction (e.g., 'Produce Sales', 'Input Costs', 'Labor', 'Equipment Maintenance')."),
  transactionDate: z.string().datetime().or(z.date()).describe("The date the transaction occurred."),
  invoiceImageUrl: z.string().url().optional().describe("Optional URL to a photo of the physical invoice or receipt stored in Cloud Storage."),
  createdAt: z.string().datetime().or(z.date()),
});


// =================================================================================
// Placeholder for other Modules
// =================================================================================
