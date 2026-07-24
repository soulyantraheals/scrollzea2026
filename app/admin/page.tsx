"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingCart, MessageSquare, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatPrice, formatDate } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalProducts: number;
    publishedProducts: number;
    totalLeads: number;
    newLeads: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentLeads: Array<{ id: number; name: string; email: string; purpose: string; status: string; createdAt: string }>;
  recentOrders: Array<{ id: number; orderNumber: string; customerName: string; totalAmount: number; paymentStatus: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = data?.stats ? [
    { label: "Total Products", value: data.stats.totalProducts, icon: Package },
    { label: "Published", value: data.stats.publishedProducts, icon: Package },
    { label: "New Leads", value: data.stats.newLeads, icon: MessageSquare },
    { label: "Orders", value: data.stats.totalOrders, icon: ShoppingCart },
    { label: "Revenue", value: formatPrice(data.stats.totalRevenue), icon: TrendingUp },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your Scrollzea admin panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No orders yet.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
          {data?.recentLeads && data.recentLeads.length > 0 ? (
            <div className="space-y-3">
              {data.recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.purpose || "General enquiry"}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 capitalize">{lead.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No leads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
