import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-16 px-4", className)}>
      {icon && <div className="flex justify-center mb-4" style={{ color: "var(--text-dim)" }}>{icon}</div>}
      <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {description && <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
