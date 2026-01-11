"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderSchema = exports.OrderItemInputSchema = void 0;
// src/lib/zod/orders.ts
const zod_1 = require("zod");
exports.OrderItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().nonnegative(), // snapshot price
});
exports.CreateOrderSchema = zod_1.z.object({
    shopId: zod_1.z.string().min(1),
    agencyId: zod_1.z.string().min(1),
    createdBy: zod_1.z.string().min(1), // user id
    items: zod_1.z.array(exports.OrderItemInputSchema).min(1),
});
