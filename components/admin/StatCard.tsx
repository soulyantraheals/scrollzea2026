import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn("rounded-xl p-6", className)}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-gold)",
        color: "var(--text-primary)",
      }}
    >
      <div
        className="p-2 rounded-lg inline-block"
        style={{ backgroundColor: "var(--accent-glow)" }}
      >
        <Icon className="h-5 w-5" style={{ color: "var(--accent-gold)" }} />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      </div>
    </div>
  );
}
