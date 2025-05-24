"use client";
import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiHomeAlt } from "react-icons/bi";
import { BsBriefcase } from "react-icons/bs";
import { GoPeople, GoGear } from "react-icons/go";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { FiSidebar } from "react-icons/fi";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function Sidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("Sidebar must be used within a SidebarProvider");
  }
  const { collapsed, setCollapsed } = context;

  return (
    <aside
      className={`hidden md:flex fixed top-0 left-0 h-full z-50 transition-all duration-300 flex-col justify-between \
        ${collapsed ? "w-20" : "w-64"} \
        bg-linear-to-b from-[#1E3170] to-[#07123A] shadow-lg`}
    >
      <div>
        <div className="px-4 pt-6 pb-2 flex flex-col">
          <img
            src={collapsed ? "/logomark-white.svg" : "/wordmark-white.svg"}
            alt="Recrivio Logo"
            className="h-11 w-full object-contain"
          />
          <div className="flex justify-end mt-10 mr-1 -mb-2">
            <button
              onClick={() => setCollapsed((c: boolean) => !c)}
              className="cursor-pointer"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FiSidebar className="w-10 h-10 text-white p-2 rounded-lg hover:bg-blue-900" />
            </button>
          </div>
        </div>
        <nav className="mt-4 flex flex-col gap-2 px-2">
          <SidebarLink
            collapsed={collapsed}
            icon={<BiHomeAlt className="w-6 h-6" />}
            label="Dashboard"
            to="/dashboard"
          />
          <SidebarLink
            collapsed={collapsed}
            icon={<BsBriefcase className="w-6 h-6" />}
            label="Jobs"
            to="/jobs"
          />
          <SidebarLink
            collapsed={collapsed}
            icon={<GoPeople className="w-6 h-6" />}
            label="Candidates"
            to="/candidates"
          />
          <SidebarLink
            collapsed={collapsed}
            icon={<HiOutlineChatAlt2 className="w-6 h-6" />}
            label="Inbox"
            to="/inbox"
          />
        </nav>
      </div>
      <div className="mb-6 px-2">
        <SidebarLink
          collapsed={collapsed}
          icon={<GoGear className="w-6 h-6" />}
          label="Settings"
          to="/settings"
        />
      </div>
    </aside>
  );
}

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  collapsed: boolean;
}

function SidebarLink({ icon, label, to, collapsed }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <Link
      href={to}
      className={`flex items-center gap-4 px-4 py-3 rounded-lg text-white transition-colors duration-200 \
        ${collapsed ? "justify-center" : ""} \
        ${isActive ? "bg-blue-900" : "hover:bg-blue-900"}`}
    >
      {icon}
      {!collapsed && <span className="text-lg font-medium">{label}</span>}
    </Link>
  );
}
