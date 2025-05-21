
import { z } from "zod";
import { MARKETPLACE_CATEGORY_VALUES } from "@/lib/constants";

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
  contactInfo: z.string().min(5, "Contact information must be at least 5 characters long.").max(200, "Contact information cannot exceed 200 characters."),
});

export type CreateMarketplaceItemValues = z.infer<typeof createMarketplaceItemSchema>;
