"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MoreVertical } from "lucide-react";

import EditProduct from "./EditProduct";
import DeleteProductButton from "./DeleteProductButton";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    purchasePrice: number;
    sellingPrice: number;
    categoryName: string | null;
    categoryId: string;
    agencyId: string;
    imageUrl: string;
  };
  categories: { id: string; name: string }[];
}

export default function ProductCard({ product, categories }: ProductCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`
        group bg-white rounded-2xl border border-slate-200 
        shadow-sm hover:shadow-xl transition-all duration-300
        overflow-hidden flex flex-col
        aspect-[3/5] w-full mx-auto   /* ← Changed to taller + cute look */
        sm:aspect-[3/4.6] lg:aspect-[3/4.4]
      `}
    >
      {/* IMAGE SECTION */}
      <div className="relative w-full flex-3 min-h-64">
        {" "}
        {/* flex-[3] for more image space */}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="
              object-fill transition-transform duration-500 
              group-hover:scale-105
            "
            // Optional: agar top se zyada important hai to yeh try kar
            // className="object-cover object-top ..."
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <span className="text-slate-400 text-sm">No image</span>
          </div>
        )}
        {/* 3-dots menu */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
            aria-label="Product actions"
          >
            <MoreVertical size={20} className="text-slate-700" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className={`
                absolute top-full right-0 mt-2 w-44 bg-white rounded-xl 
                shadow-2xl border border-slate-200 py-1.5 z-30
                origin-top-right animate-in fade-in slide-in-from-top-2
              `}
            >
              <div className="px-2 py-1.5 hover:bg-slate-50 cursor-pointer text-sm">
                <EditProduct product={product} categories={categories} />
              </div>
              <div className="px-2 py-1.5 hover:bg-red-50 text-red-600 cursor-pointer text-sm">
                <DeleteProductButton id={product.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3.5 flex flex-col gap-0">
        <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-sm text-slate-500">
          {product.categoryName || "Uncategorized"}
        </p>

        <div className="flex justify-between items-end mt-1.5">
          <div>
            <p className="text-xs text-slate-400">Purchase</p>
            <p className="font-medium text-slate-700">
              ₹{product.purchasePrice}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Selling</p>
            <p className="font-bold text-lg text-emerald-600">
              ₹{product.sellingPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
