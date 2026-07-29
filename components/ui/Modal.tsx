"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn("rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto", className)}
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid var(--border-gold)" }}>
          {title && <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>}
          <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
