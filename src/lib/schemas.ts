
import { z } from "zod";
import { STAKEHOLDER_ROLES, LISTING_TYPES, UNIFIED_MARKETPLACE_CATEGORY_IDS, AGRI_EVENT_TYPES } from "@/lib/constants";
import type { GeoPoint } from 'firebase/firestore'; // Using a conceptual type here
export const ContactInfoSchema = z.object({
  phone: z.string().optional(),
  website: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address" }).optional(),
});

export const StakeholderProfileSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
  role: z.enum([...STAKEHOLDER_ROLES, 'financial_institution', 'insurance_provider']), // Expanded roles for FI/IPs
  // Modified location to reflect GeoPoint structure for better spatial data handling
  location: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  bio: z.string().max(2000).optional(),
  profileSummary: z.string().max(250).optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  areasOfInterest: z.array(z.string()).optional(),
  needs: z.array(z.string()).optional(),
  contactInfo: ContactInfoSchema.optional(),
  connections: z.array(z.string().cuid2()).optional(), 
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
});

export const AiPriceSuggestionSchema = z.object({
  min: z.number(),
  max: z.number(),
  confidence: z.enum(['Low', 'Medium', 'High']), 
});

// Enhanced Schema for a 'farms' collection
export const FarmSchema = z.object({
  farmId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the farm
  farmerId: z.string().cuid2({ message: "Invalid farmer ID" }), // Links to the owning farmer's UserProfile
  name: z.string().min(2, "Farm name must be at least 2 characters.").max(100), // Name of the farm
  // Using a structure that maps to Firestore GeoPoint
  location: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  size: z.string().max(50).optional(), // Size of the farm (e.g., "50 Hectares", "5 Rai")
  mainCrops: z.array(z.string().max(50)).optional(), // Array of main crops grown
  description: z.string().max(500).optional(), // Optional description of the farm
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }), // Timestamp of creation
  // Add fields for certifications, photos, etc. as needed later
});

// Enhanced Schema for a 'batches' collection - Origin of Vibrant Traceability ID
export const BatchSchema = z.object({
  batchId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the batch - This IS the Vibrant Traceability ID
  farmId: z.string().cuid2({ message: "Invalid farm ID" }), // Links to the farm where the batch originated
  productName: z.string().min(2).max(100), // The specific product in this batch (e.g., "Jasmine Rice", "Mango")
  quantity: z.number().min(0), // Quantity in the batch
  unit: z.string().max(20), // Unit of quantity (e.g., "kg", "tonnes", "pieces")
  harvestDate: z.string().datetime({ message: "Invalid ISO datetime string" }), // Date of harvest or production
  status: z.string().max(50), // Current status (e.g., "Harvested", "In Storage", "Processing", "Sold")
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }), // Timestamp of batch creation record
  // Add fields for initial quality notes, photos of harvest, etc.
});

export const MarketplaceItemSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the marketplace listing
  name: z.string().min(3, "Name must be at least 3 characters.").max(100, "Name cannot exceed 100 characters."), // Name of the product or service
  listingType: z.enum(LISTING_TYPES), // Critical: Differentiates between 'Product' and 'Service'
  description: z.string().min(10, "Description must be at least 10 characters long.").max(2000, "Description cannot exceed 2000 characters."), // Increased max length
  price: z.number().min(0).optional(), // Price is optional, esp. for services with 'Contact for Quote'
  currency: z.string().length(3, "Currency code must be 3 characters.").toUpperCase().default("USD"),
  perUnit: z.string().max(30, "Unit description is too long.").optional().describe("For products: e.g., 'kg', 'bushel', 'piece'"),
  sellerId: z.string().cuid2({ message: "Invalid seller ID" }), // Links to the creator/seller of the listing
  category: z.enum(UNIFIED_MARKETPLACE_CATEGORY_IDS, { errorMap: () => ({ message: "Please select a valid category."}) }),
  // Changed location to use the GeoPoint structure for consistency and spatial queries
  // A string location can still be stored/displayed, but the GeoPoint is for backend spatial logic
  location: z.string().min(2, "Location is too short.").max(150, "Location is too long."), // Increased max length
  imageUrl: z.string().url({ message: "Invalid image URL."}).optional().or(z.literal('')),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  contactInfo: z.string().min(5, "Contact info is too short.").max(300, "Contact info is too long.").optional().describe("Increased max length for diverse contact methods"), // Increased max length for diverse contact methods
  dataAiHint: z.string().max(50, "AI hint is too long.").optional(),
  isSustainable: z.boolean().optional().default(false),
  sellerVerification: z.enum(['Verified', 'Pending', 'Unverified']).optional().default('Pending'),
  aiPriceSuggestion: AiPriceSuggestionSchema.optional(),

  // --- Product-specific fields ---
  stockQuantity: z.number().int().min(0).optional().describe("For products: current stock level"),
  relatedTraceabilityId: z.string().cuid2({ message: "Invalid traceability ID" }).optional().describe("For products: Links this listing to a Batch ID or a specific point in the traceability chain"), // Renamed from batchId for broader applicability

  // Service-specific fields
  serviceType: z.string().max(50).optional().describe("For services: e.g., 'financial_service', 'insurance_service', 'logistics', 'agronomy_consulting'"), // New: Type of service
  priceDisplay: z.string().max(100).optional().describe("For services: How price is displayed (e.g., 'Negotiable', 'Rate varies', 'Starting at X')"), // New: Flexible price display
  availabilityStatus: z.string().max(50).optional().describe("For services: e.g., 'Available', 'Booking Required', 'Currently Unavailable'"), // New: Availability status for services
  serviceArea: z.string().max(150).optional().describe("For services: Geographic area where the service is offered"),
  relatedFinancialProductId: z.string().cuid2({ message: "Invalid financial product ID" }).optional().describe("For financial services: Links to a detailed financial product configuration"), // New: Link to detailed financial product (from Phase 4)
  relatedInsuranceProductId: z.string().cuid2({ message: "Invalid insurance product ID" }).optional().describe("For insurance services: Links to a detailed insurance product configuration"), // New: Link to detailed insurance product (from Phase 4)
  // Add other service-specific links as needed (e.g., relatedLogisticsRouteId)

  // --- Common additional fields (can apply to either type) ---
  skillsRequired: z.array(z.string().max(50, "Skill entry is too long.")).optional().describe("For services: List key skills offered or required."),
  experienceLevel: z.string().max(100, "Experience level description is too long.").optional().describe("For services: e.g., Beginner, Intermediate, Expert, 5+ years"),
  compensation: z.string().max(150, "Compensation details are too long.").optional().describe("For services: e.g., $50/hr, Project-based, Negotiable, Specific loan terms"),
  // Additional fields for various listing types
  serviceAvailability: z.string().max(100, "Service availability is too long.").optional().describe("For services: e.g., Mon-Fri 9am-5pm, By Appointment"),
  brand: z.string().max(50, "Brand name is too long.").optional().describe("For products/equipment: Brand of the item"),
  condition: z.enum(['New', 'Used', 'Refurbished']).optional().describe("For products/equipment: Condition of the item"),
  certifications: z.array(z.string().max(100, "Certification name is too long.")).optional().describe("List of relevant certifications (e.g., Organic, Fair Trade, ISO)"),
  traceabilityLink: z.string().url({ message: "Invalid traceability link URL." }).optional().or(z.literal('')).describe("Direct link to an external traceability system if applicable"),
});

// Conceptual Schema for 'marketplace_orders'
// Note: In a real application, this would be a formal Firestore schema definition.
export const MarketplaceOrderSchema = z.object({
  orderId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the order/transaction
  listingId: z.string().cuid2({ message: "Invalid listing ID" }), // Links to the specific MarketplaceItem that was ordered
  buyerId: z.string().cuid2({ message: "Invalid buyer ID" }), // Links to the buyer's UserProfile
  sellerId: z.string().cuid2({ message: "Invalid seller ID" }), // Links to the seller's UserProfile (redundant but useful)
  timestamp: z.string().datetime({ message: "Invalid ISO datetime string" }), // When the order/application was initiated
  status: z.string().max(50), // Current status (e.g., 'pending', 'completed', 'cancelled', 'application_submitted', 'approved', 'rejected')
  // Crucial: Mirroring the listingType from the MarketplaceItem
  listingType: z.enum(LISTING_TYPES),
  // Specifies the type of item ordered, especially relevant for services
  itemType: z.string().max(50).describe("e.g., 'physical_product', 'financial_service_application', 'consultation_booking'"),
  quantity: z.number().min(0).optional().describe("Quantity for products"), // Quantity, primarily for products
  totalPrice: z.number().min(0).optional().describe("Total price for products, or estimated cost for services"), // Total price, mainly for products
  relatedTraceabilityId: z.string().cuid2({ message: "Invalid traceability ID" }).optional().describe("For product orders: Link back to the Batch ID"), // Link back to traceability for products
  relatedApplicationId: z.string().cuid2({ message: "Invalid application ID" }).optional().describe("For service orders (applications): Link to the detailed application record (from Phase 4)"), // New: Link to the application record for service orders
});
export const ForumTopicSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  title: z.string().min(10).max(150),
  description: z.string().min(20).max(2000),
  creatorId: z.string().cuid2({ message: "Invalid creator ID" }),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  postCount: z.number().int().min(0),
  lastActivityAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  icon: z.string().optional(), 
});

export const ForumPostSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  topicId: z.string().cuid2({ message: "Invalid topic ID" }),
  authorId: z.string().cuid2({ message: "Invalid author ID" }),
  content: z.string().min(1, "Post content cannot be empty.").max(5000),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }).optional(),
  likes: z.number().int().min(0),
  parentId: z.string().cuid2().optional(), 
});

// Enhanced Schema for a 'traceability_events' collection
export const TraceabilityEventSchema = z.object({
  eventId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the event
  batchId: z.string().cuid2({ message: "Invalid batch ID" }), // Links to the specific batch this event belongs to
  // Type of event (e.g., "Fertilization", "Pest Control", "Harvest", "Washing", "Packaging", "Shipping", "Quality Check")
  eventType: z.string().max(50), // Type of event (e.g., "Fertilization", "Pest Control", "Harvest", "Washing", "Packaging", "Shipping", "Quality Check")
  timestamp: z.string().datetime({ message: "Invalid ISO datetime string" }), // When the event occurred
  // Location where the event occurred (can differ from farm location)
  location: z.object({ // Location where the event occurred (can differ from farm location)
    lat: z.number(),
    lon: z.number(),
  }).optional(),
  details: z.string().max(1000).optional(), // Detailed description of the event
  photoUrl: z.string().url({ message: "Invalid photo URL." }).optional().or(z.literal('')), // Optional photo documentation
  verifierId: z.string().cuid2({ message: "Invalid verifier ID" }).optional(), // Optional link to a user who verified this event (e.g., QA officer, inspector)
});
// --- Firebase Schema Definitions and Cloud Functions ---
// For a robust traceability system, define these schemas formally in Firestore.
// Implement Cloud Functions:
// - To validate the sequence of events for a batch (e.g., Harvest must come before Packaging).
// - To ensure data integrity and prevent tampering.

// Comments about considering optional fields for external verification:
// - photoUrl: (string) Optional field to link to a photo documenting the event.
// - verificationLink: (string) Optional field to link to external documentation or a verification record.

export const AgriEventSchema = z.object({
  id: z.string().cuid2({ message: "Invalid CUID" }),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  eventDate: z.string().datetime({ message: "Invalid ISO datetime string for event date" }),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM).").optional().or(z.literal('')),
  location: z.string().min(3).max(150),
  eventType: z.enum(AGRI_EVENT_TYPES),
  organizer: z.string().max(100).optional(),
  websiteLink: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  listerId: z.string().cuid2({ message: "Invalid lister ID" }),
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  dataAiHint: z.string().optional(),
});

// Conceptual Schema for 'reviews'
// Note: In a real application, this would be a formal Firestore schema definition.
export const ReviewSchema = z.object({
  reviewId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the review
  listingId: z.string().cuid2({ message: "Invalid listing ID" }), // Links to the MarketplaceItem being reviewed
  reviewerId: z.string().cuid2({ message: "Invalid reviewer ID" }), // Links to the user who wrote the review
  rating: z.number().int().min(1).max(5), // Rating from 1 to 5
  comment: z.string().max(1000).optional(), // Optional text comment
  timestamp: z.string().datetime({ message: "Invalid ISO datetime string" }), // When the review was submitted
  // Ensure listingId can link to *any* marketplace listing, regardless of listingType (Product or Service)
});

// Conceptual Schema for 'chats' collection for in-app messaging
// Note: In a real application, this would be a formal Firestore schema definition.
export const ChatSchema = z.object({
  chatId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the chat conversation
  participants: z.array(z.string().cuid2()), // Array of UserProfile IDs participating in the chat (usually 2 for direct messages)
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }), // Timestamp of chat creation
  updatedAt: z.string().datetime({ message: "Invalid ISO datetime string" }), // Timestamp of the last message/activity
  lastMessage: z.string().max(500).optional(), // Preview of the last message
  // Add fields for chat name (for groups), chat type (direct, group), etc. as needed
});

// Conceptual Schema for 'messages' collection within a chat
// Note: In a real application, this would be a formal Firestore schema definition.
export const MessageSchema = z.object({
  messageId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the message
  chatId: z.string().cuid2({ message: "Invalid chat ID" }), // Links to the chat conversation this message belongs to
  senderId: z.string().cuid2({ message: "Invalid sender ID" }), // Links to the UserProfile ID of the sender
  timestamp: z.string().datetime({ message: "Invalid ISO datetime string" }), // When the message was sent
  content: z.string().min(1, "Message cannot be empty.").max(5000), // The message content
  // Add fields for attachments, read status, etc. as needed
});

// Conceptual Schema for 'financial_products' collection
// This holds detailed information about financial products offered by FIs.
export const FinancialProductSchema = z.object({
  productId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the financial product
  providerId: z.string().cuid2({ message: "Invalid provider ID" }), // Links to the Financial Institution's UserProfile
  productName: z.string().min(5).max(150), // Name of the financial product (e.g., "Seasonal Input Loan")
  type: z.string().max(50), // Type of product (e.g., 'loan', 'credit', 'grant', 'savings')
  description: z.string().min(20).max(2000), // Detailed description of the product
  terms: z.string().max(2000), // Key terms and conditions
  eligibilityCriteria: z.string().max(1000), // Who is eligible for this product
  interestRate: z.string().max(50).optional(), // Interest rate or equivalent terms
  loanTenor: z.string().max(50).optional(), // Repayment period for loans
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }), // Timestamp of creation
  // Add fields for required documentation, application process link, etc.
});

// Conceptual Schema for 'insurance_products' collection
// This holds detailed information about insurance products offered by IPs.
export const InsuranceProductSchema = z.object({
  productId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the insurance product
  providerId: z.string().cuid2({ message: "Invalid provider ID" }), // Links to the Insurance Provider's UserProfile
  productName: z.string().min(5).max(150), // Name of the insurance product (e.g., "Drought Resistant Crop Insurance")
  type: z.string().max(50), // Type of insurance (e.g., 'crop_insurance', 'livestock_insurance', 'property_insurance')
  description: z.string().min(20).max(2000), // Detailed description of the product
  coverageDetails: z.string().max(2000), // What is covered by the insurance
  eligibilityCriteria: z.string().max(1000), // Who is eligible for this product
  premiumCalculation: z.string().max(100).optional(), // How premiums are calculated or displayed
  createdAt: z.string().datetime({ message: "Invalid ISO datetime string" }), // Timestamp of creation
  // Add fields for claim process, required documentation, etc.
});

// Conceptual Schema for 'applications' collection for tracking financial/insurance applications
// Note: In a real application, this would be a formal Firestore schema definition.
export const ApplicationSchema = z.object({
  applicationId: z.string().cuid2({ message: "Invalid CUID" }), // Unique ID for the application
  applicantId: z.string().cuid2({ message: "Invalid applicant ID" }), // Links to the UserProfile of the farmer/user applying
  productId: z.string().cuid2({ message: "Invalid product ID" }), // References the specific financial_product or insurance_product applied for
  productType: z.enum(['financial', 'insurance']), // Type of product applied for
  providerId: z.string().cuid2({ message: "Invalid provider ID" }), // Links to the FI/IP UserProfile offering the product
  applicationDate: z.string().datetime({ message: "Invalid ISO datetime string" }), // Timestamp when the application was submitted
  status: z.enum(['pending_review', 'approved', 'rejected', 'more_info_needed', 'under_processing']), // Current status of the application
  requestedAmount: z.number().min(0).optional(), // The amount of loan/credit requested (optional for some product types)
  // Placeholder for data sharing consent - will be fully implemented later
  consentGivenForDataSharing: z.boolean(), 
  // Add fields for additional application data, documents, notes, etc. as needed
});




