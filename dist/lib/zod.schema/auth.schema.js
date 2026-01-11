"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
// src/lib/schemas/auth.schema.ts
const zod_1 = require("zod");
// Login schema
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email({ message: "Valid email address daaliye" })
        .min(1, { message: "Email zaroori hai" }),
    password: zod_1.z
        .string()
        .min(6, { message: "Password kam se kam 6 characters ka hona chahiye" })
        .max(50, { message: "Password bahut lamba hai" }),
});
