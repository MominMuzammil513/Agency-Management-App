// lib/zod.schema/signup.schema.ts (Final Fixed Version – Resolver Error Gone)
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and _ allowed"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[0-9]/, "Must contain one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain one special character"),
  name: z.string().min(2, "Name is required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  altMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid alternate mobile")
    .optional()
    .or(z.literal("")),
  role: z.enum(["super_admin", "owner_admin", "salesman", "delivery_boy"]),
});

export type SignupInput = z.infer<typeof signupSchema>;


export const staffSchema = z.object({
  name: z.string().min(2, "Name at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password at least 8 characters"),
  mobile: z
    .string()
    .length(10, "Mobile must be 10 digits")
    .regex(/^\d+$/, "Only numbers"),
  altMobile: z
    .string()
    .optional()
    .refine((val) => !val || (val.length === 10 && /^\d+$/.test(val))),
  role: z.enum(["salesman", "delivery"]),
});

export type StaffInput = z.infer<typeof staffSchema>;