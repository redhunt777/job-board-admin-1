"use client";

import { usePathname } from "next/navigation";
import LogoHeader from "@/components/logo-header";
import Sidebar from "@/components/sidebar";
import SearchComponent from "@/components/search-component";
import BottomNav from "@/components/bottom-nav";
import { Suspense } from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}

export default function LayoutWrapper({ children, hideBottomNav = false }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/reset-password', `/forgot-password`].includes(pathname);

  return (
    <>
      {isAuthPage ? (
        <LogoHeader />
      ) : (
        <Suspense fallback={<div className="w-64 h-screen bg-neutral-100 animate-pulse" />}>
          <Sidebar />
        </Suspense>
      )}
      {!isAuthPage && (
        <Suspense fallback={<div className="h-16 bg-neutral-100 animate-pulse" />}>
          <SearchComponent />
        </Suspense>
      )}
      <main className="pb-32 md:pb-0">
        <Suspense fallback={<div className="min-h-screen bg-neutral-100 animate-pulse" />}>
          {children}
        </Suspense>
      </main>
      {!isAuthPage && !hideBottomNav && (
        <Suspense fallback={<div className="h-16 bg-neutral-100 animate-pulse fixed bottom-0 w-full" />}>
          <BottomNav />
        </Suspense>
      )}
    </>
  );
} 