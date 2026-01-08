import { z } from "zod";

// ── Zod schema for Owner Admin creation
export const createOwnerAdminSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  agencyName: z.string().min(2, "Agency name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
  altMobile: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      "Alt mobile must be exactly 10 digits"
    ),
});

// ── TypeScript type for useForm / API
export type CreateOwnerAdminInput = z.infer<typeof createOwnerAdminSchema>;
