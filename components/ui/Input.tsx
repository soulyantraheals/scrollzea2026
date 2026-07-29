"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-transparent",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-gold)",
            color: "var(--text-primary)",
          }}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };
