import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq, sql } from "drizzle-orm";
import { shops, products, stock, categories } from "@/db/schemas";
import OrderPageClient from "./components/OrderPageClient";

export default async function OrderPage(props: {
  searchParams: Promise<{ shopId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "salesman") {
    return redirect("/login");
  }

  const { shopId } = await props.searchParams;

  if (!shopId) {
    return redirect("/sales");
  }

  // 1. Fetch Shop Details
  const shopData = await db
    .select({ id: shops.id, name: shops.name })
    .from(shops)
    .where(eq(shops.id, shopId))
    .limit(1);

  if (shopData.length === 0) return redirect("/sales");

  // 2. Fetch Categories (Tabs ke liye)
  const categoriesData = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.agencyId, session.user.agencyId!));

  // 3. Fetch Products with LIVE STOCK 🟢
  // Left Join Stock table to get quantity
  const productsData = await db
    .select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
      price: products.sellingPrice,
      imageUrl: products.imageUrl,
      stock: sql<number>`COALESCE(${stock.quantity}, 0)`.as("stock"), // ✅ Stock Qty
    })
    .from(products)
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(products.agencyId, session.user.agencyId!));

  return (
    <OrderPageClient
      shop={shopData[0]}
      categories={categoriesData}
      initialProducts={productsData}
    />
  );
}
