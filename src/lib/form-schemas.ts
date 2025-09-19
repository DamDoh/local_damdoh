
import { z } from "zod";
import { UNIFIED_MARKETPLACE_CATEGORY_IDS, LISTING_TYPES, AGRI_EVENT_TYPES, STAKEHOLDER_ROLES } from '@/lib/constants';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const imageFileSchema = z
  .instanceof(File, { message: "Please upload a file." })
  .optional()
  .refine(
    (file) => !file || file.size <= MAX_FILE_SIZE_BYTES,
    `Max image size is ${MAX_FILE_SIZE_MB}MB.`
  )
  .refine(
    (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png and .webp formats are accepted."
  );

export const createAssetSchema = z.object({
  name: z.string().min(3, "Asset name must be at least 3 characters.").max(100),
  type: z.enum(['Machinery', 'Tool', 'Building', 'Other'], { required_error: "Please select an asset type." }),
  purchaseDate: z.date({ required_error: "Purchase date is required." }),
  value: z.coerce.number().min(0, "Value cannot be negative."),
  currency: z.string().default('USD'),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters.").optional(),
});
export type CreateAssetValues = z.infer<typeof createAssetSchema>;

export const createMarketplaceItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long.").max(100, "Name cannot exceed 100 characters."),
  listingType: z.enum(LISTING_TYPES, {
    errorMap: () => ({ message: "Please select a listing type (Product or Service)." }),
  }),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(2000, "Description cannot exceed 2000 characters."),
  price: z.coerce.number({ invalid_type_error: "Price must be a number." }).min(0, "Price cannot be negative.").optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code.").default("USD").transform(value => value.toUpperCase()),
  perUnit: z.string().max(30, "Unit description (e.g., /kg, /ton, /hour) is too long.").optional().or(z.literal('')),
  category: z.enum(UNIFIED_MARKETPLACE_CATEGORY_IDS, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  isSustainable: z.boolean().default(false).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  imageFile: imageFileSchema,
  dataAiHint: z.string().optional(),
  contactInfo: z.string().min(5, "Contact information must be at least 5 characters long.").max(200, "Contact information cannot exceed 200 characters.").optional(),
  skillsRequired: z.string().max(250, "Skills list is too long (max 250 chars).").optional(),
  compensation: z.string().max(100, "Compensation details are too long (max 100 chars).").optional(),
   // Fields from extended schema, made optional for the form
  brand: z.string().max(50, "Brand name is too long.").optional(),
  condition: z.enum(['New', 'Used', 'Refurbished']).optional(),
  availabilityStatus: z.enum(['Available', 'Booking Required', 'Limited Availability']).optional(),
  certifications: z.string().max(500, "Certifications list is too long.").optional(),
  relatedTraceabilityId: z.string().max(100, "Traceability ID is too long.").optional().nullable(),
  experienceLevel: z.string().optional(),
});

export type CreateMarketplaceItemValues = z.infer<typeof createMarketplaceItemSchema>;

export const createForumTopicSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters long.").max(150, "Title cannot exceed 150 characters."),
  description: z.string().min(20, "Description must be at least 20 characters long.").max(2000, "Description cannot exceed 2000 characters."),
});

export type CreateForumTopicValues = z.infer<typeof createForumTopicSchema>;

export const createAgriEventSchema = z.object({
  title: z.string().min(5, "Event title must be at least 5 characters.").max(100, "Event title cannot exceed 100 characters."),
  description: z.string().min(20, "Event description must be at least 20 characters.").max(2000, "Event description cannot exceed 2000 characters."),
  eventDate: z.date({
    required_error: "Event date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time in HH:MM format (e.g., 14:30).").optional().or(z.literal('')),
  location: z.string().min(3, "Location must be at least 3 characters.").max(150, "Location cannot exceed 150 characters."),
  eventType: z.enum(AGRI_EVENT_TYPES, {
    errorMap: () => ({ message: "Please select a valid event type." }),
  }),
  organizer: z.string().max(100, "Organizer name cannot exceed 100 characters.").optional(),
  websiteLink: z.string().url({ message: "Please enter a valid URL for the event website." }).optional().or(z.literal('')),
  imageFile: imageFileSchema,
  dataAiHint: z.string().optional(),
  registrationEnabled: z.boolean().default(false).optional(),
  attendeeLimit: z.coerce.number().int().positive("Must be a positive number.").optional(),
  price: z.coerce.number().min(0, "Price cannot be negative.").optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code.").optional(),
});

export type CreateAgriEventValues = z.infer<typeof createAgriEventSchema>;

export const createFarmSchema = z.object({
  name: z.string().min(3, "Farm name must be at least 3 characters.").max(100, "Name cannot exceed 100 characters."),
  description: z.string().max(500, "Description cannot exceed 500 characters.").optional(),
  location: z.string().min(3, "Please provide a location.").max(200, "Location cannot exceed 200 characters."),
  size: z.string().min(1, "Please provide the farm size.").max(100, "Size description cannot exceed 100 characters."),
  farmType: z.enum(['crop', 'livestock', 'mixed', 'aquaculture', 'other'], {
    errorMap: () => ({ message: "Please select a farm type." }),
  }),
  irrigationMethods: z.string().max(200, "Irrigation methods description is too long.").optional(),
});
export type CreateFarmValues = z.infer<typeof createFarmSchema>;

export const createCropSchema = z.object({
  farmId: z.string().min(1, "A farm ID is required."), // Added farmId for validation
  cropType: z.string().min(2, "Crop type must be at least 2 characters.").max(100, "Crop type cannot exceed 100 characters."),
  plantingDate: z.date({
    required_error: "A planting date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  harvestDate: z.date().optional(),
  expectedYield: z.string().max(50, "Expected yield description is too long.").optional(),
  currentStage: z.enum(['Planting', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting', 'Post-Harvest']).optional(),
  notes: z.string().max(1000, "Notes are too long.").optional(),
});
export type CreateCropValues = z.infer<typeof createCropSchema>;

export const createInputApplicationSchema = z.object({
  applicationDate: z.date({ required_error: "An application date is required." }),
  inputId: z.string().min(2, "Input name/ID is required.").max(100),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.string().min(1, "Unit is required.").max(20),
  method: z.string().max(100).optional(),
});
export type CreateInputApplicationValues = z.infer<typeof createInputApplicationSchema>;

export const createObservationSchema = z.object({
  observationType: z.string().min(3, { message: "Please select an observation type."}),
  observationDate: z.date({ required_error: "An observation date is required." }),
  details: z.string().min(10, "Details must be at least 10 characters.").max(1000),
  imageFile: imageFileSchema,
});
export type CreateObservationValues = z.infer<typeof createObservationSchema>;

export const createHarvestSchema = z.object({
    harvestDate: z.date({ required_error: "A harvest date is required."}),
    yield_kg: z.coerce.number().positive("Yield must be a positive number."),
    quality_grade: z.string().min(1, "Quality grade is required.").max(50),
    notes: z.string().max(1000).optional(),
    pricePerUnit: z.coerce.number().positive("Price must be a positive number.").optional(),
    unit: z.string().min(1, "Unit is required.").max(20).optional(),
});
export type CreateHarvestValues = z.infer<typeof createHarvestSchema>;


export const editProfileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters.").max(100, "Name cannot exceed 100 characters."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(STAKEHOLDER_ROLES, {
    errorMap: () => ({ message: "Please select a valid stakeholder role."}),
  }),
  profileSummary: z.string().max(250, "Profile summary cannot exceed 250 characters.").optional(),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters.").optional(),
  location: z.string().min(2, "Location must be at least 2 characters.").max(100, "Location cannot exceed 100 characters."),
  areasOfInterest: z.string().max(500, "Areas of interest cannot exceed 500 characters (use comma-separated values).").optional(),
  needs: z.string().max(500, "Needs/offerings cannot exceed 500 characters (use comma-separated values).").optional(),
  contactInfoPhone: z.string().max(30, "Phone number is too long.").optional(),
  contactInfoWebsite: z.string().url({ message: "Please enter a valid website URL."}).optional().or(z.literal('')),
  profileData: z.any().optional(),
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;

export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});
export type SignInValues = z.infer<typeof signInSchema>;


export const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100, { message: "Name cannot be longer than 100 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(STAKEHOLDER_ROLES, {
    errorMap: () => ({ message: "Please select a stakeholder role." }),
  }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters long." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // path of error
});

export type SignUpValues = z.infer<typeof signUpSchema>;


export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const logFinancialTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, "Date is required."),
  amount: z.coerce.number({ required_error: "Amount is required.", invalid_type_error: "Amount must be a number."}).min(0.01, "Amount must be positive."),
  currency: z.string().min(3, "Please select a currency.").max(3),
  description: z.string().min(3, "Description is required.").max(200, "Description is too long."),
  category: z.string().max(50, "Category is too long.").optional(),
});
export type LogFinancialTransactionValues = z.infer<typeof logFinancialTransactionSchema>;

export const createShopSchema = z.object({
  name: z.string().min(3, "Shop name must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(1000),
  stakeholderType: z.enum(STAKEHOLDER_ROLES, {
    errorMap: () => ({ message: "Please select a valid business type."}),
  }),
});
export type CreateShopValues = z.infer<typeof createShopSchema>;

// Internationalized schema using a factory function
export const getCreateMarketplaceCouponSchema = (t: (key: string) => string) => z.object({
  code: z.string()
      .min(4, t('code.min'))
      .max(20, t('code.max'))
      .regex(/^[a-zA-Z0-9]+$/, t('code.regex')),
  discountType: z.enum(['percentage', 'fixed'], { required_error: t('discountType.required') }),
  discountValue: z.coerce.number({invalid_type_error: t('discountValue.invalid')}).positive(t('discountValue.positive')),
  expiresAt: z.date().optional(),
  usageLimit: z.coerce.number().int().positive(t('usageLimit.positive')).optional(),
}).refine(data => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: t('discountValue.percentageMax'),
    path: ["discountValue"],
});

export type CreateMarketplaceCouponValues = z.infer<ReturnType<typeof getCreateMarketplaceCouponSchema>>;


export const createInsuranceProductSchema = z.object({
  name: z.string().min(5, "Product name must be at least 5 characters.").max(100),
  type: z.enum(['Crop', 'Livestock', 'Asset', 'Weather'], { required_error: "Please select a product type." }),
  description: z.string().min(20, "Please provide a detailed description.").max(1000),
  coverageDetails: z.string().min(20, "Please provide coverage details.").max(2000),
  premium: z.coerce.number().positive("Premium must be a positive number."),
  currency: z.string().length(3, "Currency must be a 3-letter code.").default("USD"),
});
export type CreateInsuranceProductValues = z.infer<typeof createInsuranceProductSchema>;

export const createInsuranceApplicationSchema = z.object({
  productId: z.string(),
  farmId: z.string({ required_error: "Please select the farm to insure." }),
  coverageValue: z.coerce.number().positive("Coverage value must be a positive number."),
});
export type CreateInsuranceApplicationValues = z.infer<typeof createInsuranceApplicationSchema>;

export const financialApplicationSchema = z.object({
  fiId: z.string({ required_error: "Please select a financial institution." }),
  type: z.enum(['Loan', 'Grant']),
  amount: z.coerce.number().positive("Please enter a valid loan amount."),
  currency: z.string().length(3, "Currency must be a 3-letter code.").default("USD"),
  purpose: z.string().min(20, "Please describe the purpose of the funding.").max(2000),
});
export type FinancialApplicationValues = z.infer<typeof financialApplicationSchema>;

export const createFinancialProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters.").max(100),
  type: z.enum(['Loan', 'Grant']),
  description: z.string().min(20, "Please provide a detailed description.").max(1000),
  interestRate: z.coerce.number().min(0).max(100).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  targetRoles: z.array(z.string()).optional(),
});
export type CreateFinancialProductValues = z.infer<typeof createFinancialProductSchema>;

export const createInventoryItemSchema = z.object({
  name: z.string().min(3, "Item name must be at least 3 characters.").max(100),
  category: z.enum(['Seeds', 'Fertilizers', 'Pesticides', 'Animal Feed', 'Tools', 'Other'], { required_error: "Please select a category." }),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  unit: z.string().min(1, "Unit is required.").max(20),
  purchaseDate: z.date().optional(),
  expiryDate: z.date().optional(),
  supplier: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateInventoryItemValues = z.infer<typeof createInventoryItemSchema>;
