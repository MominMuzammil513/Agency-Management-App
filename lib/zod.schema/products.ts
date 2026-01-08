// lib/zod.schema/products.ts
import * as z from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  purchasePrice: z.number().min(0, "Purchase price must be ≥ 0"),
  sellingPrice: z.number().min(0, "Selling price must be ≥ 0"),
  imageUrl: z.url("Must be a valid URL").optional(), // ✅ optional so user can leave blank
});

export type ProductFormData = z.infer<typeof productSchema>;
