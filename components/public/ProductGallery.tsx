"use client";

import { useState } from "react";

interface GalleryImage {
  imageUrl: string;
  isPrimary: number;
}

export function ProductGallery({ images, alt }: { images: GalleryImage[]; alt: string }) {
  const [active, setActive] = useState(0);
  const ordered = images.length ? [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)) : [];
  const activeImg = ordered[active];

  return (
    <div>
      <div
        className="aspect-square rounded-2xl overflow-hidden relative"
        style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-gold)" }}
      >
        {activeImg ? (
          <img src={activeImg.imageUrl} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">📦</div>
        )}
      </div>
      {ordered.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {ordered.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="aspect-square rounded-lg overflow-hidden transition-all"
              style={{
                border: i === active ? "2px solid var(--accent-gold)" : "2px solid var(--border-gold)",
                opacity: i === active ? 1 : 0.6,
              }}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
