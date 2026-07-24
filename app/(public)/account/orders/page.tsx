import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title="No orders yet"
        description="Your order history will appear here after your first purchase."
      />
    </div>
  );
}
