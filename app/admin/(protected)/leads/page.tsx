"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState("all");

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/leads");
      setLeads(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/leads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchLeads();
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    await fetch("/api/admin/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchLeads();
  };

  const statusColors: Record<string, string> = {
    new: "rgba(212, 175, 55, 0.1); color: #D4AF37",
    contacted: "rgba(59, 130, 246, 0.1); color: #3B82F6",
    qualified: "rgba(99, 102, 241, 0.1); color: #818CF8",
    converted: "rgba(34, 197, 94, 0.1); color: #22C55E",
    closed: "rgba(107, 123, 118, 0.1); color: #6B7B76",
    spam: "rgba(239, 68, 68, 0.1); color: #EF4444",
  };

  if (loading) return <LoadingSpinner />;

  const productCounts = leads.reduce<Record<string, number>>((acc, lead: any) => {
    const name = lead.productName || "—";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const filteredLeads =
    productFilter === "all"
      ? leads
      : leads.filter((lead: any) => (lead.productName || "—") === productFilter);

  const tdStyle = { padding: "12px 16px", color: "var(--text-primary)" };
  const thStyle = { padding: "12px 16px", textAlign: "left" as const, fontWeight: 500, color: "var(--text-muted)" };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Leads</h1>
      {leads.length === 0 ? (
        <EmptyState title="No leads yet" description="Leads from contact forms and free product downloads will appear here." />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="text-sm" style={{ color: "var(--text-muted)" }}>Product:</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm cursor-pointer"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
            >
              <option value="all">All products ({leads.length})</option>
              {Object.entries(productCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <option key={name} value={name}>{name} ({count})</option>
                ))}
            </select>
          </div>
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <tr style={{ borderBottom: "1px solid var(--border-gold)" }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Purpose</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead: any) => (
                    <tr key={lead.id} style={{ borderBottom: "1px solid var(--border-gold)" }}>
                      <td style={tdStyle} className="font-medium">{lead.name}</td>
                      <td style={{ ...tdStyle, color: "var(--text-muted)" }}>
                        <p>{lead.email}</p>
                        <p className="text-xs" style={{ color: "var(--text-dim)" }}>{lead.phone}</p>
                      </td>
                      <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{lead.productName || "—"}</td>
                      <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{lead.purpose || "—"}</td>
                    <td style={tdStyle}>
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer"
                        style={{
                          backgroundColor: statusColors[lead.status]?.split(";")[0] || "rgba(107, 123, 118, 0.1)",
                          color: statusColors[lead.status]?.split(":")[1]?.trim() || "var(--text-dim)",
                        }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                        <option value="spam">Spam</option>
                      </select>
                    </td>
                    <td style={{ ...tdStyle, fontSize: "0.75rem", color: "var(--text-dim)" }}>{formatDate(lead.createdAt)}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="p-1.5 rounded-lg text-xs transition-colors"
                        style={{ color: "#EF4444" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
