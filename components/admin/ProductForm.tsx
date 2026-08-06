"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PaymentOptionsEditor } from "@/components/admin/PaymentOptionsEditor";
import { ListEditor } from "@/components/admin/ListEditor";
import { slugify } from "@/lib/utils";

interface ProductFormProps {
  product?: any;
  categories: Array<{ id: number; name: string }>;
}

const sectionStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-gold)",
  borderRadius: "12px",
  padding: "24px",
};

const fieldLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "0.875rem",
  fontWeight: 500,
  marginBottom: "6px",
  display: "block",
};

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-gold)",
  color: "var(--text-primary)",
  borderRadius: "8px",
  padding: "10px 16px",
  width: "100%",
  fontSize: "0.875rem",
  outline: "none",
};

// Split an ISO timestamp into local date (YYYY-MM-DD) and time (HH:MM) for inputs
function splitDateTime(iso?: string | null) {
  if (!iso) return { date: "", time: "" };
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return { date: "", time: "" };
  const date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
  const time = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

// Combine date + time inputs into an ISO string (or null if no date)
function combineDateTime(date: string, time: string) {
  if (!date) return null;
  const t = time || "23:59";
  const dt = new Date(`${date}T${t}:00`);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

const bool = (v: any) => (v ? true : false);

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const initialExpiry = splitDateTime(product?.expiresAt);

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    categoryId: product?.categoryId?.toString() || "",
    productType: product?.productType || "READY_MADE",
    // Price (₹) = selling price (shown bold). Discount Price (₹) = original/MRP (struck through).
    price: product?.price?.toString() || "0",
    discountPrice: product?.discountPrice?.toString() || "",
    currency: product?.currency || "INR",
    advancePercentage: product?.advancePercentage?.toString() || "30",
    pricingModel: product?.pricingModel || "fixed",
    status: product?.status || "draft",
    featured: bool(product?.featured),
    bestSeller: bool(product?.bestSeller),
    leadCaptureRequired: bool(product?.leadCaptureRequired),
    deliveryMethod: product?.deliveryMethod || "manual",
    downloadUrl: product?.downloadUrl || "",
    whatsappMessage: product?.whatsappMessage || "",
    // Limited Time Offer
    showLimitedOffer: bool(product?.showLimitedOffer),
    offerLabel: product?.offerLabel || "Limited Time Offer",
    paymentDescription: product?.paymentDescription || "One-time payment · Lifetime access · No subscriptions",
    ctaText: product?.ctaText || "Get Instant Access Now",
    socialProofText: product?.socialProofText || "Join 50,000+ satisfied customers",
    // Hurry-up countdown
    urgencyEnabled: bool(product?.urgencyEnabled),
    showFireSymbol: bool(product?.showFireSymbol !== 0),
    urgencyText: product?.urgencyText || "Hurry! Offer Ends In",
    expiresDate: initialExpiry.date,
    expiresTime: initialExpiry.time,
    // YouTube
    youtubeEnabled: bool(product?.youtubeEnabled),
    youtubeUrl: product?.youtubeUrl || "",
    youtubeButtonText: product?.youtubeButtonText || "Watch YouTube Video",
    youtubeVideoTitle: product?.youtubeVideoTitle || "",
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

  // What's Included (product_features)
  const [features, setFeatures] = useState<Record<string, any>[]>(
    product?.features?.map((f: any) => ({
      id: f.id,
      text: f.feature,
      enabled: f.enabled !== 0,
    })) || []
  );
  // FAQs
  const [faqs, setFaqs] = useState<Record<string, any>[]>(
    product?.faqs?.map((f: any) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      enabled: f.enabled !== 0,
    })) || []
  );
  // Customer Reviews
  const [reviews, setReviews] = useState<Record<string, any>[]>(
    product?.reviews?.map((r: any) => ({
      id: r.id,
      customerName: r.customerName,
      company: r.company || "",
      rating: r.rating || 5,
      reviewText: r.reviewText,
      enabled: r.enabled !== 0,
    })) || []
  );
  // Perfect For
  const [perfectFor, setPerfectFor] = useState<Record<string, any>[]>(
    product?.perfectFor?.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      enabled: p.enabled !== 0,
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
      showLimitedOffer: form.showLimitedOffer ? 1 : 0,
      urgencyEnabled: form.urgencyEnabled ? 1 : 0,
      showFireSymbol: form.showFireSymbol ? 1 : 0,
      youtubeEnabled: form.youtubeEnabled ? 1 : 0,
      expiresAt: combineDateTime(form.expiresDate, form.expiresTime),
      images: images.map((img, i) => ({
        imageUrl: img.url,
        isPrimary: img.isPrimary ? 1 : 0,
        sortOrder: i,
      })),
      paymentOptions: paymentOptions.filter((p) => p.enabled && p.paymentUrl),
      features: features
        .filter((f) => (f.text || "").trim())
        .map((f, i) => ({
          feature: f.text.trim(),
          enabled: f.enabled !== false ? 1 : 0,
          sortOrder: i,
        })),
      faqs: faqs
        .filter((f) => (f.question || "").trim())
        .map((f, i) => ({
          question: f.question.trim(),
          answer: (f.answer || "").trim(),
          enabled: f.enabled !== false ? 1 : 0,
          sortOrder: i,
        })),
      reviews: reviews
        .filter((r) => (r.reviewText || "").trim())
        .map((r, i) => ({
          customerName: (r.customerName || "").trim(),
          company: (r.company || "").trim() || null,
          rating: parseInt(r.rating) || 5,
          reviewText: r.reviewText.trim(),
          enabled: r.enabled !== false ? 1 : 0,
          sortOrder: i,
        })),
      perfectFor: perfectFor
        .filter((p) => (p.title || "").trim())
        .map((p, i) => ({
          title: p.title.trim(),
          description: (p.description || "").trim() || null,
          enabled: p.enabled !== false ? 1 : 0,
          sortOrder: i,
        })),
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

  const renderCheckbox = (field: string, label: string, hint?: string) => (
    <label className="flex items-start gap-3 cursor-pointer py-1">
      <input
        type="checkbox"
        checked={(form as any)[field]}
        onChange={(e) => updateField(field, e.target.checked)}
        className="rounded w-4 h-4 mt-0.5"
        style={{ accentColor: "var(--accent-gold)" }}
      />
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {label}
        {hint && <span className="block text-xs font-normal mt-0.5" style={{ color: "var(--text-muted)" }}>{hint}</span>}
      </span>
    </label>
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
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Pricing</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Price (₹) = what customers pay (shown bold). Discount Price (₹) = original/MRP (shown struck through, e.g. Price 389, Discount Price 1999).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Price (₹) — Selling Price" type="number" value={form.price} onChange={(e) => updateField("price", e.target.value)} />
          <Input label="Discount Price (₹) — Original/MRP" type="number" value={form.discountPrice} onChange={(e) => updateField("discountPrice", e.target.value)} />
          <Input label="Currency" value={form.currency} onChange={(e) => updateField("currency", e.target.value)} placeholder="INR" />
        </div>
        <div className="mt-4">
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

      {/* Limited Time Offer */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Limited Time Offer</h2>
        <div className="space-y-4">
          {renderCheckbox("showLimitedOffer", "Show Limited Time Offer", "Shows the conversion-focused offer section on the product page.")}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Offer Label" value={form.offerLabel} onChange={(e) => updateField("offerLabel", e.target.value)} placeholder="Limited Time Offer" />
            <Input label="CTA Text" value={form.ctaText} onChange={(e) => updateField("ctaText", e.target.value)} placeholder="Get Instant Access Now" />
          </div>
          <div>
            {renderTextarea("Payment Description", form.paymentDescription, (v) => updateField("paymentDescription", v), 2)}
          </div>
          <div>
            {renderTextarea("Social Proof Text", form.socialProofText, (v) => updateField("socialProofText", v), 1)}
          </div>
        </div>
      </section>

      {/* Hurry-Up Countdown */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Hurry-Up Countdown Timer</h2>
        <div className="space-y-4">
          {renderCheckbox("urgencyEnabled", "Enable Hurry-Up Timer", "Shows a countdown to the offer expiry.")}
          {renderCheckbox("showFireSymbol", "Show Fire Symbol 🔥", "If ON: \"🔥 Hurry! Offer Ends In\". If OFF: no fire symbol.")}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Urgency Text" value={form.urgencyText} onChange={(e) => updateField("urgencyText", e.target.value)} placeholder="Hurry! Offer Ends In" />
            <div>
              <label style={fieldLabelStyle}>Expiry Date</label>
              <input type="date" value={form.expiresDate} onChange={(e) => updateField("expiresDate", e.target.value)} style={inputBaseStyle} />
            </div>
            <div>
              <label style={fieldLabelStyle}>Expiry Time (optional)</label>
              <input type="time" value={form.expiresTime} onChange={(e) => updateField("expiresTime", e.target.value)} style={inputBaseStyle} />
            </div>
          </div>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            The countdown uses this absolute expiry. When it reaches 00:00:00:00 it stops and shows "Offer Ended".
          </p>
        </div>
      </section>

      {/* YouTube Video */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>YouTube Video</h2>
        <div className="space-y-4">
          {renderCheckbox("youtubeEnabled", "Enable YouTube Video Button", "Shows a \"Watch YouTube Video\" button on the product page.")}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="YouTube URL" value={form.youtubeUrl} onChange={(e) => updateField("youtubeUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            <Input label="Button Text" value={form.youtubeButtonText} onChange={(e) => updateField("youtubeButtonText", e.target.value)} placeholder="Watch YouTube Video" />
          </div>
          <div>
            {renderTextarea("Optional Video Title", form.youtubeVideoTitle, (v) => updateField("youtubeVideoTitle", v), 1)}
          </div>
        </div>
      </section>

      {/* WhatsApp */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>WhatsApp Message</h2>
        <div>
          {renderTextarea("Pre-filled WhatsApp enquiry message (used with WhatsApp payment option)", form.whatsappMessage, (v) => updateField("whatsappMessage", v), 2)}
        </div>
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

      {/* What's Included */}
      <ListEditor
        title="✅ Everything You Need — What's Included"
        description="Per-product list of included items. Reorder, edit, or disable any item."
        addLabel="Add Item"
        fields={[{ key: "text", label: "Included item", type: "textarea", placeholder: "✓ 870+ Flutter mobile app source codes" }]}
        items={features}
        onChange={setFeatures}
        defaults={{ text: "", enabled: true }}
      />

      {/* FAQs */}
      <ListEditor
        title="Frequently Asked Questions (per product)"
        description="Only enabled FAQs appear on the product page. If a product has none, the FAQ section is hidden."
        addLabel="Add FAQ"
        fields={[
          { key: "question", label: "Question", placeholder: "What will I receive after purchase?" },
          { key: "answer", label: "Answer", type: "textarea", placeholder: "..." },
        ]}
        items={faqs}
        onChange={setFaqs}
        defaults={{ question: "", answer: "", enabled: true }}
      />

      {/* Customer Reviews */}
      <ListEditor
        title="Customer Reviews (per product)"
        description="Only enabled reviews appear. The rating summary (e.g. 4.9 out of 5) is calculated automatically from enabled reviews."
        addLabel="Add Review"
        fields={[
          { key: "customerName", label: "Customer Name", placeholder: "Amit S." },
          { key: "company", label: "Company / Description", placeholder: "Business Owner" },
          { key: "rating", label: "Rating", type: "select", options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} Star${n > 1 ? "s" : ""}` })) },
          { key: "reviewText", label: "Review", type: "textarea", placeholder: "..." },
        ]}
        items={reviews}
        onChange={setReviews}
        defaults={{ customerName: "", company: "", rating: 5, reviewText: "", enabled: true }}
      />

      {/* Perfect For */}
      <ListEditor
        title="Perfect For (per product)"
        description="Audience/suited-for list, e.g. Flutter Developers, Freelancers, Students."
        addLabel="Add Audience"
        fields={[
          { key: "title", label: "Title", placeholder: "Flutter Developers" },
          { key: "description", label: "Description (optional)", placeholder: "..." },
        ]}
        items={perfectFor}
        onChange={setPerfectFor}
        defaults={{ title: "", description: "", enabled: true }}
      />

      {/* Visibility */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Visibility & Status</h2>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={form.status === "published"}
              onChange={(e) => updateField("status", e.target.checked ? "published" : "draft")}
              className="rounded w-4 h-4 mt-0.5"
              style={{ accentColor: "var(--accent-gold)" }}
            />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Published (visible on website)
            </span>
          </label>
          {renderCheckbox("featured", "Featured (show on homepage)", undefined)}
          {renderCheckbox("bestSeller", "Best Seller", undefined)}
          {form.productType === "FREE" && renderCheckbox("leadCaptureRequired", "Collect lead info (name, email, phone) before download", undefined)}
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
