

import type { z } from 'zod';
import type { 
    StakeholderProfileSchema,
    MarketplaceItemSchema,
    MarketplaceOrderSchema,
    AgriEventSchema,
    ShopSchema,
    ApiKeySchema,
    InsuranceProductSchema,
    InsuranceApplicationSchema,
    FinancialProductSchema,
    FinancialApplicationSchema,
    SmartSearchInterpretationSchema,
    MarketplaceRecommendationInputSchema,
    MarketplaceRecommendationOutputSchema,
    CropRotationInputSchema,
    CropRotationOutputSchema,
    DiagnoseCropInputSchema,
    DiagnoseCropOutputSchema,
    FarmingAssistantInputSchema,
    FarmingAssistantOutputSchema,
    KnfBatchSchema,
    FeedItemSchema,
    ServiceItemSchema,
    ConnectionSchema,
    ConnectionRequestSchema,
    ConversationSchema,
    FinancialTransactionSchema,
    FinancialSummarySchema,
    ForumGroupSchema,
    GroupPostSchema,
    JoinRequestSchema,
    MarketplaceCouponSchema,
    MessageSchema,
    MobileDiscoverItemSchema,
    MobileHomeCategorySchema,
    NotificationSchema,
    PaymentLogSchema,
    PollOptionSchema,
    PostReplySchema,
    WorkerSchema,
    WorkLogSchema,
    AdminActivitySchema,
    AdminDashboardDataSchema,
    AgriTechInnovatorDashboardDataSchema,
    AgroExportDashboardDataSchema,
    AgroTourismDashboardDataSchema,
    AgronomistDashboardDataSchema,
    BuyerDashboardDataSchema,
    CertificationBodyDashboardDataSchema,
    CooperativeDashboardDataSchema,
    CrowdfunderDashboardDataSchema,
    EnergyProviderDashboardDataSchema,
    EquipmentSupplierDashboardDataSchema,
    FarmerDashboardDataSchema,
    FarmerDashboardAlertSchema,
    FieldAgentDashboardDataSchema,
    FiDashboardDataSchema,
    InputSupplierDashboardDataSchema,
    InsuranceProviderDashboardDataSchema,
    OperationsDashboardDataSchema,
    PackagingSupplierDashboardDataSchema,
    ProcessingUnitDashboardDataSchema,
    QaDashboardDataSchema,
    RegulatorDashboardDataSchema,
    ResearcherDashboardDataSchema,
    SustainabilityDashboardDataSchema,
    WarehouseDashboardDataSchema,
    WasteManagementDashboardDataSchema,
    createFarmSchema,
    createCropSchema,
    GroupPostReplySchema,
    createInventoryItemSchema,
    KnowledgeArticleSchema,
    FarmAssetSchema,
    ForumTopicSchema
} from './schemas';
import type { LucideIcon } from 'lucide-react';


// =================================================================
// 1. CORE TYPES (INFERRED FROM ZOD SCHEMAS)
// These are the primary data structures used across the application.
// =================================================================

export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
export type MarketplaceOrder = z.infer<typeof MarketplaceOrderSchema> & {
    buyerProfile: { displayName: string, avatarUrl?: string },
    sellerProfile?: { displayName: string, avatarUrl?: string }
};
export type AgriEvent = z.infer<typeof AgriEventSchema> & {
  id: string; // Add id to the type for frontend use
  organizerId: string;
  registeredAttendeesCount: number;
  isRegistered?: boolean;
};
export type ForumTopic = z.infer<typeof ForumTopicSchema>;
export type Shop = z.infer<typeof ShopSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type InsuranceProduct = z.infer<typeof InsuranceProductSchema>;
export type InsuranceApplication = z.infer<typeof InsuranceApplicationSchema>;
export type FinancialProduct = z.infer<typeof FinancialProductSchema>;
export type FinancialApplication = z.infer<typeof FinancialApplicationSchema>;
export type KnfBatch = z.infer<typeof KnfBatchSchema>;
export type FeedItem = z.infer<typeof FeedItemSchema>;
export type ServiceItem = z.infer<typeof ServiceItemSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type ConnectionRequest = z.infer<typeof ConnectionRequestSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type FinancialTransaction = z.infer<typeof FinancialTransactionSchema>;
export type FinancialSummary = z.infer<typeof FinancialSummarySchema>;
export type ForumGroup = z.infer<typeof ForumGroupSchema>;
export type GroupPost = z.infer<typeof GroupPostSchema>;
export type JoinRequest = z.infer<typeof JoinRequestSchema>;
export type MarketplaceCoupon = z.infer<typeof MarketplaceCouponSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MobileDiscoverItem = z.infer<typeof MobileDiscoverItemSchema>;
export type MobileHomeCategory = z.infer<typeof MobileHomeCategorySchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type PaymentLog = z.infer<typeof PaymentLogSchema>;
export type PollOption = z.infer<typeof PollOptionSchema>;
export type PostReply = z.infer<typeof PostReplySchema>;
export type GroupPostReply = z.infer<typeof GroupPostReplySchema>;
export type Worker = z.infer<typeof WorkerSchema>;
export type WorkLog = z.infer<typeof WorkLogSchema>;
export type Farm = z.infer<typeof createFarmSchema> & { id: string };
export type Crop = z.infer<typeof createCropSchema> & { id: string, plantingDate: string, harvestDate?: string, createdAt: string, ownerId: string };
export type InventoryItem = z.infer<typeof createInventoryItemSchema> & { id: string, purchaseDate?: string, expiryDate?: string | null };
export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
export type FarmAsset = z.infer<typeof FarmAssetSchema>;


export type UserRole = "Admin" | "Regulator" | "Auditor" | "Farmer" | "System" | "Buyer" | "Input Supplier" | "Agricultural Cooperative" | "Field Agent/Agronomist (DamDoh Internal)" | "Financial Institution (Micro-finance/Loans)" | "Logistics Partner (Third-Party Transporter)" | "Processing & Packaging Unit" | "Researcher/Academic" | "Quality Assurance Team (DamDoh Internal)" | "Certification Body (Organic, Fair Trade etc.)" | "Insurance Provider" | "Energy Solutions Provider (Solar, Biogas)" | "Agro-Tourism Operator" | "Agro-Export Facilitator/Customs Broker" | "Crowdfunder (Impact Investor, Individual)" | "Consumer" | "General" | "Equipment Supplier (Sales of Machinery/IoT)" | "Waste Management & Compost Facility" | "Storage/Warehouse Facility" | "Agronomy Expert/Consultant (External)" | "Agri-Tech Innovator/Developer" | "Operations/Logistics Team (DamDoh Internal)" | "Packaging Supplier";


// =================================================================
// 2. DASHBOARD & UI-SPECIFIC TYPES
// =================================================================
export type FarmerDashboardAlert = z.infer<typeof FarmerDashboardAlertSchema>;
export type FarmerDashboardData = z.infer<typeof FarmerDashboardDataSchema>;
export type CooperativeDashboardData = z.infer<typeof CooperativeDashboardDataSchema> & { groupId: string | null };
export type BuyerDashboardData = z.infer<typeof BuyerDashboardDataSchema>;
export type RegulatorDashboardData = z.infer<typeof RegulatorDashboardDataSchema>;
export type LogisticsDashboardData = z.infer<typeof LogisticsDashboardDataSchema>;
export type FiDashboardData = z.infer<typeof FiDashboardDataSchema>;
export type FieldAgentDashboardData = z.infer<typeof FieldAgentDashboardDataSchema>;
export type InputSupplierDashboardData = z.infer<typeof InputSupplierDashboardDataSchema>;
export type AgroExportDashboardData = z.infer<typeof AgroExportDashboardDataSchema>;
export type ProcessingUnitDashboardData = z.infer<typeof ProcessingUnitDashboardDataSchema>;
export type WarehouseDashboardData = z.infer<typeof WarehouseDashboardDataSchema>;
export type QaDashboardData = z.infer<typeof QaDashboardDataSchema>;
export type CertificationBodyDashboardData = z.infer<typeof CertificationBodyDashboardDataSchema>;
export type ResearcherDashboardData = z.infer<typeof ResearcherDashboardDataSchema>;
export type AgronomistDashboardData = z.infer<typeof AgronomistDashboardDataSchema>;
export type AgroTourismDashboardData = z.infer<typeof AgroTourismDashboardDataSchema>;
export type InsuranceProviderDashboardData = z.infer<typeof InsuranceProviderDashboardDataSchema>;
export type EnergyProviderDashboardData = z.infer<typeof EnergyProviderDashboardDataSchema>;
export type CrowdfunderDashboardData = z.infer<typeof CrowdfunderDashboardDataSchema>;
export type EquipmentSupplierDashboardData = z.infer<typeof EquipmentSupplierDashboardDataSchema>;
export type WasteManagementDashboardData = z.infer<typeof WasteManagementDashboardDataSchema>;
export type PackagingSupplierDashboardData = z.infer<typeof PackagingSupplierDashboardDataSchema>;
export type SustainabilityDashboardData = z.infer<typeof SustainabilityDashboardDataSchema>;
export type OperationsDashboardData = z.infer<typeof OperationsDashboardDataSchema>;
export type AdminDashboardData = z.infer<typeof AdminDashboardDataSchema>;
export type AdminActivity = z.infer<typeof AdminActivitySchema>;
export type AgriTechInnovatorDashboardData = z.infer<typeof AgriTechInnovatorDashboardDataSchema>;

// =================================================================
// 3. AI FLOW TYPES (Inferred from schemas)
// =================================================================

export type SmartSearchInterpretation = z.infer<typeof SmartSearchInterpretationSchema>;
export type MarketplaceRecommendationInput = z.infer<typeof MarketplaceRecommendationInputSchema>;
export type MarketplaceRecommendationOutput = z.infer<typeof MarketplaceRecommendationOutputSchema>;
export type CropRotationInput = z.infer<typeof CropRotationInputSchema>;
export type CropRotationOutput = z.infer<typeof CropRotationOutputSchema>;
export type DiagnoseCropInput = z.infer<typeof DiagnoseCropInputSchema>;
export type DiagnoseCropOutput = z.infer<typeof DiagnoseCropOutputSchema>;
export type FarmingAssistantInput = z.infer<typeof FarmingAssistantInputSchema>;
export type FarmingAssistantOutput = z.infer<typeof FarmingAssistantOutputSchema>;

