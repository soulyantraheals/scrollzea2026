import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = req.nextUrl.pathname === "/admin/login";
  const isSetupRoute = req.nextUrl.pathname === "/api/setup";
  const isAuthenticated = !!req.auth;

  if (isSetupRoute || req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (isAdminRoute && !isAdminLogin && !isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isAdminLogin && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/setup"],
};
