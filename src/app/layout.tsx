import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/sidebar";
import LayoutWrapper from "@/components/layout-wrapper";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Recrivio Admin",
  description: "Recrivio Admin",
  icons: {
    icon: [
      {
        url: "/logomark-blue.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/logomark-blue.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-neutral-50`}>
        <SidebarProvider>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Suspense>
        </SidebarProvider>
      </body>
    </html>
  );
}
