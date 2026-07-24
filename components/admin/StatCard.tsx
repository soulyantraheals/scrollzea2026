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
    <div className={cn("bg-white rounded-xl border border-gray-100 p-6", className)}>
      <div className="p-2 bg-indigo-50 rounded-lg inline-block">
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
