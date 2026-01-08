// src/lib/zod/sales.ts
import { z } from "zod";

export const SalesFilterSchema = z.object({
  from: z.string().min(10), // ISO date string
  to: z.string().min(10),
  agencyId: z.string().min(1),
  areaId: z.string().optional(),
  shopId: z.string().optional(),
  categoryId: z.string().optional(),
});

export type SalesFilter = z.infer<typeof SalesFilterSchema>;

export const SalesMetricSchema = z.object({
  totalRevenue: z.number(),
  totalOrders: z.number(),
  totalItems: z.number(),
  avgOrderValue: z.number(),
});

export const AreaSalesPointSchema = z.object({
  areaId: z.string(),
  areaName: z.string(),
  revenue: z.number(),
});

export const CategorySalesPointSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  revenue: z.number(),
});

export const SalesResponseSchema = z.object({
  metrics: SalesMetricSchema,
  areas: z.array(AreaSalesPointSchema),
  categories: z.array(CategorySalesPointSchema),
  orders: z.array(
    z.object({
      orderId: z.string(),
      shopName: z.string(),
      status: z.string(),
      itemsCount: z.number(),
      total: z.number(),
      createdAt: z.string(),
    })
  ),
});

export type SalesResponse = z.infer<typeof SalesResponseSchema>;
