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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
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
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Featured</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Best Seller</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0].imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.productType === "FREE" ? "free" : p.productType === "PREBOOK" ? "prebook" : "default"}>
                        {p.productType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{p.featured ? "⭐" : "—"}</td>
                    <td className="px-4 py-3 text-center">{p.bestSeller ? "🏆" : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Pencil className="h-4 w-4 text-gray-600" />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4 text-red-500" />
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
