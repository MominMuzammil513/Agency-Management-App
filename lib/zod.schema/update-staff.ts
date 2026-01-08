import { z } from "zod";

export const updateStaffSchema = z.object({
  staffId: z.string().min(8, "Invalid staff id"),

  name: z.string().min(2).optional(),

  mobile: z.string().length(10).regex(/^\d+$/).optional(),

  altMobile: z
    .string()
    .optional()
    .refine(
      (v) => !v || (v.length === 10 && /^\d+$/.test(v)),
      "Alt mobile must be 10 digits"
    ),

  isActive: z.boolean().optional(),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
