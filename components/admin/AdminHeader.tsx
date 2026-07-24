"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
