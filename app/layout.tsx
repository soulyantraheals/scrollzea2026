import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scrollzea — Digital Products & Creative Digital Solutions",
  description: "Discover ready-to-use digital products, free resources, and custom digital solutions designed to make your digital journey simpler, smarter, and more creative.",
  openGraph: {
    title: "Scrollzea — Digital Products & Creative Digital Solutions",
    description: "Discover ready-to-use digital products, free resources, and custom digital solutions.",
    siteName: "Scrollzea",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
