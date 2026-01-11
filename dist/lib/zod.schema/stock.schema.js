"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStockApiSchema = exports.updateStockFormSchema = exports.addStockApiSchema = exports.addStockFormSchema = void 0;
// lib/zod.schema/stock.schema.ts
const zod_1 = require("zod");
// --- ADD STOCK SCHEMAS ---
exports.addStockFormSchema = zod_1.z.object({
    quantity: zod_1.z.coerce
        .number({ message: "Quantity must be a number" }) // use invalid_type_error
        .min(1, "Quantity must be at least 1"),
    reason: zod_1.z.string().optional(),
});
// Backend API Schema
exports.addStockApiSchema = exports.addStockFormSchema.extend({
    categoryId: zod_1.z.string().min(1, "Category ID is required"),
    productId: zod_1.z.string().min(1, "Product ID is required"),
});
// --- UPDATE STOCK SCHEMAS ---
exports.updateStockFormSchema = zod_1.z.object({
    quantity: zod_1.z.coerce
        .number({ message: "Quantity must be a number" })
        .min(1, "Quantity must be at least 1"),
    // Kept your fix: using 'message' property for enum error
    type: zod_1.z.enum(["increase", "decrease"], {
        message: "Please select an action type",
    }),
    reason: zod_1.z.string().optional(),
});
// Backend API Schema
exports.updateStockApiSchema = exports.updateStockFormSchema.extend({
    productId: zod_1.z.string().min(1, "Product ID is required"),
});
