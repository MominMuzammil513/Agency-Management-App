// src/app/api/sales/route.ts
import { NextRequest } from "next/server";
import { db } from "@/db/db";
import {
  orders,
  orderItems,
  shops,
  areas,
  products,
  categories,
} from "@/db/schemas";
import { eq, and, gte, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { sum, count } from "drizzle-orm/sql";
import { SalesFilterSchema, SalesResponseSchema } from "@/lib/zod.schema/sales";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filters = SalesFilterSchema.parse(body);

    // Base constraints
    const dateRange = and(
      gte(orders.createdAt, filters.from),
      lte(orders.createdAt, filters.to)
    );

    const agencyConstraint = eq(orders.agencyId, filters.agencyId);

    // Optional constraints
    const areaConstraint = filters.areaId
      ? eq(shops.areaId, filters.areaId)
      : undefined;
    const shopConstraint = filters.shopId
      ? eq(orders.shopId, filters.shopId)
      : undefined;
    const categoryConstraint = filters.categoryId
      ? eq(products.categoryId, filters.categoryId)
      : undefined;

    // Aggregate metrics
    const itemsJoin = db
      .select({
        totalRevenue: sum(orderItems.price),
        totalItems: sum(orderItems.quantity),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(shops, eq(orders.shopId, shops.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          dateRange,
          agencyConstraint,
          areaConstraint ?? sql`1=1`,
          shopConstraint ?? sql`1=1`,
          categoryConstraint ?? sql`1=1`
        )
      );

    const ordersAgg = db
      .select({
        totalOrders: count(orders.id),
      })
      .from(orders)
      .innerJoin(shops, eq(orders.shopId, shops.id))
      .where(
        and(
          dateRange,
          agencyConstraint,
          areaConstraint ?? sql`1=1`,
          shopConstraint ?? sql`1=1`
        )
      );

    const [{ totalRevenue = 0, totalItems = 0 }] = await itemsJoin;
    const [{ totalOrders = 0 }] = await ordersAgg;
    const avgOrderValue =
      totalOrders > 0 ? Number(totalRevenue) / Number(totalOrders) : 0;

    // Area revenue
    const areaRevenue = await db
      .select({
        areaId: areas.id,
        areaName: areas.name,
        revenue: sum(orderItems.price),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(shops, eq(orders.shopId, shops.id))
      .innerJoin(areas, eq(shops.areaId, areas.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          dateRange,
          agencyConstraint,
          areaConstraint ?? sql`1=1`,
          shopConstraint ?? sql`1=1`,
          categoryConstraint ?? sql`1=1`
        )
      )
      .groupBy(areas.id, areas.name);

    // Category revenue
    const categoryRevenue = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        revenue: sum(orderItems.price),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(shops, eq(orders.shopId, shops.id))
      .where(
        and(
          dateRange,
          agencyConstraint,
          areaConstraint ?? sql`1=1`,
          shopConstraint ?? sql`1=1`
        )
      )
      .groupBy(categories.id, categories.name);

    // Recent orders list
    const recentOrders = await db
      .select({
        orderId: orders.id,
        shopName: shops.name,
        status: orders.status,
        itemsCount: sum(orderItems.quantity),
        total: sum(orderItems.price),
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(shops, eq(orders.shopId, shops.id))
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(
        and(
          dateRange,
          agencyConstraint,
          areaConstraint ?? sql`1=1`,
          shopConstraint ?? sql`1=1`
        )
      )
      .groupBy(orders.id, shops.name, orders.status, orders.createdAt)
      .orderBy(orders.createdAt);

    const response = {
      metrics: {
        totalRevenue: Number(totalRevenue),
        totalOrders: Number(totalOrders),
        totalItems: Number(totalItems),
        avgOrderValue: Number(avgOrderValue),
      },
      areas: areaRevenue.map((a) => ({
        ...a,
        revenue: Number(a.revenue ?? 0),
      })),
      categories: categoryRevenue.map((c) => ({
        ...c,
        revenue: Number(c.revenue ?? 0),
      })),
      orders: recentOrders.map((o) => ({
        ...o,
        itemsCount: Number(o.itemsCount ?? 0),
        total: Number(o.total ?? 0),
      })),
    };

    const parsed = SalesResponseSchema.parse(response);
    return Response.json(parsed, { status: 200 });
  } catch (err: any) {
    return Response.json(
      { error: err.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}
