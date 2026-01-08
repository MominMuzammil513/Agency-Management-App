// app/owner-admin/categories/page.tsx
import { db } from "@/db/db";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { categories } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AddCategory from "./components/AddCategory";
import EditCategory from "./components/EditCategory";
import DeleteCategoryButton from "./components/DeleteCategoryButton";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    session.user.role !== "owner_admin" ||
    !session.user.agencyId
  ) {
    redirect("/unauthorized");
  }

  const categoryList = await db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .where(eq(categories.agencyId, session.user.agencyId));

  return (
    <div className="p-6 space-y-8 min-h-screen border border-red-500 bg-slate-50">
      <div className="flex justify-between items-center ">
        <h1 className="text-3xl font-bold text-slate-800">Manage Categories</h1>
        <AddCategory />
      </div>

      {categoryList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-slate-500 text-lg">
            No categories found. Add your first category to get started!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-y-3 justify-center items-center w-full">
          {categoryList.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-slate-100 w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">
                  {category.name}
                </h3>
                <div className="flex items-center gap-3">
                  <EditCategory
                    category={{ id: category.id, name: category.name }}
                  />
                  <DeleteCategoryButton id={category.id} />
                </div>
              </div>

              <p className="text-slate-500 text-sm">
                Created:{" "}
                {new Date(category.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
