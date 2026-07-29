"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const tdStyle = { padding: "12px 16px", color: "var(--text-primary)" };
  const thStyle = { padding: "12px 16px", textAlign: "left" as const, fontWeight: 500, color: "var(--text-muted)" };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Orders</h1>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders from customer purchases will appear here." />
      ) : (
        <div
          className="overflow-hidden rounded-xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
                <tr style={{ borderBottom: "1px solid var(--border-gold)" }}>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Product</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border-gold)" }}>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.75rem" }}>{o.orderNumber}</td>
                    <td style={tdStyle}>{o.customerName}</td>
                    <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{o.productName}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500 }}>{formatPrice(o.totalAmount)}</td>
                    <td style={tdStyle}>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            o.paymentStatus === "paid" ? "rgba(34, 197, 94, 0.1)" :
                            o.paymentStatus === "pending" ? "rgba(212, 175, 55, 0.1)" :
                            "rgba(239, 68, 68, 0.1)",
                          color:
                            o.paymentStatus === "paid" ? "#22C55E" :
                            o.paymentStatus === "pending" ? "#D4AF37" :
                            "#EF4444",
                        }}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            o.orderStatus === "completed" ? "rgba(34, 197, 94, 0.1)" :
                            o.orderStatus === "processing" ? "rgba(59, 130, 246, 0.1)" :
                            "rgba(107, 123, 118, 0.1)",
                          color:
                            o.orderStatus === "completed" ? "#22C55E" :
                            o.orderStatus === "processing" ? "#3B82F6" :
                            "var(--text-dim)",
                        }}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: "0.75rem", color: "var(--text-dim)" }}>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
