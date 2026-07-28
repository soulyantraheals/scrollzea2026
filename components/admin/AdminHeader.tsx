"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 px-4 lg:px-8" style={{ backgroundColor: "#0D241D", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
      <div className="flex items-center justify-between h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg" style={{ color: "#B8C2BE" }}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors"
            style={{ color: "#B8C2BE" }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
