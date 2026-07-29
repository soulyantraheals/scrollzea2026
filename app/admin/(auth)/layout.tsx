"use client";

import { SessionProvider } from "next-auth/react";

// Minimal layout for admin auth pages — NO sidebar, NO admin chrome
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
