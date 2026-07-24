"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  );
}
