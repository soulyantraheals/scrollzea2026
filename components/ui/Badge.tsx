import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "free" | "best-seller" | "featured" | "prebook";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    free: "bg-emerald-100 text-emerald-700",
    "best-seller": "bg-amber-100 text-amber-700",
    featured: "bg-indigo-100 text-indigo-700",
    prebook: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
