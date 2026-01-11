"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaffSchema = void 0;
const zod_1 = require("zod");
exports.createStaffSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Valid email required"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    mobile: zod_1.z
        .string()
        .length(10, "Mobile must be 10 digits")
        .regex(/^\d+$/, "Only numbers allowed"),
    altMobile: zod_1.z
        .string()
        .optional()
        .refine((v) => !v || (v.length === 10 && /^\d+$/.test(v)), "Alt mobile must be 10 digits"),
    role: zod_1.z.enum(["salesman", "delivery_boy"]),
});
