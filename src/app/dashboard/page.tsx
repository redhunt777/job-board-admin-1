"use client";

import { useAppSelector } from "@/store/hooks";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { TiDocumentDelete } from "react-icons/ti";
import { BsBriefcase } from "react-icons/bs";
import { FaCaretDown } from "react-icons/fa";
import { GoPeople } from "react-icons/go";

const stats = [
  {
    label: "Active Jobs",
    value: 117,
    icon: (
      <BsBriefcase className="w-15 h-15 text-indigo-400 bg-indigo-100 rounded-2xl p-3" />
    ),
    change: "+8.5%",
    changeDesc: "Up from yesterday",
    changeColor: "text-emerald-500",
  },
  {
    label: "Application Received",
    value: 3567,
    icon: (
      <TiDocumentDelete className="w-15 h-15 text-amber-700/60 bg-amber-100 rounded-2xl p-3" />
    ),
    change: "+1.5%",
    changeDesc: "Up from past week",
    changeColor: "text-emerald-500",
  },
  {
    label: "Client Companies",
    value: 78,
    icon: (
      <HiOutlineBuildingOffice2 className="w-15 h-15 text-green-400 bg-green-100 rounded-2xl p-3" />
    ),
    change: "-3.4%",
    changeDesc: "Up from last month",
    changeColor: "text-rose-500",
  },
  {
    label: "Total Candidates",
    value: 1576,
    icon: (
      <GoPeople className="w-15 h-15 text-orange-500 bg-red-200/80 rounded-2xl p-3" />
    ),
    change: "+1.5%",
    changeDesc: "Up from past week",
    changeColor: "text-emerald-500",
  },
];

export default function DashboardPage() {
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);

  return (
    <div
      className={`transition-all duration-300 min-h-full px-3 md:px-6 ${
        collapsed ? "md:ml-20" : "md:ml-60"
      } md:pt-0 pt-4`}
    >
      <div className="max-w-8xl mx-auto px-2 py-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-4">
          Dashboard
        </h1>
        {/* Stat Cards */}
        <div className="flex flex-wrap gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm flex flex-col justify-between p-4 min-w-3xs h-auto min-h-[11rem] sm:min-h-[11rem] flex-1"
            >
              {/* Top row: label, value, icon */}
              <div className="flex items-start sm:items-center justify-between w-full">
                <div className="flex-1">
                  <div className="text-neutral-500 text-sm font-medium mb-4">
                    {stat.label}
                  </div>
                  <div className="text-3xl lg:text-4xl font-semibold text-neutral-900">
                    {stat.value.toLocaleString()}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
              </div>
              {/* Change info at the bottom */}
              <div className="flex items-center gap-2 text-xs sm:text-sm mt-auto">
                <span
                  className={`${stat.changeColor} font-semibold whitespace-nowrap`}
                >
                  {stat.change}
                </span>
                <span className="text-neutral-400">
                  {stat.changeDesc}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Applications Over Time Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-xl font-semibold text-neutral-900">
              Applications Over Time
            </h2>
            <div className="flex gap-2 flex-wrap">
              <button className="bg-neutral-100 text-neutral-500 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                Show by Company <FaCaretDown className="w-4 h-4" />
              </button>
              <button className="bg-neutral-100 text-neutral-500 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                Show by Role <FaCaretDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Chart Placeholder */}
          <div className="h-72 flex items-center justify-center">
            <span className="text-neutral-400 text-lg">
              [Chart Placeholder]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
