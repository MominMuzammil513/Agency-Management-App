"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffSchema = void 0;
const zod_1 = require("zod");
exports.updateStaffSchema = zod_1.z.object({
    staffId: zod_1.z.string().min(1, "Invalid staff id"),
    name: zod_1.z.string().min(2, "Name too short").optional(),
    email: zod_1.z.string().email("Invalid email").optional(), // ✅ Added
    mobile: zod_1.z.string().length(10, "Mobile must be 10 digits").regex(/^\d+$/, "Numbers only").optional(),
    altMobile: zod_1.z
        .string()
        .optional()
        .nullable() // Allow null
        .refine((v) => !v || (v.length === 10 && /^\d+$/.test(v)), "Alt mobile must be 10 digits"),
    role: zod_1.z.enum(["salesman", "delivery_boy"]).optional(), // ✅ Added
    password: zod_1.z.string().min(6, "Password must be at least 6 chars").optional(), // ✅ Added
    isActive: zod_1.z.boolean().optional(),
});
