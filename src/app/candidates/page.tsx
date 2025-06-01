"use client";

import { useContext, useEffect, useState } from "react";
import { SidebarContext } from "@/components/sidebar";
import { CiFilter } from "react-icons/ci";
import { HiOutlineArrowCircleLeft, HiDotsVertical } from "react-icons/hi";
import { IoPersonCircleSharp } from "react-icons/io5";
import Link from "next/link";
import FiltersModal from "@/components/filters-modal";
import { createClient } from "@/utils/supabase/client";
import CandidatesDetailsOverlay from "@/components/candidates-details-overlay";

type candidates = {
  id: string;
  appliedDate: string;
  name: string;
  email: string;
  job: string;
  company: string;
  location: string;
  experience: number;
  currentctc: number;
  expectedctc: number;
  status: string;
};

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Accepted"
      ? "bg-green-100 text-green-700"
      : status === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-medium ${color}`}>
      {status}
    </span>
  );
}

function CandidateCard({ candidate }: { candidate: candidates }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col gap-2 relative">
      <div className="flex items-start gap-2">
        <IoPersonCircleSharp className="w-16 h-16 text-neutral-500" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg md:text-2xl font-semibold text-neutral-900 leading-tight">
                {candidate.name}
              </div>
              <div className="text-neutral-500">{candidate.email}</div>
              <div className="text-neutral-500">{candidate.location}</div>
            </div>
            <button className="text-neutral-400 hover:text-neutral-600 p-2">
              <HiDotsVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <StatusBadge status={candidate.status} />
        <span className="text-neutral-500 text-xl">&bull;</span>
        <span className="text-neutral-500">
          Applied on {candidate.appliedDate}
        </span>
      </div>
      <div className="flex justify-end mt-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-lg">
          View
        </button>
      </div>
    </div>
  );
}

const tableHeaders = [
  {
    label: <input type="checkbox" />,
    className:
      "px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase",
  },
  {
    label: "ID",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "Applied Date",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "Candidate Name",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "Job",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "Company",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "Location",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "Years of Exp.",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "Current CTC",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "Expected CTC",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  {
    label: "App. Status",
    className: "p-3 text-left font-semibold text-neutral-700",
  },
  { label: "", className: "p-3" },
];

const jobOptions = [
  "All",
  "Frontend Developer",
  "UI/UX Designer",
  "Java Developer",
  "Financial Controller",
  "Graphic Designer",
];

const ctcOptions = [
  "All",
  "1-4 Lakhs",
  "4-7 Lakhs",
  "7-10 Lakhs",
  "10-13 Lakhs",
  "13-16 Lakhs",
  "16-19 Lakhs",
  "19-22 Lakhs",
] as const;

// type of component props
export default function Candidates() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("No sidebar context found");
  const { collapsed } = context;
  const [candidates, setCandidates] = useState<candidates[]>([]);
  const [ candidatesDetailsOverlay, setCandidatesDetailsOverlay ] = useState<{
    candidate: candidates | null;
    show: boolean;
  }>({
    candidate: null,
    show: false,
  });

  // Supabase client
  const supabase = createClient();
  // Fetch candidates data
  useEffect(() => {
    async function loadCandidates() {
    const { data, error } = await supabase
  .from("job_applications")
  .select(`
    application_id,
    applied_date,
    application_status,
    candidate_profiles (
      name,
      candidate_email,
      current_ctc,
      expected_ctc
    ),
    jobs (
      job_title,
      company_name,
      job_location,
      min_experience_needed,
      max_experience_needed
    )
  `)
  .order("applied_date", { ascending: false })
  .limit(50);
     
      if (error) {
        console.error("Error fetching candidates:", error);
      } else {
        console.log("Fetched candidates:", data);
        setCandidates(
          data?.map((item) => ({
            id: item.application_id,
            appliedDate: item.applied_date,
            name: item.candidate_profiles?.name ?? "Hello",
            email: item.candidate_profiles?.candidate_email ?? "",
            job: item.jobs?.job_title ?? "",
            company: item.jobs?.company_name ?? "",
            location: item.jobs?.job_location ?? "",
            experience:
              item.jobs?.min_experience_needed != null && item.jobs?.max_experience_needed != null
                ? (item.jobs.min_experience_needed + item.jobs.max_experience_needed) / 2
                : item.jobs?.min_experience_needed ?? item.jobs?.max_experience_needed ?? 0,
            currentctc: item.candidate_profiles?.current_ctc ?? 0,
            expectedctc: item.candidate_profiles?.expected_ctc ?? 0,
            status: item.application_status
              ? item.application_status.charAt(0).toUpperCase() + item.application_status.slice(1).toLowerCase()
              : "",
          })) || []
        );
      }
    }
    loadCandidates();
  }, []);

  // Filter state
  const [sortBy, setSortBy] = useState("az"); // az, za, recent
  const [statusFilter, setStatusFilter] = useState<string[]>(["All"]);
  const [expFilter, setExpFilter] = useState<string[]>(["All"]);
  const [jobFilter, setJobFilter] = useState<string[]>(["All"]);
  const [companyFilter, setCompanyFilter] = useState<string[]>(["All"]);
  const [locationFilter, setLocationFilter] = useState<string[]>(["All"]);
  const [currentCtcRange, setCurrentCtcRange] = useState<string[]>(["All"]);
  const [expectedCtcRange, setExpectedCtcRange] = useState<string[]>(["All"]);

  // Temporary filter states for modal
  const [tempSortBy, setTempSortBy] = useState(sortBy);
  const [tempStatusFilter, setTempStatusFilter] = useState(statusFilter);
  const [tempExpFilter, setTempExpFilter] = useState(expFilter);
  const [tempJobFilter, setTempJobFilter] = useState(jobFilter);
  const [tempCompanyFilter, setTempCompanyFilter] = useState(companyFilter);
  const [tempLocationFilter, setTempLocationFilter] = useState(locationFilter);
  const [tempCurrentCtcRange, setTempCurrentCtcRange] =
    useState(currentCtcRange);
  const [tempExpectedCtcRange, setTempExpectedCtcRange] =
    useState(expectedCtcRange);

  // Filter options
  const statusOptions = ["All", "Accepted", "Rejected", "Pending"];
  const expOptions = ["All", "1 - 3", "3 - 5", "5 - 7", "7 - 9", "9 - Above"];

  // Get unique companies and locations from candidates
  const companyOptions = [
    "All",
    ...Array.from(new Set(candidates.map((c) => c.company))),
  ];
  const locationOptions = [
    "All",
    ...Array.from(new Set(candidates.map((c) => c.location))),
  ];

  // Handlers for temporary filters
  const createFilterHandler = (
    currentFilter: string[],
    setFilter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    return (option: string) => {
      if (option === "All") {
        setFilter(["All"]);
      } else {
        let newFilter = currentFilter.filter((item) => item !== "All");
        if (currentFilter.includes(option)) {
          newFilter = newFilter.filter((item) => item !== option);
        } else {
          newFilter = [...newFilter, option];
        }
        if (newFilter.length === 0) newFilter = ["All"];
        setFilter(newFilter);
      }
    };
  };

  const handleTempStatusChange = createFilterHandler(
    tempStatusFilter,
    setTempStatusFilter
  );
  const handleTempExpChange = createFilterHandler(
    tempExpFilter,
    setTempExpFilter
  );
  const handleTempJobChange = createFilterHandler(
    tempJobFilter,
    setTempJobFilter
  );
  const handleTempCompanyChange = createFilterHandler(
    tempCompanyFilter,
    setTempCompanyFilter
  );
  const handleTempLocationChange = createFilterHandler(
    tempLocationFilter,
    setTempLocationFilter
  );
  const handleTempCurrentCtcChange = createFilterHandler(
    tempCurrentCtcRange,
    setTempCurrentCtcRange
  );
  const handleTempExpectedCtcChange = createFilterHandler(
    tempExpectedCtcRange,
    setTempExpectedCtcRange
  );

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setStatusFilter(tempStatusFilter);
    setExpFilter(tempExpFilter);
    setJobFilter(tempJobFilter);
    setCompanyFilter(tempCompanyFilter);
    setLocationFilter(tempLocationFilter);
    setCurrentCtcRange(tempCurrentCtcRange);
    setExpectedCtcRange(tempExpectedCtcRange);
    setShowFilters(false);
  };

  const resetTempFilters = () => {
    setTempSortBy(sortBy);
    setTempStatusFilter(statusFilter);
    setTempExpFilter(expFilter);
    setTempJobFilter(jobFilter);
    setTempCompanyFilter(companyFilter);
    setTempLocationFilter(locationFilter);
    setTempCurrentCtcRange(currentCtcRange);
    setTempExpectedCtcRange(expectedCtcRange);
  };

  const filterOptions = [
    {
      id: "status",
      label: "Application Status",
      type: "checkbox" as const,
      options: statusOptions,
      selected: tempStatusFilter,
      onChange: handleTempStatusChange,
    },
    {
      id: "experience",
      label: "Years of Experience",
      type: "checkbox" as const,
      options: expOptions,
      selected: tempExpFilter,
      onChange: handleTempExpChange,
    },
    {
      id: "jobs",
      label: "Active Jobs",
      type: "checkbox" as const,
      options: jobOptions,
      selected: tempJobFilter,
      onChange: handleTempJobChange,
    },
    {
      id: "company",
      label: "Hiring Companies",
      type: "checkbox" as const,
      options: companyOptions,
      selected: tempCompanyFilter,
      onChange: handleTempCompanyChange,
    },
    {
      id: "currentCtc",
      label: "Current CTC (per annum)",
      type: "checkbox" as const,
      options: ctcOptions,
      selected: tempCurrentCtcRange,
      onChange: handleTempCurrentCtcChange,
    },
    {
      id: "expectedCtc",
      label: "Expected CTC (per annum)",
      type: "checkbox" as const,
      options: ctcOptions,
      selected: tempExpectedCtcRange,
      onChange: handleTempExpectedCtcChange,
    },
    {
      id: "location",
      label: "Location",
      type: "checkbox" as const,
      options: locationOptions,
      selected: tempLocationFilter,
      onChange: handleTempLocationChange,
    },
  ];

  // Filtering logic
  let filteredCandidates = candidates.filter((c) => {
    // Status
    if (!statusFilter.includes("All") && !statusFilter.includes(c.status))
      return false;
    // Experience
    if (!expFilter.includes("All")) {
      let match = false;
      for (const exp of expFilter) {
        if (exp === "1 - 3" && c.experience >= 1 && c.experience <= 3)
          match = true;
        if (exp === "3 - 5" && c.experience > 3 && c.experience <= 5)
          match = true;
        if (exp === "5 - 7" && c.experience > 5 && c.experience <= 7)
          match = true;
        if (exp === "7 - 9" && c.experience > 7 && c.experience <= 9)
          match = true;
        if (exp === "9 - Above" && c.experience > 9) match = true;
      }
      if (!match) return false;
    }
    // Job
    if (!jobFilter.includes("All") && !jobFilter.includes(c.job)) return false;
    // Company
    if (!companyFilter.includes("All") && !companyFilter.includes(c.company))
      return false;
    // Location
    if (!locationFilter.includes("All") && !locationFilter.includes(c.location))
      return false;
    // Current CTC
    if (!currentCtcRange.includes("All")) {
      let match = false;
      for (const range of currentCtcRange) {
        if (range === "1-4 Lakhs" && c.currentctc >= 1 && c.currentctc < 4)
          match = true;
        if (range === "4-7 Lakhs" && c.currentctc >= 4 && c.currentctc < 7)
          match = true;
        if (range === "7-10 Lakhs" && c.currentctc >= 7 && c.currentctc < 10)
          match = true;
        if (range === "10-13 Lakhs" && c.currentctc >= 10 && c.currentctc < 13)
          match = true;
        if (range === "13-16 Lakhs" && c.currentctc >= 13 && c.currentctc < 16)
          match = true;
        if (range === "16-19 Lakhs" && c.currentctc >= 16 && c.currentctc < 19)
          match = true;
        if (range === "19-22 Lakhs" && c.currentctc >= 19 && c.currentctc < 22)
          match = true;
      }
      if (!match) return false;
    }
    // Expected CTC
    if (!expectedCtcRange.includes("All")) {
      let match = false;
      for (const range of expectedCtcRange) {
        if (range === "1-4 Lakhs" && c.expectedctc >= 1 && c.expectedctc < 4)
          match = true;
        if (range === "4-7 Lakhs" && c.expectedctc >= 4 && c.expectedctc < 7)
          match = true;
        if (range === "7-10 Lakhs" && c.expectedctc >= 7 && c.expectedctc < 10)
          match = true;
        if (
          range === "10-13 Lakhs" &&
          c.expectedctc >= 10 &&
          c.expectedctc < 13
        )
          match = true;
        if (
          range === "13-16 Lakhs" &&
          c.expectedctc >= 13 &&
          c.expectedctc < 16
        )
          match = true;
        if (
          range === "16-19 Lakhs" &&
          c.expectedctc >= 16 &&
          c.expectedctc < 19
        )
          match = true;
        if (
          range === "19-22 Lakhs" &&
          c.expectedctc >= 19 &&
          c.expectedctc < 22
        )
          match = true;
      }
      if (!match) return false;
    }
    return true;
  });

  // Sorting logic
  filteredCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === "az") return a.name.localeCompare(b.name);
    if (sortBy === "za") return b.name.localeCompare(a.name);
    if (sortBy === "recent")
      return (
        new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      );
    return 0;
  });

  // Modal state
  const [showFilters, setShowFilters] = useState(false);

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
          {/* Filters Modal Trigger */}
          <div className="mb-4 flex justify-end">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-300 font-semibold text-neutral-700 cursor-pointer"
              onClick={() => setShowFilters(true)}
            >
              <CiFilter className="w-5 h-5" />
              <span>All Filters</span>
            </button>
          </div>
          {/* Filters Modal */}
          <FiltersModal
            show={showFilters}
            onClose={() => {
              resetTempFilters();
              setShowFilters(false);
            }}
            sortBy={tempSortBy}
            setSortBy={setTempSortBy}
            filterOptions={filterOptions}
            onClearAll={() => {
              setTempSortBy("az");
              setTempStatusFilter(["All"]);
              setTempExpFilter(["All"]);
              setTempJobFilter(["All"]);
              setTempCompanyFilter(["All"]);
              setTempLocationFilter(["All"]);
              setTempCurrentCtcRange(["All"]);
              setTempExpectedCtcRange(["All"]);
            }}
            onApply={applyFilters}
          />
          {/* Mobile Cards */}
          <div className="block md:hidden">
            {filteredCandidates.map((c, i) => (
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
                {filteredCandidates.map((c, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4 sticky left-0 bg-white z-20">
                      <input
                        type="checkbox"
                        className="accent-green-600 w-5 h-5"
                      />
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
                      <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg"
                        onClick={() => setCandidatesDetailsOverlay({ candidate: c, show: true })}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Candidate Details Overlay */}
          {candidatesDetailsOverlay.show && candidatesDetailsOverlay.candidate && (
            <CandidatesDetailsOverlay
              candidatesDetailsOverlay={candidatesDetailsOverlay}
              setCandidatesDetailsOverlay={setCandidatesDetailsOverlay}
            />
          )}
        </div>
      </div>
  );
}
