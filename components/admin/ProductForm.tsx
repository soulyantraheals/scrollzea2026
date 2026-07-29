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

const sectionStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-gold)",
  borderRadius: "12px",
  padding: "24px",
};

const fieldLabelStyle = { color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" };
const inputBaseStyle = {
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-gold)",
  color: "var(--text-primary)",
  borderRadius: "8px",
  padding: "10px 16px",
  width: "100%",
  fontSize: "0.875rem",
  outline: "none",
};

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

  const renderSelect = (label: string, value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputBaseStyle}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  const renderTextarea = (label: string, value: string, onChange: (v: string) => void, rows: number) => (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ ...inputBaseStyle, resize: "vertical" }} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Product Name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          <Input label="Slug" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} required />
        </div>
        <div className="mt-4">
          {renderTextarea("Short Description", form.shortDescription, (v) => updateField("shortDescription", v), 2)}
        </div>
        <div className="mt-4">
          {renderTextarea("Full Description", form.description, (v) => updateField("description", v), 5)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderSelect("Category", form.categoryId, (v) => updateField("categoryId", v), [
            { value: "", label: "Select category" },
            ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name })),
          ])}
          {renderSelect("Product Type", form.productType, (v) => updateField("productType", v), [
            { value: "READY_MADE", label: "Ready-made (Buy Now)" },
            { value: "FREE", label: "Free (₹0)" },
            { value: "PREBOOK", label: "Pre-book (Custom Service, 30% Advance)" },
            { value: "CUSTOM_QUOTE", label: "Custom Quote (Request Quote)" },
          ])}
        </div>
      </section>

      {/* Pricing */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => updateField("price", e.target.value)} />
          <Input label="Discount Price (₹)" type="number" value={form.discountPrice} onChange={(e) => updateField("discountPrice", e.target.value)} />
          {renderSelect("Pricing Model", form.pricingModel, (v) => updateField("pricingModel", v), [
            { value: "fixed", label: "Fixed Price" },
            { value: "starting_at", label: "Starting From" },
            { value: "custom_quote", label: "Custom Quote" },
          ])}
        </div>
        {form.productType === "PREBOOK" && (
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
            <Input label="Advance Percentage (%)" type="number" value={form.advancePercentage} onChange={(e) => updateField("advancePercentage", e.target.value)} />
            <div className="mt-2 text-sm space-y-1" style={{ color: "#818CF8" }}>
              <p>Total Price: <strong>₹{displayPrice.toLocaleString("en-IN")}</strong></p>
              <p>Advance ({advancePct}%): <strong>₹{advanceAmount.toLocaleString("en-IN")}</strong></p>
              <p>Remaining: <strong>₹{(displayPrice - advanceAmount).toLocaleString("en-IN")}</strong></p>
            </div>
          </div>
        )}
      </section>

      {/* Images */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Images</h2>
        <div className="mb-3">
          <label style={fieldLabelStyle}>Or paste image URLs directly (one per line)</label>
          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              style={{ ...inputBaseStyle, flex: 1 }}
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
            <Button type="button" variant="outline" onClick={() => {
              const input = document.querySelector<HTMLInputElement>("input[placeholder='https://example.com/image.jpg']");
              if (input?.value) {
                setImages([...images, { url: input.value, isPrimary: images.length === 0 }]);
                input.value = "";
              }
            }}>Add</Button>
          </div>
        </div>
        <ImageUploader images={images} onImagesChange={setImages} />
      </section>

      {/* Payment Options */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Payment Options</h2>
        <PaymentOptionsEditor options={paymentOptions} onChange={setPaymentOptions} />
      </section>

      {/* Visibility */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Visibility & Status</h2>
        <div className="space-y-3">
          {[
            { field: "status", label: "Published (visible on website)", checkValue: form.status === "published", onChange: (checked: boolean) => updateField("status", checked ? "published" : "draft") },
            { field: "featured", label: "Featured (show on homepage)", checkValue: form.featured, onChange: (checked: boolean) => updateField("featured", checked) },
            { field: "bestSeller", label: "Best Seller", checkValue: form.bestSeller, onChange: (checked: boolean) => updateField("bestSeller", checked) },
          ].map((item) => (
            <label key={item.field} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={item.checkValue}
                onChange={(e) => item.onChange(e.target.checked)}
                className="rounded w-4 h-4"
                style={{ accentColor: "var(--accent-gold)" }}
              />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</span>
            </label>
          ))}
          {form.productType === "FREE" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.leadCaptureRequired}
                onChange={(e) => updateField("leadCaptureRequired", e.target.checked)}
                className="rounded w-4 h-4"
                style={{ accentColor: "var(--accent-gold)" }}
              />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Collect lead info (name, email, phone) before download
              </span>
            </label>
          )}
        </div>
      </section>

      {/* Delivery */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect("Delivery Method", form.deliveryMethod, (v) => updateField("deliveryMethod", v), [
            { value: "manual", label: "Manual Delivery" },
            { value: "download", label: "Digital Download" },
            { value: "external_link", label: "External Link" },
            { value: "contact", label: "Contact Required" },
          ])}
          <Input label="Download URL (if applicable)" value={form.downloadUrl} onChange={(e) => updateField("downloadUrl", e.target.value)} />
        </div>
      </section>

      {/* SEO */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>SEO</h2>
        <div className="space-y-4">
          <Input label="SEO Title" value={form.seoTitle} onChange={(e) => updateField("seoTitle", e.target.value)} />
          {renderTextarea("SEO Description", form.seoDescription, (v) => updateField("seoDescription", v), 2)}
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
