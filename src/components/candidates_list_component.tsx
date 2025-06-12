"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { CiFilter } from "react-icons/ci";
import { HiDotsVertical } from "react-icons/hi";
import { FiTrash } from "react-icons/fi";
import { IoPersonCircleSharp } from "react-icons/io5";
import FiltersModal from "@/components/filters-modal";
import CandidatesDetailsOverlay from "@/components/candidates-details-overlay";
import {
  updateApplicationStatusWithAccess,
  setFilters,
  clearFilters,
  setSortBy,
  selectFilteredCandidatesWithAccess,
  selectPaginatedCandidatesWithAccess,
  selectCandidatesLoading,
  selectCandidatesError,
  selectFilters,
  selectSortBy,
  selectPagination,
  selectUserContext,
  selectHasFullAccess,
  selectIsTAOnly,
  setPagination,
  CandidateWithApplication,
  CandidateFilters,
  SortOption,
  fetchJobApplicationsWithAccess
} from "@/store/features/candidatesSlice";
import { MdErrorOutline } from "react-icons/md";
import { TiArrowSortedDown } from "react-icons/ti";


// Types for component props
interface CandidatesListProps {
  showHeader?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showSorting?: boolean;
  maxItems?: number;
  className?: string;
  onCandidateClick?: (candidate: CandidateWithApplication) => void;
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <MdErrorOutline className="w-12 h-12 mx-auto mb-2" />
        <p className="text-lg font-semibold">Something went wrong</p>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(
        status
      )}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CandidateCard({
  candidate,
  onView,
  onStatusUpdate,
  onClick,
  canUpdateStatus
}: { 
  candidate: CandidateWithApplication; 
  onView: (candidate: CandidateWithApplication) => void;
  onStatusUpdate: (applicationId: string, status: string) => void;
  onClick?: (candidate: CandidateWithApplication) => void;
  canUpdateStatus: boolean;
}) {

  const handleCardClick = () => {
    if (onClick) {
      onClick(candidate);
    }
  };

  // Format salary display using correct field names from slice
  const formatSalary = () => {
    if (candidate.current_ctc && candidate.expected_ctc) {
      return `Current: ₹${candidate.current_ctc}L | Expected: ₹${candidate.expected_ctc}L`;
    } else if (candidate.expected_ctc) {
      return `Expected: ₹${candidate.expected_ctc}L`;
    } else if (candidate.current_ctc) {
      return `Current: ₹${candidate.current_ctc}L`;
    }
    return "Not specified";
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!canUpdateStatus) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(candidate.application_id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    // Add your delete logic here
    console.log("Deleting candidate", candidate?.application_id);
    
    // You can add confirmation dialog here if needed
    const confirmDelete = window.confirm("Are you sure you want to delete this candidate?");
    if (confirmDelete) {
      // Perform actual delete operation
      console.log("Candidate deleted!");
    }
    
    // Close dropdown after action
    setIsOpen(false);
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm p-4 mb-4 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
          <IoPersonCircleSharp className="w-16 h-16 text-neutral-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {candidate.name}
              </h3>
              <p className="text-gray-600 text-sm truncate">
                {candidate.candidate_email}
              </p>
              <p className="text-gray-500 text-sm truncate">
                {candidate.address || "Location not specified"}
              </p>
              <div className="mt-1 hidden sm:block">
                <span className="text-sm text-gray-600">Applied for: </span>
                <span className="text-sm font-medium text-gray-900">
                  {candidate.job_title}
                </span>
                {candidate.company_name && (
                  <span className="text-sm text-gray-500">
                    {" "}
                    at {candidate.company_name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 hidden sm:block mt-1">{formatSalary()}</p>
              {candidate.notice_period && (
                <p className="text-xs text-gray-500 hidden sm:block">Notice: {candidate.notice_period}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 ml-2">
              <div className="relative inline-block text-left" ref={dropdownRef}>
                <button 
                  onClick={handleToggleDropdown}
                  className="text-gray-600 hover:text-gray-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="More options"
                >
                  <HiDotsVertical className="w-5 h-5" />
                </button>
                
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <ul className="py-1 text-sm text-gray-700">
                      <li>
                        <button
                          onClick={handleDelete}
                          className="block px-4 py-2 w-full text-left hover:bg-gray-100 hover:text-red-600 transition-colors duration-150"
                        >
                          <FiTrash className="inline mr-2" />
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Status update dropdown - only show if user has permission */}
              {canUpdateStatus && (
                <select
                  value={candidate.application_status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className="text-xs border rounded px-2 py-1 min-w-20 disabled:opacity-50"
                  onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with select
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <StatusBadge status={candidate.application_status} />
        <span className="text-gray-400">•</span>
        <span className="text-sm text-gray-500">
          Applied {new Date(candidate.applied_date).toLocaleDateString()}
        </span>
      </div>
      
      {/* view details button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking view button
            onView(candidate);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// Pagination component
function Pagination() {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(selectPagination);
  const filteredCandidates = useAppSelector(selectFilteredCandidatesWithAccess);

  // Early return if no data
  if (
    !filteredCandidates ||
    !Array.isArray(filteredCandidates) ||
    !pagination
  ) {
    return null;
  }

  // Update total pages when filtered candidates change
  useEffect(() => {
    if (filteredCandidates.length >= 0) {
      // Allow for 0 length
      const totalPages = Math.max(
        1,
        Math.ceil(filteredCandidates.length / pagination.candidatesPerPage)
      );
      dispatch(
        setPagination({
          totalCandidates: filteredCandidates.length,
          totalPages,
          currentPage: Math.min(pagination.currentPage, totalPages),
        })
      );
    }
  }, [
    filteredCandidates.length,
    pagination.candidatesPerPage,
    dispatch,
    pagination.currentPage,
  ]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      dispatch(setPagination({ currentPage: page }));
    }
  };

  if (pagination.totalPages <= 1) return null;

  const startRecord = Math.min(
    (pagination.currentPage - 1) * pagination.candidatesPerPage + 1,
    pagination.totalCandidates
  );
  const endRecord = Math.min(
    pagination.currentPage * pagination.candidatesPerPage,
    pagination.totalCandidates
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
      <div className="flex items-center text-sm text-gray-700">
        Showing {startRecord} to {endRecord} of {pagination.totalCandidates}{" "}
        results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 border rounded text-sm ${
                pagination.currentPage === pageNum
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

const tableHeaders = [
  {
    label: <input type="checkbox" className="rounded" />,
    className: "px-4 py-3 text-left",
  },
  { label: "ID", className: "p-3 text-left font-semibold text-gray-700" },
  {
    label: "Applied Date",
    className: "p-3 text-left font-semibold text-gray-700",
  },
  {
    label: "Candidate Name",
    className: "p-3 text-left font-semibold text-gray-700",
  },
  { label: "Email", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "Location", className: "p-3 text-left font-semibold text-gray-700" },
  {
    label: "Experience Req.",
    className: "p-3 text-left font-semibold text-gray-700",
  },
  { label: "Status", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "", className: "p-3 text-left font-semibold text-gray-700" },
];

export default function CandidatesList({
  showHeader = true,
  showFilters = true,
  showPagination = true,
  showSorting = true,
  maxItems,
  className = "",
  onCandidateClick,
}: CandidatesListProps) {
  const dispatch = useAppDispatch();
  
  // Redux selectors - using the new access-controlled selectors
  const paginatedCandidates = useAppSelector(selectPaginatedCandidatesWithAccess);
  const filteredCandidates = useAppSelector(selectFilteredCandidatesWithAccess);
  const loading = useAppSelector(selectCandidatesLoading);
  const error = useAppSelector(selectCandidatesError);
  const filters = useAppSelector(selectFilters);
  const sortBy = useAppSelector(selectSortBy);
  const userContext = useAppSelector(selectUserContext);
  const hasFullAccess = useAppSelector(selectHasFullAccess);
  const isTAOnly = useAppSelector(selectIsTAOnly);
  
  // Local state
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [candidatesDetailsOverlay, setCandidatesDetailsOverlay] = useState<{
    candidate: CandidateWithApplication | null;
    show: boolean;
  }>({
    candidate: null,
    show: false,
  });

  // Temporary filter states for modal
  const [tempFilters, setTempFilters] = useState<CandidateFilters>(filters);
  const [tempSortBy, setTempSortBy] = useState<SortOption>(sortBy);


  // Update temp filters when actual filters change
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  useEffect(() => {
    setTempSortBy(sortBy);
  }, [sortBy]);

  // Get candidates to display (with maxItems limit if specified)
  const candidatesToDisplay = useMemo(() => {
    if (maxItems && maxItems > 0) {
      return paginatedCandidates.slice(0, maxItems);
    }
    return paginatedCandidates;
  }, [paginatedCandidates, maxItems]);

  useEffect(() => {
    console.log("Fetching candidates with access");
    if (userContext && !loading && candidatesToDisplay.length === 0 && !error) {
      dispatch(fetchJobApplicationsWithAccess({
        filters: tempFilters,
        userContext: userContext
      }));
    }
}, []);

  // Get unique filter options from candidates
  const filterOptions = useMemo(() => {
    const companies = Array.from(
      new Set(
        filteredCandidates
          .map((c) => c.company_name)
          .filter((value): value is string => Boolean(value))
      )
    );
    const locations = Array.from(
      new Set([
        ...filteredCandidates
          .map((c) => c.address)
          .filter((value): value is string => Boolean(value)),
        ...filteredCandidates
          .map((c) => c.job_location)
          .filter((value): value is string => Boolean(value)),
      ])
    );
    const jobTitles = Array.from(
      new Set(
        filteredCandidates
          .map((c) => c.job_title)
          .filter((value): value is string => Boolean(value))
      )
    );

    return [
      {
        id: "status",
        label: "Application Status",
        type: "radio" as const,
        options: ["All", "pending", "accepted", "rejected"],
        selected: [tempFilters.status],
        onChange: (value: string) =>
          setTempFilters({
            ...tempFilters,
            status: value as CandidateFilters["status"],
          }),
      },
      {
        id: "company",
        label: "Company",
        type: "checkbox" as const,
        options: companies,
        selected: tempFilters.company ? [tempFilters.company] : [],
        onChange: (value: string) =>
          setTempFilters({ ...tempFilters, company: value }),
      },
      {
        id: "location",
        label: "Location",
        type: "checkbox" as const,
        options: locations,
        selected: tempFilters.location ? [tempFilters.location] : [],
        onChange: (value: string) =>
          setTempFilters({ ...tempFilters, location: value }),
      },
      {
        id: "jobTitle",
        label: "Job Title",
        type: "checkbox" as const,
        options: jobTitles,
        selected: tempFilters.jobTitle ? [tempFilters.jobTitle] : [],
        onChange: (value: string) =>
          setTempFilters({ ...tempFilters, jobTitle: value }),
      },
      {
        id: "experienceRange",
        label: "Experience Range",
        type: "radio" as const,
        options: ["0-2", "3-5", "6-10", "10+"],
        selected: tempFilters.experienceRange
          ? [tempFilters.experienceRange]
          : [],
        onChange: (value: string) =>
          setTempFilters({ ...tempFilters, experienceRange: value }),
      },
    ];
  }, [filteredCandidates, tempFilters]);

  // Handlers
  const handleStatusUpdate = async (applicationId: string, status: string) => {
    if (!userContext) {
      console.log("User context not available");
      return;
    }

    try {
      await dispatch(updateApplicationStatusWithAccess({ 
        applicationId, 
        status, 
        userContext 
      })).unwrap();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleViewCandidate = (candidate: CandidateWithApplication) => {
    setCandidatesDetailsOverlay({ candidate, show: true });
  };

  const applyFilters = () => {
    dispatch(setFilters(tempFilters));
    dispatch(setSortBy(tempSortBy));
    setShowFiltersModal(false);
  };

  const resetTempFilters = () => {
    setTempFilters(filters);
    setTempSortBy(sortBy);
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
    const initialFilters: CandidateFilters = {
      status: "All",
      location: "",
      jobTitle: "",
      company: "",
      experienceRange: "",
      salaryMin: null,
      salaryMax: null,
      skills: "",
      dateFrom: "",
      dateTo: "",
      gender: "",
      disability: null,
      noticePreriod: "",
    };
    setTempFilters(initialFilters);
    setTempSortBy("date_desc");
  };

  // Determine if user can update status (admin, hr, or ta with access)
  const canUpdateStatus = Boolean(hasFullAccess || (isTAOnly && userContext?.roles.includes('ta')));

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
          <h1 className="text-2xl font-semibold text-[#151515]">
            All Candidates
          </h1>
          <p className="text-sm text-[#606167] mt-2">
            Manage all candidates and their applications with ease.
          </p>
        </div>
      )}

      {/* Controls */}
      {(showSorting || showFilters) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            {showSorting && (
              <>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => dispatch(setSortBy(e.target.value as SortOption))}
                    className="
                      w-full min-w-[150px] 
                      bg-[#1E5CDC] text-white text-sm
                      border border-gray-300 rounded-full
                      px-4 py-2 pr-10
                      focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
                      hover:bg-[#1a52c7] transition-colors duration-200
                      cursor-pointer appearance-none
                    "
                    aria-label="Sort options"
                  >
                    <option value="date_desc" className="bg-white text-gray-900">Newest First</option>
                    <option value="date_asc" className="bg-white text-gray-900">Oldest First</option>
                    <option value="name_asc" className="bg-white text-gray-900">Name A-Z</option>
                    <option value="name_desc" className="bg-white text-gray-900">Name Z-A</option>
                    <option value="salary_desc" className="bg-white text-gray-900">Highest Salary</option>
                    <option value="salary_asc" className="bg-white text-gray-900">Lowest Salary</option>
                  </select>
                  
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <TiArrowSortedDown className="text-white text-lg" />
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => console.log("changed")}
                    className="
                      w-full min-w-[130px] 
                      bg-transparent text-neutral-500 text-sm
                      border border-neutral-500 rounded-full
                      px-4 py-2
                      focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent
                      transition-colors duration-200
                      cursor-pointer appearance-none
                    "
                    aria-label="Sort options"
                  >
                    <option value="">App. Status</option>
                    <option value="accepted" className="bg-white text-gray-900">Accepted</option>
                    <option value="pending" className="bg-white text-gray-900">Pending</option>
                    <option value="rejected" className="bg-white text-gray-900">Rejected</option>
                  </select>
                  
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <TiArrowSortedDown className="text-neutral-500 text-lg" />
                  </div>
                </div>
              </>
            )}
            </div>
            <div className="flex items-center justify-center gap-2">
            <div className="border-r border-neutral-400 pr-2 flex gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => console.log("changed")}
                  className="
                    w-full min-w-[130px] 
                    bg-transparent text-neutral-500 text-sm
                    border border-neutral-500 rounded-full
                    px-4 py-2
                    focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent
                    transition-colors duration-200
                    cursor-pointer appearance-none
                  "
                  aria-label="Sort options"
                >
                  <option value="">Years of Exp.</option>
                  <option value="accepted" className="bg-white text-gray-900">0-2</option>
                  <option value="pending" className="bg-white text-gray-900">3-5</option>
                  <option value="rejected" className="bg-white text-gray-900">5+</option>
                </select>
                
                {/* Custom dropdown arrow */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <TiArrowSortedDown className="text-neutral-500 text-lg" />
                </div>
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => console.log("changed")}
                  className="
                    w-full min-w-[130px] 
                    bg-transparent text-neutral-500 text-sm
                    border border-neutral-500 rounded-full
                    px-4 py-2
                    focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent
                    transition-colors duration-200
                    cursor-pointer appearance-none
                  "
                  aria-label="Sort options"
                > 
                  <option value="">Company</option>
                  <option value="accepted" className="bg-white text-gray-900">Facebook</option>
                  <option value="pending" className="bg-white text-gray-900">Microsoft</option>
                  <option value="rejected" className="bg-white text-gray-900">Others</option>
                </select>
                
                {/* Custom dropdown arrow */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <TiArrowSortedDown className="text-neutral-500 text-lg" />
                </div>
              </div>
            </div>
            {showFilters && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-neutral-200 hover:bg-gray-50 rounded-full border border-gray-300 font-normal text-sm text-neutral-500 cursor-pointer transition-colors"
                onClick={() => setShowFiltersModal(true)}
              >
                <CiFilter className="w-5 h-5" />
                <span>All Filters</span>
              </button>
            )}
            </div>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Filters Modal */}
      {showFilters && (
        <FiltersModal
          show={showFiltersModal}
          onClose={() => {
            resetTempFilters();
            setShowFiltersModal(false);
          }}
          sortBy={tempSortBy}
          setSortBy={(value: string) => setTempSortBy(value as SortOption)}
          filterOptions={filterOptions}
          onClearAll={clearAllFilters}
          onApply={applyFilters}
        />
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {candidatesToDisplay.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No candidates found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              candidatesToDisplay.map((candidate) => (
                <CandidateCard
                  key={candidate.application_id}
                  candidate={candidate}
                  onView={handleViewCandidate}
                  onStatusUpdate={handleStatusUpdate}
                  onClick={onCandidateClick}
                  canUpdateStatus={canUpdateStatus}
                />
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F0F1F1]">
                <tr>
                  {tableHeaders.map((header, idx) => (
                    <th key={idx} className={header.className}>
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {candidatesToDisplay.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableHeaders.length}
                      className="px-4 py-12 text-center"
                    >
                      <p className="text-gray-500 text-lg">
                        No candidates found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try adjusting your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  candidatesToDisplay.map((candidate) => (
                    <tr 
                      key={candidate.application_id} 
                      className={`hover:bg-gray-50 ${onCandidateClick ? 'cursor-pointer' : ''}`}
                      onClick={() => onCandidateClick && onCandidateClick(candidate)}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="rounded accent-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-4 text-gray-900">
                        {candidate.application_id}
                      </td>
                      <td className="px-3 py-4 text-gray-900">
                        {new Date(candidate.applied_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 text-gray-900">
                        {candidate.name}
                      </td>
                      <td className="px-3 py-4 text-gray-900">
                        {candidate.candidate_email}
                      </td>
                      <td className="px-3 py-4 text-gray-900">
                        {candidate.job_location || "—"}
                      </td>
                      <td className="px-3 py-4 text-gray-900">
                        {candidate.min_experience_needed &&
                        candidate.max_experience_needed
                          ? `${candidate.min_experience_needed}-${candidate.max_experience_needed} years`
                          : "—"}
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge status={candidate.application_status} />
                      </td>
                      <td className="px-3 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCandidate(candidate);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {showPagination && !maxItems && <Pagination />}
          </div>
        </>
      )}

      {/* Candidate Details Overlay */}
      {candidatesDetailsOverlay.show && candidatesDetailsOverlay.candidate && (
        <CandidatesDetailsOverlay
          candidatesDetailsOverlay={candidatesDetailsOverlay}
          setCandidatesDetailsOverlay={setCandidatesDetailsOverlay}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

