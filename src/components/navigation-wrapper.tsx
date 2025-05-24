'use client';

import { usePathname } from "next/navigation";
import LogoHeader from "./logo-header";
import Sidebar from "./sidebar";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/reset-password'].includes(pathname);

  return (
    <>
      {isAuthPage ? <LogoHeader /> : <Sidebar />}
      {children}
    </>
  );
} 