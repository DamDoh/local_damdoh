
import { z } from "zod";
import { MARKETPLACE_CATEGORY_VALUES, TALENT_CATEGORY_VALUES, TALENT_LISTING_TYPE_VALUES, AGRI_EVENT_TYPES } from "@/lib/constants";

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
  description: z.string().min(10, "Description must be at least 10 characters long.").max(1000, "Description cannot exceed 1000 characters."),
  price: z.coerce.number({ invalid_type_error: "Price must be a number." }).positive("Price must be a positive number."),
  currency: z.string().length(3, "Currency code must be 3 characters (e.g., USD).").default("USD").transform(value => value.toUpperCase()),
  perUnit: z.string().max(20, "Unit description (e.g., /kg, /ton) is too long.").optional(),
  category: z.enum(MARKETPLACE_CATEGORY_VALUES, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  location: z.string().min(2, "Location must be at least 2 characters long.").max(100, "Location cannot exceed 100 characters."),
  imageUrl: z.string().url({ message: "Please enter a valid URL for the image (e.g., https://placehold.co/300x200.png)." }).optional().or(z.literal('')),
  imageFile: imageFileSchema,
  contactInfo: z.string().min(5, "Contact information must be at least 5 characters long.").max(200, "Contact information cannot exceed 200 characters."),
});

export type CreateMarketplaceItemValues = z.infer<typeof createMarketplaceItemSchema>;


export const createTalentListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100, "Title cannot exceed 100 characters."),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(1000, "Description cannot exceed 1000 characters."),
  type: z.enum(TALENT_LISTING_TYPE_VALUES, {
    errorMap: () => ({ message: "Please select a valid listing type (Job or Service)." }),
  }),
  category: z.enum(TALENT_CATEGORY_VALUES, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  location: z.string().min(2, "Location must be at least 2 characters long.").max(100, "Location cannot exceed 100 characters."),
  skillsRequired: z.string().max(250, "Skills list is too long (max 250 chars).").optional().describe("Enter skills, comma-separated"),
  compensation: z.string().max(100, "Compensation details are too long (max 100 chars).").optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL for the image." }).optional().or(z.literal('')),
  imageFile: imageFileSchema,
  contactInfo: z.string().min(5, "Contact information must be at least 5 characters long.").max(200, "Contact information cannot exceed 200 characters."),
});

export type CreateTalentListingValues = z.infer<typeof createTalentListingSchema>;

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
});

export type CreateAgriEventValues = z.infer<typeof createAgriEventSchema>;
