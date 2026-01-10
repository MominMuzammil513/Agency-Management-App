import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import {
  orders,
  orderItems,
  products,
  stock,
  users,
  shops,
  areas,
} from "@/db/schemas";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import StatsClient from "./components/StatsClient";

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; range?: string }>; // Updated for Next.js 15
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "owner_admin") redirect("/login");

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;

  // 1. Date Filter Logic
  const today = new Date();
  let startDate = new Date(today.setHours(0, 0, 0, 0));
  let endDate = new Date(today.setHours(23, 59, 59, 999));

  const range = params.range || "today";

  if (range === "yesterday") {
    startDate.setDate(startDate.getDate() - 1);
    endDate.setDate(endDate.getDate() - 1);
  } else if (range === "weekly") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (range === "monthly") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (params.from && params.to) {
    startDate = new Date(params.from);
    endDate = new Date(params.to);
    endDate.setHours(23, 59, 59);
  }

  // 2. Fetch Agency (FIXED: unwrapped array)
  const [ownerData] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!ownerData || !ownerData.agencyId) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error: Agency ID missing
      </div>
    );
  }

  const agencyId = ownerData.agencyId; // Safe Variable

  // 3. 💰 FINANCIAL STATS
  const salesData = await db
    .select({
      sellingPrice: orderItems.price,
      quantity: orderItems.quantity,
      purchasePrice: products.purchasePrice,
      orderDate: orders.createdAt,
      shopId: orders.shopId,
      areaId: shops.areaId,
      areaName: areas.name,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .where(
      and(
        eq(shops.agencyId, agencyId), // 🔥 Fixed: Used safe variable
        gte(orders.createdAt, startDate.toISOString()),
        lte(orders.createdAt, endDate.toISOString()),
        // 🔥 Fixed: Type assertion for status enum mismatch
        eq(orders.status, "completed" as any)
      )
    );

  // Calculate Totals
  let totalRevenue = 0;
  let totalCost = 0;
  const areaStats: Record<string, { revenue: number; profit: number }> = {};

  salesData.forEach((item) => {
    const revenue = item.sellingPrice;
    const cost = item.quantity * item.purchasePrice;
    const profit = revenue - cost;

    totalRevenue += revenue;
    totalCost += cost;

    const areaName = item.areaName || "Unknown";
    if (!areaStats[areaName]) areaStats[areaName] = { revenue: 0, profit: 0 };
    areaStats[areaName].revenue += revenue;
    areaStats[areaName].profit += profit;
  });

  const totalProfit = totalRevenue - totalCost;

  // 4. 📦 INVENTORY VALUE
  const inventoryData = await db
    .select({
      qty: stock.quantity,
      cost: products.purchasePrice,
    })
    .from(stock)
    .innerJoin(products, eq(stock.productId, products.id))
    .where(eq(products.agencyId, agencyId)); // 🔥 Fixed: Used safe variable

  const inventoryValue = inventoryData.reduce(
    (sum, item) => sum + item.qty * item.cost,
    0
  );

  return (
    <StatsClient
      data={{
        totalRevenue,
        totalProfit,
        inventoryValue,
        areaStats,
        dateRange: { from: startDate, to: endDate, type: range },
      }}
    />
  );
}
