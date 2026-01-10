import { z } from "zod";

export const updateStaffSchema = z.object({
  staffId: z.string().min(1, "Invalid staff id"),

  name: z.string().min(2, "Name too short").optional(),
  
  email: z.string().email("Invalid email").optional(), // ✅ Added

  mobile: z.string().length(10, "Mobile must be 10 digits").regex(/^\d+$/, "Numbers only").optional(),

  altMobile: z
    .string()
    .optional()
    .nullable() // Allow null
    .refine(
      (v) => !v || (v.length === 10 && /^\d+$/.test(v)),
      "Alt mobile must be 10 digits"
    ),

  role: z.enum(["salesman", "delivery_boy"]).optional(), // ✅ Added

  password: z.string().min(6, "Password must be at least 6 chars").optional(), // ✅ Added

  isActive: z.boolean().optional(),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;