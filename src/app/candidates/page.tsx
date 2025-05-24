"use client";

import { useContext } from "react";
import { SidebarContext } from "@/components/sidebar";
import { FaCaretDown } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { HiOutlineArrowCircleLeft, HiDotsVertical } from "react-icons/hi";
import Link from "next/link";

const candidates = [
  {
    id: "25622626",
    appliedDate: "Apr.28, 2025",
    name: "Rupal Gupta",
    email: "rupalgupta@gmail.com",
    job: "UI/UX Designer",
    company: "mix3D.ai",
    location: "Pune",
    experience: 4,
    currentctc: 10,
    expectedctc: 12,
    status: "Accepted",
  },
  {
    id: "25622626",
    appliedDate: "Apr.28, 2025",
    name: "Rupal Gupta",
    email: "rupalgupta@gmail.com",
    job: "UI/UX Designer",
    company: "mix3D.ai",
    location: "Pune",
    experience: 4,
    currentctc: 10,
    expectedctc: 12,
    status: "Rejected",
  },
  {
    id: "25622626",
    appliedDate: "Apr.28, 2025",
    name: "Rupal Gupta",
    email: "rupalgupta@gmail.com",
    job: "UI/UX Designer",
    company: "mix3D.ai",
    location: "Pune",
    experience: 4,
    currentctc: 10,
    expectedctc: 12,
    status: "On Hold",
  },
  {
    id: "25622626",
    appliedDate: "Apr.28, 2025",
    name: "Rupal Gupta",
    email: "rupalgupta@gmail.com",
    job: "UI/UX Designer",
    company: "mix3D.ai",
    location: "Pune",
    experience: 4,
    currentctc: 10,
    expectedctc: 12,
    status: "Accepted",
  },
];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Accepted"
      ? "bg-green-100 text-green-700"
      : status === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";
  return (
    <span className={`px-4 py-2 rounded-full text-base font-semibold ${color}`}>
      {status}
    </span>
  );
}

function CandidateCard({ candidate }: { candidate: (typeof candidates)[0] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex flex-col gap-4 relative">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 19.125a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21c-2.676 0-5.216-.584-7.499-1.875z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-neutral-900 leading-tight">
                {candidate.name}
              </div>
              <div className="text-lg text-neutral-500">{candidate.email}</div>
              <div className="text-lg text-neutral-500">
                {candidate.location}
              </div>
            </div>
            <button className="text-neutral-400 hover:text-neutral-600 p-2">
              <HiDotsVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-2">
        <StatusBadge status={candidate.status} />
        <span className="text-neutral-500 text-lg">&bull;</span>
        <span className="text-neutral-500 text-lg">
          Applied on {candidate.appliedDate}
        </span>
      </div>
      <div className="flex justify-end mt-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl text-lg">
          View
        </button>
      </div>
    </div>
  );
}

const filterOptions = [
  {
    label: (
      <>
        Sort by <span className="underline ml-1">Name(A-Z)</span>
      </>
    ),
    icon: <FaCaretDown className="ml-2 w-4 h-4" />,
    key: "sort",
  },
  {
    label: "App. Status",
    icon: <FaCaretDown className="ml-2 w-4 h-4" />,
    key: "status",
  },
  {
    label: "Years of Exp.",
    icon: <FaCaretDown className="ml-2 w-4 h-4" />,
    key: "exp",
  },
  {
    label: "Active Jobs",
    icon: <FaCaretDown className="ml-2 w-4 h-4" />,
    key: "jobs",
  },
  {
    label: "Company",
    icon: <FaCaretDown className="ml-2 w-4 h-4" />,
    key: "company",
  },
];

const allFiltersButton = {
  label: (
    <>
      <span>All Filters</span>
      <CiFilter className="ml-2 w-4 h-4" />
    </>
  ),
  key: "all-filters",
  className: "ml-auto",
};

const tableHeaders = [
  {
    label: <input type="checkbox" />,
    className:
      "px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase",
  },
  {
    label: "ID",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "Applied Date",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "Candidate Name",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "Job",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "Company",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "Location",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "Years of Exp.",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "Current CTC",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "Expected CTC",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  {
    label: "App. Status",
    className: "p-3 text-left font-bold text-neutral-700",
  },
  { label: "", className: "p-3" },
];

export default function Candidates() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("No sidebar context found");
  const { collapsed } = context;

  return (
    <div
      className={`transition-all duration-300 h-full px-3 md:px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } pt-4`}
    >
      <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
        {/* Back Navigation and Title */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-semibold text-lg"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-neutral-300 font-light">/</span>
          <span className="text-lg font-bold text-neutral-900">Candidates</span>
        </div>
        {/* Filters for Mobile */}
        <div className="flex flex-row gap-2 mb-6 items-center w-full md:hidden">
          {/* Sort by */}
          <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-1 text-xs rounded-full flex items-center gap-2">
            <span>Sort by</span>
            <FaCaretDown className="w-4 h-4" />
          </button>
          {/* App. Status */}
          <button className="bg-black bg-opacity-90 text-white font-semibold px-6 py-2 rounded-full flex items-center border border-neutral-700 gap-2">
            <span>App. Status</span>
            <FaCaretDown className="w-4 h-4" />
          </button>
          {/* All Filters */}
          <button className="bg-neutral-100 text-neutral-700 font-semibold px-6 py-2 rounded-full flex items-center gap-2">
            <CiFilter className="w-5 h-5" />
            <span>All Filters</span>
          </button>
        </div>
        {/* Filters for Desktop */}
        <div className="hidden md:flex flex-row gap-2 mb-6 items-center w-full">
          {filterOptions.map((filter) => (
            <button
              key={filter.key}
              className="border px-4 py-2 rounded-full bg-white text-neutral-700 text-sm font-medium flex items-center"
            >
              {filter.label}
              {filter.icon}
            </button>
          ))}
          <button
            key={allFiltersButton.key}
            className="border px-4 py-2 rounded-full bg-white text-neutral-700 text-sm font-medium flex items-center ml-auto"
          >
            {allFiltersButton.label}
          </button>
        </div>
        {/* Mobile Cards */}
        <div className="block md:hidden">
          {candidates.map((c, i) => (
            <CandidateCard key={i} candidate={c} />
          ))}
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-sm relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-100 border border-neutral-200">
              <tr>
                {tableHeaders.map((header, idx) => (
                  <th
                    key={idx}
                    className={`${header.className} ${
                      idx === 0
                        ? "sticky left-0 bg-neutral-100 z-30"
                        : idx === 1
                        ? "sticky left-11 bg-neutral-100 z-30"
                        : idx === tableHeaders.length - 2
                        ? "sticky right-31 bg-neutral-100 z-30 min-w-32"
                        : idx === tableHeaders.length - 1
                        ? "sticky right-0 bg-neutral-100 z-30 min-w-31"
                        : "min-w-30 px-2"
                    }`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {candidates.map((c, i) => (
                <tr key={i}>
                  <td className="px-4 py-4 sticky left-0 bg-white z-20">
                    <input type="checkbox" />
                  </td>
                  <td className="px-2 py-4 text-neutral-700 sticky left-11 bg-white z-20">
                    {c.id}
                  </td>
                  <td className="px-2 py-4 text-neutral-700 min-w-32">
                    {c.appliedDate}
                  </td>
                  <td className="px-2 py-4 text-neutral-700 min-w-40">
                    {c.name}
                  </td>
                  <td className="px-2 py-4 text-neutral-700 min-w-36">
                    {c.job}
                  </td>
                  <td className="px-2 py-4 text-neutral-700 min-w-30">
                    {c.company}
                  </td>
                  <td className="px-2 py-4 text-neutral-700 min-w-28">
                    {c.location}
                  </td>
                  <td className="px-2 py-4 text-neutral-700 min-w-32">
                    {c.experience}
                  </td>
                  <td className="px-2 py-4 text-neutral-700 min-w-32">
                    {c.currentctc}
                  </td>
                  <td className="px-2 py-4 text-neutral-700 min-w-36">
                    {c.expectedctc}
                  </td>
                  <td className="px-2 py-4 sticky right-31 bg-white z-20">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-3 py-4 sticky right-0 bg-white z-20">
                    <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
