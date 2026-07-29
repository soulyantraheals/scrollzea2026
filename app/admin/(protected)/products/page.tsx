"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  if (loading) return <LoadingSpinner />;

  const tdStyle = { padding: "12px 16px", color: "var(--text-primary)" };
  const thStyle = { padding: "12px 16px", textAlign: "left" as const, fontWeight: 500, color: "var(--text-muted)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Products</h1>
        <Link href="/admin/products/new">
          <Button><Plus className="h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start selling on Scrollzea."
          action={<Link href="/admin/products/new"><Button>Add Product</Button></Link>}
        />
      ) : (
        <div
          className="overflow-hidden rounded-xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
                <tr style={{ borderBottom: "1px solid var(--border-gold)" }}>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle} className="text-center">Featured</th>
                  <th style={thStyle} className="text-center">Best Seller</th>
                  <th style={thStyle} className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-gold)", backgroundColor: "transparent" }}>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0].imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-dim)" }}>ID: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <Badge variant={p.productType === "FREE" ? "free" : p.productType === "PREBOOK" ? "prebook" : "default"}>
                        {p.productType}
                      </Badge>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{formatPrice(p.price)}</td>
                    <td style={tdStyle}>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: p.status === "published" ? "rgba(34, 197, 94, 0.1)" : "rgba(107, 123, 118, 0.1)",
                          color: p.status === "published" ? "#22C55E" : "var(--text-dim)",
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{p.featured ? "⭐" : "—"}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{p.bestSeller ? "🏆" : "—"}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "#EF4444" }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
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
