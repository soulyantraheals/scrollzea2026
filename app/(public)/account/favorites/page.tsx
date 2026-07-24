import { EmptyState } from "@/components/ui/EmptyState";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Favorites</h1>
      <EmptyState
        icon={<Heart className="h-12 w-12" />}
        title="No favorites yet"
        description="Sign in and save your favorite products for quick access."
      />
    </div>
  );
}
