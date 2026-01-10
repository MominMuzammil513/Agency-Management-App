"use client";

import { useState } from "react";
import AddProduct from "./AddProduct";
import ProductCard from "./ProductCard";
import { Package, Search } from "lucide-react";
import BackButton from "@/components/ui/BackButton"; // 👈 Import kiya

export default function ProductsClient({
  productList,
  categoryList,
}: {
  productList: any[];
  categoryList: { id: string; name: string }[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = productList.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* 🌿 Header & Actions */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm">
        {/* Top Row with Back Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <BackButton /> {/* 👈 Yahan lagaya Back Button */}
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                My Products 🍟
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                Manage Inventory
              </p>
            </div>
          </div>
          <AddProduct categories={categoryList} />
        </div>

        {/* 🔍 Search Bar */}
        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
            size={18}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 🏷️ Filter Tabs */}
        <div className="overflow-x-auto no-scrollbar pb-1">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === "all"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50"
              }`}
            >
              All Items
            </button>
            {categoryList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📦 Product Grid */}
      <div className="p-5">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <Package size={40} className="text-emerald-300" />
            </div>
            <p className="text-slate-500 font-bold">
              No products found here 🍃
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categoryList}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
