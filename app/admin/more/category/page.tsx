import { db } from "@/db/db";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { categories } from "@/db/schemas";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import AddCategory from "./components/AddCategory";
import EditCategory from "./components/EditCategory";
import DeleteCategoryButton from "./components/DeleteCategoryButton";
import BackButton from "@/components/ui/BackButton"; // 👈 Import kiya
import { Layers, Calendar } from "lucide-react";

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
    .where(eq(categories.agencyId, session.user.agencyId))
    .orderBy(desc(categories.createdAt));

  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
      {/* 🌿 Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-8">
        <div className="flex justify-between items-center">
          {/* Title Row with Back Button */}
          <div className="flex items-center gap-4">
            <BackButton /> {/* 👈 Yahan lagaya Back Button */}
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Categories 🏷️
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                Organize Inventory
              </p>
            </div>
          </div>

          <AddCategory />
        </div>
      </div>

      <div className="px-6">
        {categoryList.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <div className="bg-white p-5 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <Layers size={40} className="text-emerald-300" />
            </div>
            <p className="text-slate-500 font-bold text-lg">
              No categories yet 🌱
            </p>
            <p className="text-slate-400 text-sm">Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryList.map((category) => (
              <div
                key={category.id}
                className="group bg-white rounded-4xl p-6 shadow-sm border border-emerald-50/50 hover:shadow-xl hover:shadow-emerald-100/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-xl shadow-inner">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-slate-50 shadow-sm">
                      <EditCategory
                        category={{ id: category.id, name: category.name }}
                      />
                      <div className="w-px h-4 bg-slate-200"></div>
                      <DeleteCategoryButton id={category.id} />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
                    {category.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Calendar size={12} />
                    {new Date(category.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
