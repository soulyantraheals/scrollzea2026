"use client";

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ListFieldConfig {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface ListEditorProps {
  title: string;
  description?: string;
  fields: ListFieldConfig[];
  items: Record<string, any>[];
  onChange: (items: Record<string, any>[]) => void;
  defaults?: Record<string, any>;
  addLabel?: string;
  showEnabled?: boolean;
}

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-gold)",
  color: "var(--text-primary)",
  borderRadius: "8px",
  padding: "9px 14px",
  width: "100%",
  fontSize: "0.85rem",
  outline: "none",
};
const fieldLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "0.78rem",
  fontWeight: 500,
  marginBottom: "5px",
  display: "block",
};

export function ListEditor({
  title,
  description,
  fields,
  items,
  onChange,
  defaults = {},
  addLabel = "Add Item",
  showEnabled = true,
}: ListEditorProps) {
  const addItem = () => {
    const base: Record<string, any> = { ...defaults };
    for (const f of fields) {
      if (base[f.key] === undefined) {
        base[f.key] = f.type === "number" ? 0 : "";
      }
    }
    if (showEnabled && base.enabled === undefined) base.enabled = true;
    onChange([...items, base]);
  };

  const updateItem = (index: number, key: string, value: any) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const renderField = (field: ListFieldConfig, item: Record<string, any>, index: number) => {
    if (field.type === "textarea") {
      return (
        <div key={field.key} style={{ flex: "1 1 100%" }}>
          <label style={fieldLabelStyle}>{field.label}</label>
          <textarea
            value={item[field.key] || ""}
            onChange={(e) => updateItem(index, field.key, e.target.value)}
            rows={2}
            placeholder={field.placeholder}
            required={field.required}
            style={{ ...inputBaseStyle, resize: "vertical" }}
          />
        </div>
      );
    }
    if (field.type === "select") {
      return (
        <div key={field.key} style={{ flex: "1 1 30%" }}>
          <label style={fieldLabelStyle}>{field.label}</label>
          <select
            value={item[field.key] ?? ""}
            onChange={(e) => updateItem(index, field.key, e.target.value)}
            style={inputBaseStyle}
          >
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div key={field.key} style={{ flex: "1 1 30%" }}>
        <label style={fieldLabelStyle}>{field.label}</label>
        <input
          type={field.type === "number" ? "number" : "text"}
          value={item[field.key] ?? ""}
          onChange={(e) =>
            updateItem(
              index,
              field.key,
              field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value
            )
          }
          placeholder={field.placeholder}
          required={field.required}
          style={inputBaseStyle}
        />
      </div>
    );
  };

  return (
    <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)", borderRadius: "12px", padding: "24px" }}>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      </div>
      {description && (
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm py-4" style={{ color: "var(--text-dim)" }}>
          No items yet. Click "{addLabel}" to add one.
        </p>
      ) : (
        <div className="space-y-4 mt-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl p-4"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-gold)",
                opacity: item.enabled === false ? 0.55 : 1,
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    style={{ color: "var(--text-muted)" }}
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    style={{ color: "var(--text-muted)" }}
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                    #{index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {showEnabled && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.enabled !== false}
                        onChange={(e) => updateItem(index, "enabled", e.target.checked)}
                        className="rounded w-4 h-4"
                        style={{ accentColor: "var(--accent-gold)" }}
                      />
                      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Enabled
                      </span>
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded hover:bg-red-50"
                    style={{ color: "#EF4444" }}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {fields.map((f) => renderField(f, item, index))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
