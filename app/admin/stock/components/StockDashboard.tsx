"use client";

import { useState, useMemo } from "react";
import { Search, Package, Layers, Leaf } from "lucide-react";
import AddStock from "./AddStock";
import UpdateStock from "./UpdateStock";
import DeleteStock from "./DeleteStock";

interface Product {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  imageUrl: string | null;
}

interface Category {
  categoryId: string;
  categoryName: string;
  totalStock: number;
}

interface StockDashboardProps {
  categories: Category[];
  products: Product[];
}

export default function StockDashboard({
  categories,
  products,
}: StockDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredData = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    return categories
      .map((cat) => {
        const catProducts = products.filter((p) => {
          const isInCategory = p.categoryId === cat.categoryId;
          const matchesSearch =
            p.productName.toLowerCase().includes(lowerQuery) ||
            cat.categoryName.toLowerCase().includes(lowerQuery);

          return isInCategory && matchesSearch;
        });

        return {
          ...cat,
          products: catProducts,
        };
      })
      .filter((cat) => {
        const matchesCategoryTab =
          selectedCategory === "All" || cat.categoryName === selectedCategory;
        const hasProducts = cat.products.length > 0;
        return matchesCategoryTab && hasProducts;
      });
  }, [searchQuery, selectedCategory, categories, products]);

  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
      {/* 🌿 Compact Header Section (Sticky + Blur) */}
      <div className="bg-white/85 backdrop-blur-md rounded-b-[2rem] shadow-sm px-5 pt-4 pb-4 sticky top-0 z-30 border-b border-emerald-100/50">
        {/* Top Row: Title & Icon (Compact Gap) */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-emerald-600 font-bold text-[10px] tracking-widest uppercase mb-0.5">
              Inventory
            </p>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              My Stock{" "}
              <Leaf className="text-emerald-500 fill-emerald-100" size={20} />
            </h1>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl shadow-sm border border-emerald-100">
            <Layers className="text-emerald-600" size={20} />
          </div>
        </div>

        {/* 🔍 Slimmer Search Bar */}
        <div className="relative mb-3 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search
              className="text-emerald-400 group-focus-within:text-emerald-600 transition-colors"
              size={18}
            />
          </div>
          <input
            type="text"
            placeholder="Search item or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm text-slate-700 placeholder:text-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white transition-all shadow-sm"
          />
        </div>

        {/* 🏷️ Filter Chips (Compact Padding) */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
              selectedCategory === "All"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-200"
                : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => setSelectedCategory(cat.categoryName)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
                selectedCategory === cat.categoryName
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50"
              }`}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>
      </div>

      {/* 📦 Content List */}
      <div className="p-4 space-y-6 mt-1">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <Package size={48} className="mx-auto text-emerald-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">
              No items found. 🌱
            </p>
          </div>
        ) : (
          filteredData.map((cat) => (
            <div
              key={cat.categoryId}
              className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Category Title (Slimmer) */}
              <div className="flex items-center gap-2 px-1">
                <div className="h-6 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-400"></div>
                <h2 className="text-lg font-bold text-slate-700 flex-1">
                  {cat.categoryName}
                </h2>
                <span className="bg-white text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-emerald-100">
                  {cat.products.length}
                </span>
              </div>

              {/* Products Grid */}
              <div className="grid gap-3">
                {cat.products.map((product) => (
                  <div
                    key={product.productId}
                    className="group bg-white rounded-2xl p-3.5 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-white hover:border-emerald-200 transition-all duration-300"
                  >
                    {/* Top Row: Image, Name & Qty */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* 🖼️ Product Image (Slightly Smaller for Compactness) */}
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-emerald-200">
                            <Package size={24} />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-bold text-slate-800 text-base leading-tight truncate">
                          {product.productName}
                        </h3>
                        <p className="text-emerald-500/80 text-[10px] font-semibold mt-0.5 uppercase tracking-wide">
                          {cat.categoryName}
                        </p>
                      </div>

                      {/* Quantity Display */}
                      <div className="text-right">
                        <span
                          className={`block text-xl font-black tracking-tight ${
                            product.quantity > 0
                              ? "text-slate-800"
                              : "text-red-500"
                          }`}
                        >
                          {product.quantity}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                          Units
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full border-t border-dashed border-slate-100 mb-3"></div>

                    {/* Actions Row */}
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <AddStock
                          productId={product.productId}
                          categoryId={product.categoryId}
                        />
                      </div>

                      <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
                        <UpdateStock
                          productId={product.productId}
                          currentQuantity={product.quantity}
                        />
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <DeleteStock productId={product.productId} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
