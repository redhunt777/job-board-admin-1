"use client";

import React, { useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { CiFilter } from "react-icons/ci";
// import { CiLocationOn, CiMail, CiPhone } from "react-icons/ci";
// import { HiOutlineDownload, HiOutlineEye, HiOutlineBriefcase, HiOutlineAcademicCap } from "react-icons/hi";
// import { BsCurrencyDollar, BsCalendar3, BsPersonCheck } from "react-icons/bs";
// import Image from "next/image";
import {
  fetchJobApplicationsWithAccess,
  // updateApplicationStatusWithAccess,
  setFilters,
  // clearFilters,
  setSortBy,
  // selectCandidates,
  selectCandidatesLoading,
  selectCandidatesError,
  selectFilters,
  selectSortBy,
  selectUserContext,
  selectPaginatedCandidatesWithAccess,
  selectFilteredCandidatesWithAccess,
  CandidateWithApplication,
  // CandidateFilters,
  SortOption,
} from "@/store/features/candidatesSlice";
// import { MdErrorOutline } from "react-icons/md";
import { TiArrowSortedDown } from "react-icons/ti";

// Types for component props
interface CandidatesListProps {
  showHeader?: boolean;
  showFilters?: boolean;
  // showPagination?: boolean;
  showSorting?: boolean;
  maxItems?: number;
  className?: string;
  onCandidateClick?: (candidate: CandidateWithApplication) => void;
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Error component
function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-600 mb-4">
        <svg
          className="w-12 h-12 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "on hold":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
        status
      )}`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
    </span>
  );
}

// Removed old card component and table headers as we're using table format now

export default function CandidatesList({
  showHeader = true,
  showFilters = true,
  // showPagination = true,
  showSorting = true,
  maxItems,
  className = "",
  onCandidateClick,
}: CandidatesListProps) {
  const dispatch = useAppDispatch();

  // Redux selectors
  const paginatedCandidates = useAppSelector(
    selectPaginatedCandidatesWithAccess
  );
  const filteredCandidates = useAppSelector(selectFilteredCandidatesWithAccess);
  const loading = useAppSelector(selectCandidatesLoading);
  const error = useAppSelector(selectCandidatesError);
  const filters = useAppSelector(selectFilters);
  const sortBy = useAppSelector(selectSortBy);
  const userContext = useAppSelector(selectUserContext);

  // Local state
  // const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithApplication | null>(null);
  // const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Get candidates to display
  const candidatesToDisplay = useMemo(() => {
    if (maxItems && maxItems > 0) {
      return paginatedCandidates.slice(0, maxItems);
    }
    return paginatedCandidates;
  }, [paginatedCandidates, maxItems]);

  // Fetch candidates effect
  useEffect(() => {
    if (userContext && !loading && candidatesToDisplay.length === 0 && !error) {
      dispatch(
        fetchJobApplicationsWithAccess({
          filters,
          userContext: userContext,
        })
      );
    }
  }, [
    userContext,
    loading,
    candidatesToDisplay.length,
    error,
    dispatch,
    filters,
  ]);

  // Handlers
  // const handleStatusUpdate = async (applicationId: string, status: string) => {
  //   if (!userContext) {
  //     console.log("User context not available");
  //     return;
  //   }

  //   try {
  //     await dispatch(
  //       updateApplicationStatusWithAccess({
  //         applicationId,
  //         status,
  //         userContext,
  //       })
  //     ).unwrap();
  //   } catch (error) {
  //     console.error("Failed to update status:", error);
  //   }
  // };

  const handleViewCandidate = (candidate: CandidateWithApplication) => {
    // setSelectedCandidate(candidate);
    // setShowDetailsModal(true);
    if (onCandidateClick) {
      onCandidateClick(candidate);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateExperience = (candidate: CandidateWithApplication) => {
    if (!candidate.experience || candidate.experience.length === 0) return "0";

    let totalMonths = 0;
    candidate.experience.forEach((exp) => {
      if (exp.start_date) {
        const start = new Date(exp.start_date);
        const end = exp.end_date ? new Date(exp.end_date) : new Date();
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        totalMonths += months;
      }
    });

    const years = Math.floor(totalMonths / 12);
    return years.toString();
  };

  const generateShortId = (applicationId: string) => {
    // Generate a shorter, more readable ID from the application ID
    const hash = applicationId.split("-").pop() || applicationId;
    return hash.substring(0, 8);
  };

  // Handle error state
  if (error) {
    return (
      <div className={className}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  // Handle case where user context is not available
  if (!userContext) {
    return (
      <div className={className}>
        <ErrorMessage message="User context not available. Please log in again." />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                All Candidates
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all candidates and their applications with ease.
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Job
            </button>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      {(showSorting || showFilters) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Left side - Sorting */}
          <div className="flex items-center gap-4">
            {showSorting && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      dispatch(setSortBy(e.target.value as SortOption))
                    }
                    className="bg-blue-600 text-white text-sm border border-blue-600 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 hover:bg-blue-700 transition-colors cursor-pointer appearance-none"
                  >
                    <option
                      value="date_desc"
                      className="bg-white text-gray-900"
                    >
                      Newest First
                    </option>
                    <option value="date_asc" className="bg-white text-gray-900">
                      Oldest First
                    </option>
                    <option value="name_asc" className="bg-white text-gray-900">
                      Name (A-Z)
                    </option>
                    <option
                      value="name_desc"
                      className="bg-white text-gray-900"
                    >
                      Name (Z-A)
                    </option>
                  </select>
                  <TiArrowSortedDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      dispatch(
                        setFilters({
                          ...filters,
                          status: e.target.value as
                            | "accepted"
                            | "rejected"
                            | "pending"
                            | "on hold"
                            | "All",
                        })
                      )
                    }
                    className="bg-transparent text-gray-600 text-sm border border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="All">App. Status</option>
                    <option value="accepted">Accepted</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="on hold">On Hold</option>
                  </select>
                  <TiArrowSortedDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Right side - Additional filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <select className="bg-transparent text-gray-600 text-sm border border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition-colors cursor-pointer appearance-none">
                  <option>Years of Exp.</option>
                  <option>0-2</option>
                  <option>3-5</option>
                  <option>5+</option>
                </select>
                <TiArrowSortedDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filters.company ?? ""}
                  onChange={(e) =>
                    dispatch(
                      setFilters({ ...filters, company: e.target.value })
                    )
                  }
                  className="bg-transparent text-gray-600 text-sm border border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition-colors cursor-pointer appearance-none"
                >
                  <option value="">Company</option>
                  {Array.from(
                    new Set(
                      filteredCandidates
                        .map((c) => c.company_name)
                        .filter(Boolean)
                    )
                  ).map((company) => (
                    <option key={company} value={company ?? ""}>
                      {company}
                    </option>
                  ))}
                </select>
                <TiArrowSortedDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {showFilters && (
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300 text-sm text-gray-600 transition-colors">
                <CiFilter className="w-4 h-4" />
                All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Years of Exp.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App. Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidatesToDisplay.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-lg font-medium">
                          No candidates found
                        </p>
                        <p className="text-sm mt-1">
                          Try adjusting your filters to see more results.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  candidatesToDisplay.map((candidate) => (
                    <tr
                      key={candidate.application_id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {generateShortId(candidate.application_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(candidate.applied_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {candidate.candidate_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.job_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.company_name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.address || candidate.job_location || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateExperience(candidate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={candidate.application_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewCandidate(candidate)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
