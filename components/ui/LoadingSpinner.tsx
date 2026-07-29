import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="h-8 w-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--border-gold)", borderTopColor: "var(--accent-gold)" }} />
    </div>
  );
}
