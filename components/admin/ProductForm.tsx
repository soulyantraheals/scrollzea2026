"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PaymentOptionsEditor } from "@/components/admin/PaymentOptionsEditor";
import { slugify } from "@/lib/utils";

interface ProductFormProps {
  product?: any;
  categories: Array<{ id: number; name: string }>;
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    categoryId: product?.categoryId?.toString() || "",
    productType: product?.productType || "READY_MADE",
    price: product?.price?.toString() || "0",
    discountPrice: product?.discountPrice?.toString() || "",
    advancePercentage: product?.advancePercentage?.toString() || "30",
    pricingModel: product?.pricingModel || "fixed",
    status: product?.status || "draft",
    featured: product?.featured ? true : false,
    bestSeller: product?.bestSeller ? true : false,
    leadCaptureRequired: product?.leadCaptureRequired ? true : false,
    deliveryMethod: product?.deliveryMethod || "manual",
    downloadUrl: product?.downloadUrl || "",
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
  });

  const [paymentOptions, setPaymentOptions] = useState<
    Array<{ provider: string; paymentUrl: string; enabled: boolean }>
  >(
    product?.paymentOptions?.length
      ? product.paymentOptions.map((p: any) => ({
          provider: p.provider,
          paymentUrl: p.paymentUrl || "",
          enabled: p.enabled ? true : false,
        }))
      : [
          { provider: "RAZORPAY", paymentUrl: "", enabled: false },
          { provider: "PAYPAL", paymentUrl: "", enabled: false },
          { provider: "WHATSAPP", paymentUrl: "", enabled: false },
        ]
  );

  const [images, setImages] = useState<
    Array<{ url: string; isPrimary: boolean }>
  >(
    product?.images?.map((i: any) => ({
      url: i.imageUrl,
      isPrimary: i.isPrimary ? true : false,
    })) || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
      advancePercentage: parseFloat(form.advancePercentage) || 30,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      featured: form.featured ? 1 : 0,
      bestSeller: form.bestSeller ? 1 : 0,
      leadCaptureRequired: form.leadCaptureRequired ? 1 : 0,
      images: images.map((img, i) => ({
        imageUrl: img.url,
        isPrimary: img.isPrimary ? 1 : 0,
        sortOrder: i,
      })),
      paymentOptions: paymentOptions.filter((p) => p.enabled && p.paymentUrl),
    };

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const err = await res.json();
        alert("Error: " + (err.error || "Failed to save product"));
      }
    } catch (err) {
      console.error("Failed to save product", err);
      alert("Failed to save product. Check console for details.");
    }
    setLoading(false);
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" && !product ? { slug: slugify(value) } : {}),
    }));
  };

  const displayPrice = parseFloat(form.price) || 0;
  const advancePct = parseFloat(form.advancePercentage) || 30;
  const advanceAmount = (displayPrice * advancePct) / 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Short Description
          </label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => updateField("shortDescription", e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Type
            </label>
            <select
              value={form.productType}
              onChange={(e) => updateField("productType", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="READY_MADE">Ready-made (Buy Now)</option>
              <option value="FREE">Free (₹0)</option>
              <option value="PREBOOK">Pre-book (Custom Service, 30% Advance)</option>
              <option value="CUSTOM_QUOTE">Custom Quote (Request Quote)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Price (₹)"
            type="number"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
          />
          <Input
            label="Discount Price (₹)"
            type="number"
            value={form.discountPrice}
            onChange={(e) => updateField("discountPrice", e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pricing Model
            </label>
            <select
              value={form.pricingModel}
              onChange={(e) => updateField("pricingModel", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="fixed">Fixed Price</option>
              <option value="starting_at">Starting From</option>
              <option value="custom_quote">Custom Quote</option>
            </select>
          </div>
        </div>
        {form.productType === "PREBOOK" && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
            <Input
              label="Advance Percentage (%)"
              type="number"
              value={form.advancePercentage}
              onChange={(e) => updateField("advancePercentage", e.target.value)}
            />
            <div className="mt-2 text-sm text-indigo-700 space-y-1">
              <p>Total Price: <strong>₹{displayPrice.toLocaleString("en-IN")}</strong></p>
              <p>Advance ({advancePct}%): <strong>₹{advanceAmount.toLocaleString("en-IN")}</strong></p>
              <p>Remaining: <strong>₹{(displayPrice - advanceAmount).toLocaleString("en-IN")}</strong></p>
            </div>
          </div>
        )}
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Images</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Or paste image URLs directly (one per line)
          </label>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 rounded-lg border border-gray-200"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                if (input.value) {
                  setImages([...images, { url: input.value, isPrimary: images.length === 0 }]);
                  input.value = "";
                }
              }
            }}
          />
        </div>
        <ImageUploader images={images} onImagesChange={setImages} />
      </section>

      {/* Payment Options */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Options</h2>
        <PaymentOptionsEditor options={paymentOptions} onChange={setPaymentOptions} />
      </section>

      {/* Visibility */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Visibility & Status</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.status === "published"}
              onChange={(e) =>
                updateField("status", e.target.checked ? "published" : "draft")
              }
              className="rounded border-gray-300 w-4 h-4"
            />
            <span className="text-sm font-medium">Published (visible on website)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              className="rounded border-gray-300 w-4 h-4"
            />
            <span className="text-sm font-medium">Featured (show on homepage)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.bestSeller}
              onChange={(e) => updateField("bestSeller", e.target.checked)}
              className="rounded border-gray-300 w-4 h-4"
            />
            <span className="text-sm font-medium">Best Seller</span>
          </label>
          {form.productType === "FREE" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.leadCaptureRequired}
                onChange={(e) => updateField("leadCaptureRequired", e.target.checked)}
                className="rounded border-gray-300 w-4 h-4"
              />
              <span className="text-sm font-medium">
                Collect lead info (name, email, phone) before download
              </span>
            </label>
          )}
        </div>
      </section>

      {/* Delivery */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Delivery Method
            </label>
            <select
              value={form.deliveryMethod}
              onChange={(e) => updateField("deliveryMethod", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="manual">Manual Delivery</option>
              <option value="download">Digital Download</option>
              <option value="external_link">External Link</option>
              <option value="contact">Contact Required</option>
            </select>
          </div>
          <Input
            label="Download URL (if applicable)"
            value={form.downloadUrl}
            onChange={(e) => updateField("downloadUrl", e.target.value)}
          />
        </div>
      </section>

      {/* SEO */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">SEO</h2>
        <div className="space-y-4">
          <Input
            label="SEO Title"
            value={form.seoTitle}
            onChange={(e) => updateField("seoTitle", e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              SEO Description
            </label>
            <textarea
              value={form.seoDescription}
              onChange={(e) => updateField("seoDescription", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      <div className="flex gap-4">
        <Button type="submit" loading={loading}>
          {product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
