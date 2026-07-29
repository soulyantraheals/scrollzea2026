"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const tdStyle = { padding: "12px 16px", color: "var(--text-primary)" };
  const thStyle = { padding: "12px 16px", textAlign: "left" as const, fontWeight: 500, color: "var(--text-muted)" };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Customers</h1>
      {customers.length === 0 ? (
        <EmptyState title="No registered customers yet" description="Customers who create accounts will appear here." />
      ) : (
        <div
          className="overflow-hidden rounded-xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
              <tr style={{ borderBottom: "1px solid var(--border-gold)" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border-gold)" }}>
                  <td style={tdStyle} className="font-medium">{c.name}</td>
                  <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{c.email || "—"}</td>
                  <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{c.phone || "—"}</td>
                  <td style={tdStyle}>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: c.isGuest ? "rgba(107, 123, 118, 0.1)" : "rgba(99, 102, 241, 0.1)",
                        color: c.isGuest ? "var(--text-dim)" : "#818CF8",
                      }}
                    >
                      {c.isGuest ? "Guest" : "Account"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: "0.75rem", color: "var(--text-dim)" }}>{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
