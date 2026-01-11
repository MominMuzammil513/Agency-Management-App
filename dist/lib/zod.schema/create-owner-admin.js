"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOwnerAdminSchema = void 0;
const zod_1 = require("zod");
// ── Zod schema for Owner Admin creation
exports.createOwnerAdminSchema = zod_1.z.object({
    ownerName: zod_1.z.string().min(2, "Owner name must be at least 2 characters"),
    agencyName: zod_1.z.string().min(2, "Agency name must be at least 2 characters"),
    email: zod_1.z.string().email("Valid email required"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    mobile: zod_1.z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
    altMobile: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), "Alt mobile must be exactly 10 digits"),
});
