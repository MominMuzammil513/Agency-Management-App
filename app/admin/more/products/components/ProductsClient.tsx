"use client";

import { useState } from "react";
import AddProduct from "./AddProduct";
import ProductCard from "./ProductCard";

export default function ProductsClient({
  productList,
  categoryList,
}: {
  productList: any[];
  categoryList: { id: string; name: string }[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts =
    selectedCategory === "all"
      ? productList
      : productList.filter((p) => p.categoryId === selectedCategory);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Manage Products</h1>
        <AddProduct categories={categoryList} />
      </div>

      {/* ✅ Filter bar with horizontal scroll */}
      <div className="overflow-x-auto no-scrollbar mt-4">
        <div className="flex gap-3 min-w-max">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-orange-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            All
          </button>
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-orange-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-slate-500 text-lg">
            No products found for this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}
