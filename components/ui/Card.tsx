import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 overflow-hidden",
        hover && "transition-all duration-200 hover:shadow-lg hover:border-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
}
