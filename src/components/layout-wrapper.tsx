"use client";

import { usePathname } from "next/navigation";
import LogoHeader from "@/components/logo-header";
import Sidebar from "@/components/sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/reset-password'].includes(pathname);

  return (
    <>
      {isAuthPage ? <LogoHeader /> : <Sidebar />}
      {children}
    </>
  );
} 