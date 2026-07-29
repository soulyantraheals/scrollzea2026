"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { slugify } from "@/lib/utils";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", status: "active", sortOrder: 0 });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      setCategories(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", status: "active", sortOrder: categories.length });
    setModalOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm(cat);
    setModalOpen(true);
  };

  const save = async () => {
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setModalOpen(false);
    fetchCategories();
  };

  const deleteCat = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCategories();
  };

  if (loading) return <LoadingSpinner />;

  const tdStyle = { padding: "12px 16px", color: "var(--text-primary)" };
  const thStyle = { padding: "12px 16px", textAlign: "left" as const, fontWeight: 500, color: "var(--text-muted)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Categories</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories" description="Create your first product category." action={<Button onClick={openNew}>Add Category</Button>} />
      ) : (
        <div
          className="overflow-hidden rounded-xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
              <tr style={{ borderBottom: "1px solid var(--border-gold)" }}>
                <th style={thStyle}>Order</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid var(--border-gold)" }}>
                  <td style={tdStyle}><GripVertical className="h-4 w-4" style={{ color: "var(--text-dim)" }} /></td>
                  <td style={tdStyle} className="font-medium">{cat.name}</td>
                  <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{cat.slug}</td>
                  <td style={tdStyle}>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: cat.status === "active" ? "rgba(34, 197, 94, 0.1)" : "rgba(107, 123, 118, 0.1)",
                        color: cat.status === "active" ? "#22C55E" : "var(--text-dim)",
                      }}
                    >
                      {cat.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteCat(cat.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: "#EF4444" }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "Add Category"}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-gold)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-gold)",
                color: "var(--text-primary)",
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
