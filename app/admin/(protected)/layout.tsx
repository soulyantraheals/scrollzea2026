"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (cancelled) return;
        if (session?.user) {
          setAuthenticated(true);
          setAuthChecked(true);
        } else {
          // Not authenticated — redirect to login
          router.replace("/admin");
        }
      })
      .catch(() => {
        if (!cancelled) {
          router.replace("/admin");
        }
      });

    return () => { cancelled = true; };
  }, [router]);

  // Show nothing while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Not authenticated — render nothing (redirect will happen)
  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 transition-all duration-200">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </SessionProvider>
  );
}
