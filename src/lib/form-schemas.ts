
import { z } from "zod";
import { UNIFIED_MARKETPLACE_CATEGORY_IDS, LISTING_TYPES, AGRI_EVENT_TYPES, STAKEHOLDER_ROLES } from "@/lib/constants";

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

export const createMarketplaceItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long.").max(100, "Name cannot exceed 100 characters."),
  listingType: z.enum(LISTING_TYPES, {
    errorMap: () => ({ message: "Please select a listing type (Product or Service)." }),
  }),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(2000, "Description cannot exceed 2000 characters."),
  price: z.coerce.number({ invalid_type_error: "Price must be a number." }).min(0, "Price cannot be negative.").optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code.").default("USD").transform(value => value.toUpperCase()),
  perUnit: z.string().max(30, "Unit description (e.g., /kg, /ton, /hour) is too long.").optional(),
  category: z.enum(UNIFIED_MARKETPLACE_CATEGORY_IDS, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  isSustainable: z.boolean().default(false).optional(),
  location: z.string().min(2, "Location must be at least 2 characters long.").max(100, "Location cannot exceed 100 characters."),
  imageUrl: z.string().url({ message: "Please enter a valid URL for the image (e.g., https://placehold.co/300x200.png)." }).optional().or(z.literal('')),
  imageFile: imageFileSchema,
  contactInfo: z.string().min(5, "Contact information must be at least 5 characters long.").max(200, "Contact information cannot exceed 200 characters.").optional(),
  skillsRequired: z.string().max(250, "Skills list is too long (max 250 chars).").optional().describe("For services: Enter skills, comma-separated"),
  compensation: z.string().max(100, "Compensation details are too long (max 100 chars).").optional().describe("For services: e.g., $50/hr, Project-based"),
   // Fields from extended schema, made optional for the form
  brand: z.string().max(50, "Brand name is too long.").optional(),
  condition: z.enum(['New', 'Used', 'Refurbished']).optional(),
  availabilityStatus: z.enum(['Available', 'Booking Required', 'Limited Availability']).optional(),
  certifications: z.string().max(500, "Certifications list is too long.").optional(),
  relatedTraceabilityId: z.string().max(100, "Traceability ID is too long.").optional(),
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
  imageUrl: z.string().url({ message: "Please enter a valid URL for the event image." }).optional().or(z.literal('')),
  imageFile: imageFileSchema,
  registrationEnabled: z.boolean().default(false).optional(),
  attendeeLimit: z.coerce.number().int().positive("Must be a positive number.").optional(),
  price: z.coerce.number().min(0, "Price cannot be negative.").optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code.").optional(),
});

export type CreateAgriEventValues = z.infer<typeof createAgriEventSchema>;

export const createFarmSchema = z.object({
  name: z.string().min(3, "Farm name must be at least 3 characters.").max(100),
  description: z.string().max(500, "Description is too long.").optional(),
  location: z.string().min(3, "Please provide a location.").max(200),
  size: z.string().min(1, "Please provide the farm size.").max(100),
  farmType: z.enum(['crop', 'livestock', 'mixed', 'aquaculture', 'other'], {
    errorMap: () => ({ message: "Please select a farm type." }),
  }),
  irrigationMethods: z.string().max(200, "Irrigation methods description is too long.").optional(),
});
export type CreateFarmValues = z.infer<typeof createFarmSchema>;

export const createCropSchema = z.object({
  cropType: z.string().min(2, "Crop type must be at least 2 characters.").max(100),
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

export const createHarvestSchema = z.object({
    harvestDate: z.date({ required_error: "A harvest date is required." }),
    yield_kg: z.coerce.number({ required_error: "Yield is required.", invalid_type_error: "Yield must be a number." }).min(0, "Yield cannot be negative."),
    quality_grade: z.string().max(50, "Quality grade is too long.").optional(),
    notes: z.string().max(500, "Notes are too long.").optional(),
});
export type CreateHarvestValues = z.infer<typeof createHarvestSchema>;

export const createInputApplicationSchema = z.object({
  applicationDate: z.date({ required_error: "An application date is required." }),
  inputId: z.string().min(2, "Input name/type is required."),
  quantity: z.coerce.number({ invalid_type_error: "Quantity must be a number." }).min(0, "Quantity must be a positive number."),
  unit: z.string().min(1, "Unit is required (e.g., kg, L, bags)."),
  method: z.string().max(100, "Method description is too long.").optional(),
});
export type CreateInputApplicationValues = z.infer<typeof createInputApplicationSchema>;

export const createObservationSchema = z.object({
  observationType: z.string().min(3, "Observation type is required."),
  observationDate: z.date({
    required_error: "An observation date is required.",
  }),
  details: z.string().min(10, "Details must be at least 10 characters.").max(1000, "Details cannot exceed 1000 characters."),
  imageFile: imageFileSchema.optional(),
});
export type CreateObservationValues = z.infer<typeof createObservationSchema>;

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

export const createMarketplaceCouponSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters.").max(20, "Code cannot exceed 20 characters.").regex(/^[a-zA-Z0-9]+$/, "Code can only contain letters and numbers."),
  discountType: z.enum(['percentage', 'fixed'], { required_error: "Please select a discount type." }),
  discountValue: z.coerce.number().positive("Discount value must be a positive number."),
  expiresAt: z.date().optional(),
  usageLimit: z.coerce.number().int().positive("Usage limit must be a positive integer.").optional(),
}).refine(data => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: "Percentage discount cannot exceed 100.",
    path: ["discountValue"],
});
export type CreateMarketplaceCouponValues = z.infer<typeof createMarketplaceCouponSchema>;

export const createAgriEventCouponSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters").max(20),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Value must be positive"),
  expiryDate: z.date().optional(),
  usageLimit: z.coerce.number().int().positive("Limit must be a positive number").optional(),
}).refine(data => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: "Percentage discount cannot exceed 100.",
    path: ["discountValue"],
});
export type CreateAgriEventCouponValues = z.infer<typeof createAgriEventCouponSchema>;
