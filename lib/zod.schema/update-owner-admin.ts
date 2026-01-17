import { z } from "zod";

// ── Zod schema for Owner Admin update
export const updateOwnerAdminSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters").optional(),
  agencyName: z.string().min(2, "Agency name must be at least 2 characters").optional(),
  email: z.string().email("Valid email required").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits").optional(),
  altMobile: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      "Alt mobile must be exactly 10 digits"
    ),
  isActive: z.boolean().optional(),
});

// ── TypeScript type for useForm / API
export type UpdateOwnerAdminInput = z.infer<typeof updateOwnerAdminSchema>;
