"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesResponseSchema = exports.CategorySalesPointSchema = exports.AreaSalesPointSchema = exports.SalesMetricSchema = exports.SalesFilterSchema = void 0;
// src/lib/zod/sales.ts
const zod_1 = require("zod");
exports.SalesFilterSchema = zod_1.z.object({
    from: zod_1.z.string().min(10), // ISO date string
    to: zod_1.z.string().min(10),
    agencyId: zod_1.z.string().min(1),
    areaId: zod_1.z.string().optional(),
    shopId: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().optional(),
});
exports.SalesMetricSchema = zod_1.z.object({
    totalRevenue: zod_1.z.number(),
    totalOrders: zod_1.z.number(),
    totalItems: zod_1.z.number(),
    avgOrderValue: zod_1.z.number(),
});
exports.AreaSalesPointSchema = zod_1.z.object({
    areaId: zod_1.z.string(),
    areaName: zod_1.z.string(),
    revenue: zod_1.z.number(),
});
exports.CategorySalesPointSchema = zod_1.z.object({
    categoryId: zod_1.z.string(),
    categoryName: zod_1.z.string(),
    revenue: zod_1.z.number(),
});
exports.SalesResponseSchema = zod_1.z.object({
    metrics: exports.SalesMetricSchema,
    areas: zod_1.z.array(exports.AreaSalesPointSchema),
    categories: zod_1.z.array(exports.CategorySalesPointSchema),
    orders: zod_1.z.array(zod_1.z.object({
        orderId: zod_1.z.string(),
        shopName: zod_1.z.string(),
        status: zod_1.z.string(),
        itemsCount: zod_1.z.number(),
        total: zod_1.z.number(),
        createdAt: zod_1.z.string(),
    })),
});
