"use client";

import { useState } from "react";
import { Upload, X, Star } from "lucide-react";

interface ImageItem {
  url: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
}

export function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result.urls) {
        const newImages = result.urls.map((url: string) => ({
          url,
          isPrimary: images.length === 0,
        }));
        onImagesChange([...images, ...newImages]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (images[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onImagesChange(updated);
  };

  const setPrimary = (index: number) => {
    onImagesChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative group aspect-square rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--border-gold)", backgroundColor: "var(--bg-secondary)" }}
          >
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => setPrimary(i)}
                className="p-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: img.isPrimary ? "var(--accent-gold)" : "var(--bg-card)",
                  color: img.isPrimary ? "#fff" : "var(--text-primary)",
                }}
              >
                <Star className="h-4 w-4" fill={img.isPrimary ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => removeImage(i)}
                className="p-1.5 rounded-full bg-red-500 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {img.isPrimary && (
              <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--accent-gold)", color: "#fff" }}
              >
                Primary
              </span>
            )}
          </div>
        ))}
        <label
          className="aspect-square rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors"
          style={{
            borderColor: "var(--border-gold)",
            color: "var(--text-dim)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <Upload className="h-6 w-6" />
          <span className="text-xs">{uploading ? "Uploading..." : "Upload"}</span>
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <p className="text-xs" style={{ color: "var(--text-dim)" }}>First image is primary. Max 4MB per image.</p>
    </div>
  );
}
