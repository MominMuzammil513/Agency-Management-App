import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z.string().email("Valid email required"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  mobile: z
    .string()
    .length(10, "Mobile must be 10 digits")
    .regex(/^\d+$/, "Only numbers allowed"),

  altMobile: z
    .string()
    .optional()
    .refine(
      (v) => !v || (v.length === 10 && /^\d+$/.test(v)),
      "Alt mobile must be 10 digits"
    ),

  role: z.enum(["salesman", "delivery_boy"]),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
