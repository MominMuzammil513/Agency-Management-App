"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffSchema = exports.signupSchema = void 0;
// lib/zod.schema/signup.schema.ts (Final Fixed Version – Resolver Error Gone)
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    username: zod_1.z
        .string()
        .min(3, "Username must be at least 3 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and _ allowed"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[0-9]/, "Must contain one number")
        .regex(/[^a-zA-Z0-9]/, "Must contain one special character"),
    name: zod_1.z.string().min(2, "Name is required"),
    mobile: zod_1.z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
    altMobile: zod_1.z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid alternate mobile")
        .optional()
        .or(zod_1.z.literal("")),
    role: zod_1.z.enum(["super_admin", "owner_admin", "salesman", "delivery_boy"]),
});
exports.staffSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name at least 2 characters"),
    email: zod_1.z.string().email("Valid email required"),
    password: zod_1.z.string().min(8, "Password at least 8 characters"),
    mobile: zod_1.z
        .string()
        .length(10, "Mobile must be 10 digits")
        .regex(/^\d+$/, "Only numbers"),
    altMobile: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || (val.length === 10 && /^\d+$/.test(val))),
    role: zod_1.z.enum(["salesman", "delivery"]),
});
