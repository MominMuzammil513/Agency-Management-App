// lib/zod.schema/stock.schema.ts
import { z } from "zod";

// --- ADD STOCK SCHEMAS ---

export const addStockFormSchema = z.object({
  quantity: z.coerce
    .number({ message: "Quantity must be a number" }) // use invalid_type_error
    .min(1, "Quantity must be at least 1"),
  reason: z.string().optional(),
});

// Backend API Schema
export const addStockApiSchema = addStockFormSchema.extend({
  categoryId: z.string().min(1, "Category ID is required"),
  productId: z.string().min(1, "Product ID is required"),
});

export type AddStockFormData = z.infer<typeof addStockFormSchema>;

// --- UPDATE STOCK SCHEMAS ---

export const updateStockFormSchema = z.object({
  quantity: z.coerce
    .number({ message: "Quantity must be a number" })
    .min(1, "Quantity must be at least 1"),

  // Kept your fix: using 'message' property for enum error
  type: z.enum(["increase", "decrease"], {
    message: "Please select an action type",
  }),

  reason: z.string().optional(),
});

// Backend API Schema
export const updateStockApiSchema = updateStockFormSchema.extend({
  productId: z.string().min(1, "Product ID is required"),
});

export type UpdateStockFormData = z.infer<typeof updateStockFormSchema>;
