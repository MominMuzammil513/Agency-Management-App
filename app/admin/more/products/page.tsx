import { db } from "@/db/db";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { products, categories } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProductsClient from "./components/ProductsClient";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    session.user.role !== "owner_admin" ||
    !session.user.agencyId
  ) {
    redirect("/unauthorized");
  }

  // ✅ fetch categories
  const categoryList = await db
    .select()
    .from(categories)
    .where(eq(categories.agencyId, session.user.agencyId));

  // ✅ fetch products
  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
      agencyId: products.agencyId,
      purchasePrice: products.purchasePrice,
      sellingPrice: products.sellingPrice,
      categoryName: categories.name,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.agencyId, session.user.agencyId));

  return (
    <ProductsClient productList={productList} categoryList={categoryList} />
  );
}
