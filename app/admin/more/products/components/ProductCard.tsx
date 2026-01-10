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
        group relative bg-white rounded-2xl border border-slate-100 
        shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300
        overflow-hidden flex flex-col
        aspect-3/6 w-full mx-auto
      `}
    >
      {/* IMAGE SECTION */}
      <div className="relative w-full flex-3 bg-slate-50 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="text-xs font-bold uppercase tracking-widest">
              No Image
            </span>
          </div>
        )}

        {/* Soft Gradient Overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/40 to-transparent opacity-60"></div>
      </div>

      {/* CONTENT */}
      <div className="p-2 flex flex-col justify-between flex-1 bg-white relative z-10">
        <div>
          {/* Header Row: Category & Menu */}
          <div className="flex justify-between items-start mb-1.5">
            <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              {product.categoryName || "General"}
            </div>

            {/* 3-dots menu shifted here */}
            <div className="relative z-20">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute top-full right-0 mt-1 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 origin-top-right"
                >
                  <div className="px-1">
                    <div className="hover:bg-emerald-50 rounded-xl transition-colors">
                      <EditProduct product={product} categories={categories} />
                    </div>
                    <div className="hover:bg-red-50 rounded-xl transition-colors mt-1">
                      <DeleteProductButton id={product.id} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <h3 className="font-bold text-base text-slate-800 leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex justify-between items-center mt-1 border-t border-slate-50 pt-2">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              Buy
            </p>
            <p className="font-semibold text-slate-600 text-xs">
              ₹{product.purchasePrice}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              Sell
            </p>
            <p className="font-black text-lg text-emerald-600">
              ₹{product.sellingPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
