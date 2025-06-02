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
      <BsBriefcase className="w-14 h-14 text-indigo-400 bg-indigo-100 rounded-xl p-3" />
    ),
    change: "+8.5%",
    changeDesc: "Up from yesterday",
    changeColor: "text-emerald-500",
  },
  {
    label: "Application Received",
    value: 3567,
    icon: (
      <TiDocumentDelete className="w-14 h-14 text-yellow-400 bg-yellow-100 rounded-xl p-3" />
    ),
    change: "+1.5%",
    changeDesc: "Up from past week",
    changeColor: "text-emerald-500",
  },
  {
    label: "Client Companies",
    value: 78,
    icon: (
      <HiOutlineBuildingOffice2 className="w-14 h-14 text-green-400 bg-green-100 rounded-xl p-3" />
    ),
    change: "-3.4%",
    changeDesc: "Up from last month",
    changeColor: "text-rose-500",
  },
  {
    label: "Total Candidates",
    value: 1576,
    icon: (
      <GoPeople className="w-14 h-14 text-orange-400 bg-orange-100 rounded-xl p-3" />
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
      className={`transition-all duration-300 min-h-full px-3 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}
    >
      <div className="max-w-8xl mx-auto px-2 py-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">Dashboard</h1>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm flex flex-col justify-between p-6 min-w-0 h-44"
            >
              {/* Top row: label, value, icon */}
              <div className="flex items-center justify-between w-full mb-6">
                <div>
                  <div className="text-neutral-500 text-base font-medium">
                    {stat.label}
                  </div>
                  <div className="text-4xl font-bold text-neutral-900">
                    {stat.value.toLocaleString()}
                  </div>
                </div>
                <div>{stat.icon}</div>
              </div>
              {/* Change info at the bottom */}
              <div className="flex items-center gap-2 text-sm mt-auto pt-2">
                <span className={stat.changeColor + " font-semibold"}>
                  {stat.change}
                </span>
                <span className="text-neutral-400 font-medium">
                  {stat.changeDesc}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Applications Over Time Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-2xl font-bold text-neutral-900">
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
