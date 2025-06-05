"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { CiFilter } from "react-icons/ci";
import { useRouter } from "next/navigation";
import { GoPlus } from "react-icons/go";
import { HiOutlineArrowCircleLeft, HiDotsVertical } from "react-icons/hi";
import { IoPersonCircleSharp } from "react-icons/io5";
import Link from "next/link";
import FiltersModal from "@/components/filters-modal";
import CandidatesDetailsOverlay from "@/components/candidates-details-overlay";
import {
  fetchJobApplications,
  updateApplicationStatus,
  setFilters,
  clearFilters,
  setSortBy,
  clearError,
  selectFilteredCandidates,
  selectPaginatedCandidates,
  selectCandidatesLoading,
  selectCandidatesError,
  selectFilters,
  selectSortBy,
  selectStats,
  selectPagination,
  setPagination,
  CandidateWithApplication,
  CandidateFilters,
  SortOption,
} from "@/store/features/candidatesSlice";

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Error component
function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-600 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-semibold">Something went wrong</p>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
      >
        Try Again
      </button>
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
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CandidateCard({ 
  candidate, 
  onView, 
  onStatusUpdate 
}: { 
  candidate: CandidateWithApplication; 
  onView: (candidate: CandidateWithApplication) => void;
  onStatusUpdate: (applicationId: string, status: string) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdating || newStatus === candidate.application_status) return;
    setIsUpdating(true);
    try {
      onStatusUpdate(candidate.application_id, newStatus);
    } finally {
      setIsUpdating(false);
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

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <IoPersonCircleSharp className="w-16 h-16 text-neutral-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{candidate.name}</h3>
              <p className="text-gray-600 text-sm truncate">{candidate.candidate_email}</p>
              <p className="text-gray-500 text-sm truncate">
                {candidate.address || candidate.job_location || "Location not specified"}
              </p>
              <div className="mt-1">
                <span className="text-sm text-gray-600">Applied for: </span>
                <span className="text-sm font-medium text-gray-900">{candidate.job_title}</span>
                {candidate.company_name && (
                  <span className="text-sm text-gray-500"> at {candidate.company_name}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatSalary()}</p>
              {candidate.notice_period && (
                <p className="text-xs text-gray-500">Notice: {candidate.notice_period}</p>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2 ml-2">
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <HiDotsVertical className="w-5 h-5" />
              </button>
              
              <select
                value={candidate.application_status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="text-xs border rounded px-2 py-1 min-w-20 disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
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
        {candidate.min_experience_needed && candidate.max_experience_needed && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {candidate.min_experience_needed}-{candidate.max_experience_needed} years req.
            </span>
          </>
        )}
      </div>
      
      <div className="flex justify-end mt-4">
        <button 
          onClick={() => onView(candidate)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// Updated Pagination component
// function Pagination() {
//   const dispatch = useAppDispatch();
//   const pagination = useAppSelector(selectPagination);
//   const filteredCandidates = useAppSelector(selectFilteredCandidates);

//   // Early return if no data
//   if (!filteredCandidates || !Array.isArray(filteredCandidates) || !pagination) {
//     return null;
//   }

//   // Update total pages when filtered candidates change
//   useEffect(() => {
//     if (filteredCandidates.length >= 0) { // Allow for 0 length
//       const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pagination.candidatesPerPage));
//       dispatch(setPagination({
//         totalCandidates: filteredCandidates.length,
//         totalPages,
//         currentPage: Math.min(pagination.currentPage, totalPages)
//       }));
//     }
//   }, [filteredCandidates.length, pagination.candidatesPerPage, dispatch, pagination.currentPage]);

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= pagination.totalPages) {
//       dispatch(setPagination({ currentPage: page }));
//     }
//   };

//   if (pagination.totalPages <= 1) return null;

//   const startRecord = Math.min((pagination.currentPage - 1) * pagination.candidatesPerPage + 1, pagination.totalCandidates);
//   const endRecord = Math.min(pagination.currentPage * pagination.candidatesPerPage, pagination.totalCandidates);

//   return (
//     <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
//       <div className="flex items-center text-sm text-gray-700">
//         Showing {startRecord} to {endRecord} of {pagination.totalCandidates} results
//       </div>
      
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => handlePageChange(pagination.currentPage - 1)}
//           disabled={pagination.currentPage <= 1}
//           className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//         >
//           Previous
//         </button>
        
//         {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
//           const pageNum = i + 1;
//           return (
//             <button
//               key={pageNum}
//               onClick={() => handlePageChange(pageNum)}
//               className={`px-3 py-1 border rounded text-sm ${
//                 pagination.currentPage === pageNum
//                   ? "bg-blue-600 text-white border-blue-600"
//                   : "hover:bg-gray-50"
//               }`}
//             >
//               {pageNum}
//             </button>
//           );
//         })}
        
//         <button
//           onClick={() => handlePageChange(pagination.currentPage + 1)}
//           disabled={pagination.currentPage >= pagination.totalPages}
//           className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

const tableHeaders = [
  { label: <input type="checkbox" className="rounded" />, className: "px-4 py-3 text-left" },
  {label: "ID", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "Applied Date", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "Candidate Name", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "Email", className: "p-3 text-left font-semibold text-gray-700" },
  // { label: "Job Title", className: "p-3 text-left font-semibold text-gray-700" },
  // { label: "Company", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "Location", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "Experience Req.", className: "p-3 text-left font-semibold text-gray-700" },
  // { label: "CTC", className: "p-3 text-left font-semibold text-gray-700" },
  // { label: "Notice Period", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "Status", className: "p-3 text-left font-semibold text-gray-700" },
  { label: "", className: "p-3 text-left font-semibold text-gray-700" },
];

export default function Candidates() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  
  // Redux selectors - Use paginated candidates for display
  const paginatedCandidates = useAppSelector(selectPaginatedCandidates);
  const filteredCandidates = useAppSelector(selectFilteredCandidates);
  const loading = useAppSelector(selectCandidatesLoading);
  const error = useAppSelector(selectCandidatesError);
  const filters = useAppSelector(selectFilters);
  const router = useRouter();
  
  const sortBy = useAppSelector(selectSortBy);
  
   const handleAddJob = () => {
    router.push("/jobs/add-job");
  };
  // Local state
  const [showFilters, setShowFilters] = useState(false);
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

  // Load candidates on component mount
  useEffect(() => {
    dispatch(fetchJobApplications({}));
  }, [dispatch]);

  // Update temp filters when actual filters change
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  useEffect(() => {
    setTempSortBy(sortBy);
  }, [sortBy]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Get unique filter options from candidates
  const filterOptions = useMemo(() => {
    const companies = Array.from(new Set(
      filteredCandidates.map(c => c.company_name).filter((value): value is string => Boolean(value))
    ));
    const locations = Array.from(new Set([
      ...filteredCandidates.map(c => c.address).filter((value): value is string => Boolean(value)),
      ...filteredCandidates.map(c => c.job_location).filter((value): value is string => Boolean(value))
    ]));
    const jobTitles = Array.from(new Set(
      filteredCandidates.map(c => c.job_title).filter((value): value is string => Boolean(value))
    ));

    return [
      {
        id: "status",
        label: "Application Status",
        type: "radio" as const,
        options: ["All", "pending", "accepted", "rejected"],
        selected: [tempFilters.status],
        onChange: (value: string) => setTempFilters({ 
          ...tempFilters, 
          status: value as CandidateFilters['status']
        }),
      },
      {
        id: "company",
        label: "Company",
        type: "checkbox" as const,
        options: companies,
        selected: tempFilters.company ? [tempFilters.company] : [],
        onChange: (value: string) => setTempFilters({ ...tempFilters, company: value }),
      },
      {
        id: "location",
        label: "Location",
        type: "checkbox" as const,
        options: locations,
        selected: tempFilters.location ? [tempFilters.location] : [],
        onChange: (value: string) => setTempFilters({ ...tempFilters, location: value }),
      },
      {
        id: "jobTitle",
        label: "Job Title",
        type: "checkbox" as const,
        options: jobTitles,
        selected: tempFilters.jobTitle ? [tempFilters.jobTitle] : [],
        onChange: (value: string) => setTempFilters({ ...tempFilters, jobTitle: value }),
      },
      {
        id: "experienceRange",
        label: "Experience Range",
        type: "radio" as const,
        options: ["0-2", "3-5", "6-10", "10+"],
        selected: tempFilters.experienceRange ? [tempFilters.experienceRange] : [],
        onChange: (value: string) => setTempFilters({ ...tempFilters, experienceRange: value }),
      },
    ];
  }, [filteredCandidates, tempFilters]);

  // Handlers
  const handleRetry = () => {
    dispatch(fetchJobApplications({}));
  };

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      await dispatch(updateApplicationStatus({ applicationId, status })).unwrap();
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
    setShowFilters(false);
  };

  const resetTempFilters = () => {
    setTempFilters(filters);
    setTempSortBy(sortBy);
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
    const initialFilters: CandidateFilters = {
      status: 'All',
      location: '',
      jobTitle: '',
      company: '',
      experienceRange: '',
      salaryMin: null,
      salaryMax: null,
      skills: '',
      dateFrom: '',
      dateTo: '',
      gender: '',
      disability: null,
      noticePreriod: '',
    };
    setTempFilters(initialFilters);
    setTempSortBy('date_desc');
  };

  // Format salary range using correct field names
  const formatSalaryRange = (candidate: CandidateWithApplication) => {
    if (candidate.current_ctc && candidate.expected_ctc) {
      return `₹${candidate.current_ctc}L / ₹${candidate.expected_ctc}L`;
    } else if (candidate.expected_ctc) {
      return `₹${candidate.expected_ctc}L expected`;
    } else if (candidate.current_ctc) {
      return `₹${candidate.current_ctc}L current`;
    }
    return "Not specified";
  };

  if (error) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <ErrorMessage message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
      <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
        {/* Back Navigation and Title */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-500 hover:text-gray-700 font-semibold text-lg transition-colors"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-gray-300 font-light">/</span>
          <span className="text-lg font-bold text-gray-900">Candidates</span>
        </div>
        <div className="flex items-center justify-between my-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#151515]">
              All Candidates
            </h1>
            <p className="text-sm text-[#606167] mt-2">
              Manage all candidates and their applications with ease.
              </p> 
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddJob}
                aria-label="Add Job"
                className="bg-blue-600 hover:bg-blue-700 text-white sm:font-medium sm:text-xl rounded-lg py-2 transition-colors cursor-pointer px-5 flex items-center gap-2"
              >
                <GoPlus className="h-8 w-8" />
                Add Job
              </button>
            </div>
          </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value as SortOption))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="salary_desc">Highest Salary</option>
              <option value="salary_asc">Lowest Salary</option>
            </select>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Clear Filters
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 font-semibold text-gray-700 cursor-pointer transition-colors"
              onClick={() => setShowFilters(true)}
            >
              <CiFilter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Filters Modal */}
        <FiltersModal
          show={showFilters}
          onClose={() => {
            resetTempFilters();
            setShowFilters(false);
          }}
          sortBy={tempSortBy}
          setSortBy={(value: string) => setTempSortBy(value as SortOption)}
          filterOptions={filterOptions}
          onClearAll={clearAllFilters}
          onApply={applyFilters}
        />

        {/* Content */}
        {!loading && (
          <>
            {/* Mobile Cards */}
            <div className="block md:hidden space-y-4">
              {paginatedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No candidates found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                paginatedCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.application_id}
                    candidate={candidate}
                    onView={handleViewCandidate}
                    onStatusUpdate={handleStatusUpdate}
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
                  {paginatedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={tableHeaders.length} className="px-4 py-12 text-center">
                        <p className="text-gray-500 text-lg">No candidates found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCandidates.map((candidate) => (
                      <tr key={candidate.application_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input type="checkbox" className="rounded accent-blue-600" />
                        </td>
                        <td className="px-3 py-4 text-gray-700">{candidate.application_id}</td>

                        <td className="px-3 py-4 text-gray-700">
                          {new Date(candidate.applied_date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {candidate.name}
                        </td>
                        <td className="px-3 py-4 text-gray-700">{candidate.candidate_email}</td>
                        <td className="px-3 py-4 text-gray-700">
                          {candidate.job_location || "—"}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {candidate.min_experience_needed && candidate.max_experience_needed
                            ? `${candidate.min_experience_needed}-${candidate.max_experience_needed} years`
                            : "—"}
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge status={candidate.application_status} />
                        </td>
                        <td className="px-3 py-4">
                          <button
                            onClick={() => handleViewCandidate(candidate)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
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
              {/* <Pagination /> */}
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
    </div>
  );
}