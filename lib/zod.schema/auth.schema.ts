// src/lib/schemas/auth.schema.ts
import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Valid email address daaliye" })
    .min(1, { message: "Email zaroori hai" }),

  password: z
    .string()
    .min(6, { message: "Password kam se kam 6 characters ka hona chahiye" })
    .max(50, { message: "Password bahut lamba hai" }),
});

// Type inference for TypeScript
export type LoginFormValues = z.infer<typeof loginSchema>;
