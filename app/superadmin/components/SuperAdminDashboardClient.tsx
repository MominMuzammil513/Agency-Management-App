"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Shield,
  Building2,
  Users,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Calendar,
  DollarSign,
  LogOut,
  Settings,
  Plus,
  Edit,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import CreateOwnerAdminModal from "./CreateOwnerAdminModal";
import EditOwnerAdminModal from "./EditOwnerAdminModal";

interface Stats {
  totalAgencies: number;
  totalUsers: number;
  activeUsers: number;
  todayOrders: number;
  todaySales: number;
}

interface Agency {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerMobile: string | null;
  ownerAltMobile: string | null;
  ownerIsActive: boolean | null;
  createdAt: string;
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
}

interface SuperAdminDashboardClientProps {
  stats: Stats;
  agencies: Agency[];
}

export default function SuperAdminDashboardClient({
  stats,
  agencies,
}: SuperAdminDashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<{
    id: string;
    name: string;
    email: string;
    mobile: string;
    altMobile: string | null;
    isActive: boolean;
    agencyName: string;
  } | null>(null);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    setLoading(true);
    try {
      await signOut({ redirect: false, callbackUrl: "/login" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pb-24">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-purple-100 sticky top-0 z-30 shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">Super Admin</h1>
              <p className="text-xs text-slate-500">System Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="p-2 bg-red-50 text-red-600 rounded-xl transition-colors disabled:opacity-50"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 py-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={18} className="text-purple-600" />
              <p className="text-xs text-slate-500 font-bold uppercase">Agencies</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.totalAgencies}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-blue-600" />
              <p className="text-xs text-slate-500 font-bold uppercase">Total Users</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck size={18} className="text-emerald-600" />
              <p className="text-xs text-slate-500 font-bold uppercase">Active Users</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.activeUsers}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag size={18} className="text-orange-600" />
              <p className="text-xs text-slate-500 font-bold uppercase">Today's Orders</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.todayOrders}</p>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/80 font-bold uppercase mb-1">Today's Sales</p>
              <p className="text-3xl font-black text-white">
                ₹{stats.todaySales.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Agencies List */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Building2 size={20} />
            Agencies ({agencies.length})
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Create Owner
          </button>
        </div>

        <div className="space-y-3">
          {agencies.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
              <Building2 size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">No agencies found</p>
            </div>
          ) : (
            agencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800 text-lg mb-1">{agency.name}</h3>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">
                        <span className="font-bold">Owner:</span> {agency.ownerName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-bold">Email:</span> {agency.ownerEmail || "N/A"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Created: {new Date(agency.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agency Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Users</p>
                    <p className="text-sm font-black text-slate-800">{agency.totalUsers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Orders</p>
                    <p className="text-sm font-black text-slate-800">{agency.totalOrders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Sales</p>
                    <p className="text-sm font-black text-emerald-600">
                      ₹{agency.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setSelectedOwner({
                        id: agency.ownerId,
                        name: agency.ownerName || "",
                        email: agency.ownerEmail || "",
                        mobile: agency.ownerMobile || "",
                        altMobile: agency.ownerAltMobile,
                        isActive: agency.ownerIsActive ?? true,
                        agencyName: agency.name,
                      });
                      setShowEditModal(true);
                    }}
                    className="flex-1 bg-purple-50 text-purple-700 py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateOwnerAdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <EditOwnerAdminModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOwner(null);
        }}
        ownerAdmin={selectedOwner}
      />
    </div>
  );
}
