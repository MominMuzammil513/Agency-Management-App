// app/owner-admin/stock/page.tsx
import { db } from "@/db/db";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { stock, products, categories } from "@/db/schemas";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import StockDashboard from "./components/StockDashboard";

export default async function StockPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    session.user.role !== "owner_admin" ||
    !session.user.agencyId
  ) {
    redirect("/unauthorized");
  }

  // 1. Fetch Categories
  const categoriesData = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      totalStock: sql<number>`COALESCE(SUM(${stock.quantity}), 0)`.as(
        "totalStock"
      ),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(categories.agencyId, session.user.agencyId))
    .groupBy(categories.id, categories.name);

  // 2. Fetch Products (🔥 Added imageUrl here)
  const productsData = await db
    .select({
      productId: products.id,
      productName: products.name,
      categoryId: products.categoryId,
      categoryName: sql<string>`${categories.name}`.as("category_name"),
      quantity: sql<number>`COALESCE(${stock.quantity}, 0)`.as("quantity"),
      imageUrl: products.imageUrl, // ✅ Fetching Image URL
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(products.agencyId, session.user.agencyId));

  return <StockDashboard categories={categoriesData} products={productsData} />;
}
