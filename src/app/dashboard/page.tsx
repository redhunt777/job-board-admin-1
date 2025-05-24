'use client';

import { useContext } from "react";
import { SidebarContext } from "@/components/sidebar";
import { HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineBuildingOffice2, HiOutlineUserGroup } from "react-icons/hi2";

const stats = [
  {
    label: "Active Jobs",
    value: 117,
    icon: <HiOutlineBriefcase className="w-10 h-10 text-indigo-400 bg-indigo-100 rounded-xl p-2" />,
    change: "+8.5%",
    changeDesc: "Up from yesterday",
    changeColor: "text-emerald-500"
  },
  {
    label: "Application Received",
    value: 3567,
    icon: <HiOutlineDocumentText className="w-10 h-10 text-yellow-400 bg-yellow-100 rounded-xl p-2" />,
    change: "+1.5%",
    changeDesc: "Up from past week",
    changeColor: "text-emerald-500"
  },
  {
    label: "Client Companies",
    value: 78,
    icon: <HiOutlineBuildingOffice2 className="w-10 h-10 text-green-400 bg-green-100 rounded-xl p-2" />,
    change: "-3.4%",
    changeDesc: "Up from last month",
    changeColor: "text-rose-500"
  },
  {
    label: "Total Candidates",
    value: 1576,
    icon: <HiOutlineUserGroup className="w-10 h-10 text-orange-400 bg-orange-100 rounded-xl p-2" />,
    change: "+1.5%",
    changeDesc: "Up from past week",
    changeColor: "text-emerald-500"
  }
];

export default function DashboardPage() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("No sidebar context found");
  }
  const { collapsed } = context;

  return (
    <main
      className={`transition-all duration-300 min-h-screen pb-40 md:pb-0 px-3 ${
        collapsed ? "md:ml-0" : "md:ml-64"
      } md:pt-0 pt-4`}
    >
      <div className="max-w-7xl mx-auto px-2 md:px-8 pt-8">
        <h1 className="text-3xl font-semibold text-neutral-800 mb-4">Dashboard</h1>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow flex items-center gap-4 p-6 min-w-0"
            >
              <div>{stat.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-500 text-base font-medium mb-1">{stat.label}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={stat.changeColor}>{stat.change}</span>
                  <span className="text-gray-400">{stat.changeDesc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Applications Over Time Chart */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Applications Over Time</h2>
            <div className="flex gap-2 flex-wrap">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">Show by Company <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 9l6 6 6-6"/></svg></button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">Show by Role <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 9l6 6 6-6"/></svg></button>
            </div>
          </div>
          {/* Chart Placeholder */}
          <div className="h-72 flex items-center justify-center">
            <span className="text-gray-400 text-lg">[Chart Placeholder]</span>
          </div>
        </div>
      </div>
    </main>
  );
}
