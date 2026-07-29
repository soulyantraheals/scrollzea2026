"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, { bg: string; color: string }> = {
    pre_booked: { bg: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" },
    requirements_pending: { bg: "rgba(212, 175, 55, 0.1)", color: "#D4AF37" },
    in_progress: { bg: "rgba(99, 102, 241, 0.1)", color: "#818CF8" },
    review: { bg: "rgba(168, 85, 247, 0.1)", color: "#A855F7" },
    completed: { bg: "rgba(34, 197, 94, 0.1)", color: "#22C55E" },
    cancelled: { bg: "rgba(239, 68, 68, 0.1)", color: "#EF4444" },
  };

  if (loading) return <LoadingSpinner />;

  const tdStyle = { padding: "12px 16px", color: "var(--text-primary)" };
  const thStyle = { padding: "12px 16px", textAlign: "left" as const, fontWeight: 500, color: "var(--text-muted)" };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Custom Projects</h1>
      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Pre-booked custom service projects will appear here." />
      ) : (
        <div
          className="overflow-hidden rounded-xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
                <tr style={{ borderBottom: "1px solid var(--border-gold)" }}>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Advance</th>
                  <th style={thStyle}>Paid</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => {
                  const sc = statusColors[p.projectStatus] || { bg: "rgba(107, 123, 118, 0.1)", color: "var(--text-dim)" };
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-gold)" }}>
                      <td style={tdStyle} className="font-medium">{p.customerName}</td>
                      <td style={{ ...tdStyle, color: "var(--accent-gold)" }}>₹{p.totalPrice.toLocaleString("en-IN")}</td>
                      <td style={tdStyle}>₹{p.advanceAmount.toLocaleString("en-IN")}</td>
                      <td style={tdStyle}>₹{p.amountPaid.toLocaleString("en-IN")}</td>
                      <td style={tdStyle}>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: sc.bg, color: sc.color }}
                        >
                          {p.projectStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: "0.75rem", color: "var(--text-dim)" }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
