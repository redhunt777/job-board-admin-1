"use client";

import { usePathname } from "next/navigation";
import LogoHeader from "@/components/logo-header";
import Sidebar from "@/components/sidebar";
import SearchComponent from "@/components/search-component";
import BottomNav from "@/components/bottom-nav";

interface LayoutWrapperProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}

export default function LayoutWrapper({ children, hideBottomNav = false }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/reset-password'].includes(pathname);

  return (
    <>
      {isAuthPage ? <LogoHeader /> : <Sidebar />}
      {!isAuthPage && <SearchComponent />}
      <main className="pb-32 md:pb-0">
        {children}
      </main>
      {!isAuthPage && !hideBottomNav && <BottomNav />}
    </>
  );
} 