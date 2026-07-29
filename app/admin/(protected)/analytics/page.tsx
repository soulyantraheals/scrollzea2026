"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils";
import { BarChart3, MousePointerClick, ShoppingCart, TrendingUp } from "lucide-react";

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

  const sectionCardStyle = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-gold)",
    borderRadius: "12px",
    padding: "24px",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
        <p className="mt-1" style={{ color: "var(--text-muted)" }}>Track clicks, sales, and product performance.</p>
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
        <div style={sectionCardStyle}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>🔥 Top Products by Clicks</h2>
          <div className="space-y-3">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold w-6" style={{ color: "var(--text-dim)" }}>#{i + 1}</span>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>{p.clickCount} clicks</span>
                  <div className="w-32 rounded-full h-2" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (p.clickCount / data.topProducts[0].clickCount) * 100)}%`,
                        backgroundColor: "var(--accent-gold)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Products */}
      {data.bottomProducts?.length > 0 && (
        <div style={sectionCardStyle}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>⚠️ Products Needing Attention</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>These products have low or no engagement.</p>
          <div className="space-y-2">
            {data.bottomProducts.map((p: any) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.08)" }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                <span className="text-xs font-medium" style={{ color: "#EF4444" }}>
                  {p.clickCount} clicks · {p.saleCount} sales
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clicks by Payment Method */}
      {data.clicksByMethod?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.clicksByMethod.map((m: any) => (
            <div key={m.method} style={sectionCardStyle} className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{m.count}</p>
              <p className="text-sm mt-1 capitalize" style={{ color: "var(--text-muted)" }}>{m.method.replace("_", " ")} Clicks</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
