"use client";

import { useState, useEffect } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function NewProductPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
