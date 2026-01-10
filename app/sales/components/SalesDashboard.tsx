"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronRight, LayoutGrid, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr"; // 🔥 1. Import SWR
import AddArea from "./AddArea";
import EditArea from "./EditArea";

// Types
interface User {
  id?: string | null;
  name?: string | null;
  role: string;
}

interface Area {
  id: string;
  name: string;
}

interface SalesDashboardProps {
  user: User;
  areaList?: Area[]; // Initial data from server
}

// 🔥 2. Fetcher Function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SalesDashboard({ user, areaList = [] }: SalesDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 3. Use SWR for Real-Time Data
  const { data, mutate } = useSWR("/api/areas", fetcher, {
    fallbackData: { areas: areaList },
    refreshInterval: 15000, // ✅ Ab har 15 sec mein check karega (Server Relaxed)
    revalidateOnFocus: true, // ✅ Tab switch karne par update hoga
    revalidateOnReconnect: true, // ✅ Net aate hi update
    dedupingInterval: 5000, // ✅ 5 sec tak same request dobara nahi jayegi
  });

  // Safe access to areas
  const areas: Area[] = data?.areas || [];

  // Search Logic
  const filteredAreas = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return areas.filter((area) =>
      area.name.toLowerCase().includes(lower)
    );
  }, [searchQuery, areas]);

  // 🔥 Delete Logic with Auto Update
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this area permanently?")) return;

    // Optimistic Update (UI se turant gayab)
    mutate(
      { areas: areas.filter((a) => a.id !== id) },
      false // Revalidate mat karo abhi, bas UI update karo
    );

    try {
      const res = await fetch(`/api/areas?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Area deleted");
      mutate(); // ⚡ Server se fresh data maang lo
    } catch {
      toast.error("Could not delete area");
      mutate(); // Error aaya to wapas purana data lao
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
      {/* 🌿 ID Card Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-b-[2.5rem] shadow-lg shadow-emerald-200/50 p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 shadow-inner">
            <span className="text-2xl font-black text-white drop-shadow-md">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="text-emerald-100 text-xs font-bold tracking-widest uppercase mb-0.5 opacity-90">
              Sales Representative
            </p>
            <h1 className="text-2xl font-black text-white tracking-wide">
              {user.name}
            </h1>
            <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-white font-medium">Active Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌿 Content Area */}
      <div className="px-5 relative z-20 mt-2">
        
        {/* Search & Add Row */}
        <div className="flex gap-3 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-400 shadow-emerald-100/50 p-2 flex items-center flex-1">
            <div className="pl-3 text-emerald-300">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none font-medium"
            />
          </div>
          {/* Add Button - Calls mutate on success */}
          <AddArea onSuccess={() => mutate()} />
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-slate-800 font-bold text-lg flex items-center gap-2">
            <LayoutGrid size={18} className="text-emerald-500" />
            Select Area
          </h2>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
            {filteredAreas.length} Areas
          </span>
        </div>

        {/* Area List */}
        {filteredAreas.length === 0 ? (
          <div className="text-center py-12 opacity-60 bg-white/50 rounded-3xl border border-dashed border-emerald-200">
            <MapPin size={48} className="mx-auto text-emerald-200 mb-3" />
            <p className="text-slate-500 font-medium">No areas found.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredAreas.map((area) => (
              <div
                key={area.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-50/50 flex items-center justify-between group hover:shadow-md transition-all duration-300"
              >
                {/* Clickable Link */}
                <Link
                  href={`/sales/shops?areaId=${area.id}`}
                  className="flex-1 flex items-center gap-4 cursor-pointer"
                >
                  <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-lg group-hover:text-emerald-700 transition-colors">
                      {area.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium group-hover:text-emerald-400/80">
                      Tap to view shops
                    </p>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-3 border-l border-slate-100 ml-2">
                  <EditArea 
                    area={area} 
                    onSuccess={() => mutate()} // ⚡ Auto update on edit
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(area.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <Link href={`/sales/shops?areaId=${area.id}`} className="p-1 text-emerald-200 group-hover:text-emerald-500">
                     <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// "use client";

// import { useState, useMemo } from "react";
// import Link from "next/link";
// import {
//   Search,
//   MapPin,
//   ChevronRight,
//   LayoutGrid,
//   Trash2,
//   RefreshCcw,
// } from "lucide-react";
// import { toast } from "sonner";
// import useSWR from "swr"; // ✅ SWR Import
// import AddArea from "./AddArea";
// import EditArea from "./EditArea";

// // --- TYPES ---
// interface User {
//   id?: string | null;
//   name?: string | null;
//   role: string;
// }

// interface Area {
//   id: string;
//   name: string;
// }

// interface SalesDashboardProps {
//   user: User;
//   areaList?: Area[];
// }

// // --- FETCHER FUNCTION ---
// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// export default function SalesDashboard({
//   user,
//   areaList = [],
// }: SalesDashboardProps) {
//   const [searchQuery, setSearchQuery] = useState("");

//   // 🔥 100% WORKING SWR CONFIG
//   const { data, mutate, isValidating } = useSWR("/api/areas", fetcher, {
//     fallbackData: { areas: areaList }, // Server data start mein dikhega
//     refreshInterval: 4000, // ✅ Har 4 sec mein auto-update (Perfect Balance)
//     revalidateOnFocus: true, // ✅ App par aate hi update
//     revalidateOnReconnect: true, // ✅ Net aate hi update
//   });

//   // Safe Area List
//   const areas: Area[] = data?.areas || [];

//   // Search Filter
//   const filteredAreas = useMemo(() => {
//     const lower = searchQuery.toLowerCase();
//     return areas.filter((area) => area.name.toLowerCase().includes(lower));
//   }, [searchQuery, areas]);

//   // Handle Delete with Optimistic UI
//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this area?")) return;

//     // 1. Optimistic Update: UI se turant hatao
//     const updatedAreas = areas.filter((a) => a.id !== id);

//     // False ka matlab: "Abhi server se mat puccho, bas UI badal do"
//     await mutate({ areas: updatedAreas }, false);

//     try {
//       // 2. API Call
//       const res = await fetch(`/api/areas?id=${id}`, { method: "DELETE" });

//       if (!res.ok) throw new Error("Delete failed");

//       toast.success("Area deleted");

//       // 3. Final Sync: Server se fresh data le aao (Just to be sure)
//       mutate();
//     } catch (err) {
//       toast.error("Could not delete area");
//       mutate(); // Error aaya toh wapas purana data dikhao
//     }
//   };

//   return (
//     <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
//       {/* 🌿 ID Card Header */}
//       <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-b-[2.5rem] shadow-lg shadow-emerald-200/50 p-6 relative overflow-hidden">
//         <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
//         <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

//         <div className="flex items-center gap-5 relative z-10">
//           <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 shadow-inner">
//             <span className="text-2xl font-black text-white drop-shadow-md">
//               {user.name?.charAt(0).toUpperCase() || "U"}
//             </span>
//           </div>

//           <div>
//             <p className="text-emerald-100 text-xs font-bold tracking-widest uppercase mb-0.5 opacity-90">
//               Sales Representative
//             </p>
//             <h1 className="text-2xl font-black text-white tracking-wide">
//               {user.name}
//             </h1>
//             <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">
//               <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></div>
//               <span className="text-[10px] text-white font-medium">
//                 Active Now
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 🌿 Content Area */}
//       <div className="px-5 relative z-20 mt-2">
//         {/* Search & Add Row */}
//         <div className="flex gap-3 mb-8">
//           <div className="bg-white rounded-2xl shadow-lg border border-emerald-400 shadow-emerald-100/50 p-2 flex items-center flex-1">
//             <div className="pl-3 text-emerald-300">
//               {/* Agar background mein data update ho raha hai to Spinner dikhega */}
//               {isValidating ? (
//                 <RefreshCcw size={18} className="animate-spin" />
//               ) : (
//                 <Search size={20} />
//               )}
//             </div>
//             <input
//               type="text"
//               placeholder="Search area..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-3 pr-4 py-2.5 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none font-medium"
//             />
//           </div>

//           {/* Add Button - Success hone par mutate() call karega */}
//           <AddArea onSuccess={() => mutate()} />
//         </div>

//         {/* Title */}
//         <div className="flex items-center justify-between mb-4 px-2">
//           <h2 className="text-slate-800 font-bold text-lg flex items-center gap-2">
//             <LayoutGrid size={18} className="text-emerald-500" />
//             Select Area
//           </h2>
//           <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
//             {filteredAreas.length} Areas
//           </span>
//         </div>

//         {/* List */}
//         {filteredAreas.length === 0 ? (
//           <div className="text-center py-12 opacity-60 bg-white/50 rounded-3xl border border-dashed border-emerald-200">
//             <MapPin size={48} className="mx-auto text-emerald-200 mb-3" />
//             <p className="text-slate-500 font-medium">No areas found.</p>
//           </div>
//         ) : (
//           <div className="grid gap-3">
//             {filteredAreas.map((area) => (
//               <div
//                 key={area.id}
//                 className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-50/50 flex items-center justify-between group hover:shadow-md transition-all duration-300"
//               >
//                 {/* Left: Link to Shops */}
//                 <Link
//                   href={`/sales/shops?areaId=${area.id}`}
//                   className="flex-1 flex items-center gap-4 cursor-pointer"
//                 >
//                   <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
//                     <MapPin size={22} />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-slate-700 text-lg group-hover:text-emerald-700 transition-colors">
//                       {area.name}
//                     </h3>
//                     <p className="text-xs text-slate-400 font-medium group-hover:text-emerald-400/80">
//                       Tap to view shops
//                     </p>
//                   </div>
//                 </Link>

//                 {/* Right: Actions */}
//                 <div className="flex items-center gap-2 pl-3 border-l border-slate-100 ml-2">
//                   <EditArea
//                     area={area}
//                     onSuccess={() => mutate()} // Edit hone par turant refresh
//                   />

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDelete(area.id);
//                     }}
//                     className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
//                   >
//                     <Trash2 size={18} />
//                   </button>

//                   <Link
//                     href={`/sales/shops?areaId=${area.id}`}
//                     className="p-1 text-emerald-200 group-hover:text-emerald-500"
//                   >
//                     <ChevronRight size={20} />
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
