"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils";
import { BarChart3, MousePointerClick, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <EmptyState title="No analytics data yet" description="Data will appear once customers interact with your products." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 mt-1">Track clicks, sales, and product performance.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clicks" value={data.totalClicks} icon={MousePointerClick} />
        <StatCard label="Total Sales" value={data.totalSales} icon={ShoppingCart} />
        <StatCard label="Total Revenue" value={formatPrice(data.totalRevenue)} icon={TrendingUp} />
        <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} icon={BarChart3} />
      </div>

      {/* Top Products */}
      {data.topProducts?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">🔥 Top Products by Clicks</h2>
          <div className="space-y-3">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{p.clickCount} clicks</span>
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (p.clickCount / data.topProducts[0].clickCount) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Products */}
      {data.bottomProducts?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">⚠️ Products Needing Attention</h2>
          <p className="text-sm text-gray-500 mb-4">These products have low or no engagement.</p>
          <div className="space-y-2">
            {data.bottomProducts.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <span className="text-xs text-red-600 font-medium">{p.clickCount} clicks · {p.saleCount} sales</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clicks by Payment Method */}
      {data.clicksByMethod?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.clicksByMethod.map((m: any) => (
            <div key={m.method} className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <p className="text-2xl font-bold text-gray-900">{m.count}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">{m.method.replace("_", " ")} Clicks</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
