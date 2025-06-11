"use client";
import react, { useEffect, useState, useCallback, useMemo } from "react";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { GrLocation } from "react-icons/gr";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { FaRegTrashAlt, FaCaretDown } from "react-icons/fa";
import { FiShare2, FiEdit3 } from "react-icons/fi";
import { 
  fetchJobById, 
  deleteJob, 
  updateJob,
  selectJobs,
  selectJobsLoading,
  selectJobsError,
  clearError,
  selectSelectedJob
} from "@/store/features/jobSlice";
import CandidatesList from "@/components/candidates_list_component";
import { CandidateWithApplication, UserContext, setUserContext, fetchJobApplicationsWithAccess, selectUserContext } from "@/store/features/candidatesSlice";
import { initializeAuth } from "@/store/features/userSlice";

// Constants
const STEPS = ["Job Details", "Candidates", "Settings"] as const;
const JOB_STATUSES = ["active", "closed", "hold on"] as const;

// Types
type JobStatus = typeof JOB_STATUSES[number];
type StepType = typeof STEPS[number];

interface JobMetadata {
  jobTitle: string;
  jobAdmin: string;
  jobType: string;
  jobLocationType: string;
  jobLocation: string;
  workingType: string;
  experience: { min: string; max: string };
  salary: { min: string; max: string };
  companyName: string;
  jobDescription: string;
  company_logo_url: string;
  status: JobStatus;
}

// Sub-components
const JobDetailsSkeleton: React.FC = () => (
  <div className="max-w-5xl w-full pb-20" data-testid="job-details-skeleton">
    <div className="flex gap-8 mb-8 items-center animate-pulse">
      <div className="w-24 h-24 bg-gray-300 rounded-2xl" />
      <div className="flex-1">
        <div className="h-8 bg-gray-300 rounded mb-2 w-3/4" />
        <div className="h-6 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
    
    <div className="flex flex-col lg:flex-row mb-6 justify-between items-start lg:items-end gap-6 animate-pulse">
      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-8 bg-gray-300 rounded-lg w-20" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-8 bg-gray-300 rounded-lg w-32" />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-24 h-10 bg-gray-300 rounded-lg" />
        ))}
      </div>
    </div>
    
    <div className="my-6 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-32 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded" />
        ))}
      </div>
    </div>
  </div>
);

const ErrorState: React.FC<{ 
  error: string; 
  onRetry: () => void;
  onGoBack: () => void;
}> = ({ error, onRetry, onGoBack }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="error-state">
    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">Error loading job details</h3>
    <p className="text-neutral-600 mb-6" data-testid="error-message">{error}</p>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 px-4 transition-colors"
        data-testid="retry-button"
      >
        Try Again
      </button>
      <button
        type="button"
        onClick={onGoBack}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg py-2 px-4 transition-colors"
        data-testid="go-back-button"
      >
        Go Back
      </button>
    </div>
  </div>
);

const JobNotFound: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="job-not-found">
    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17H9v-2.5a6 6 0 016-6v2.5z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">Job not found</h3>
    <p className="text-neutral-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
    <button
      type="button"
      onClick={onGoBack}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 px-4 transition-colors"
      data-testid="back-to-jobs-button"
    >
      ← Back to Jobs
    </button>
  </div>
);

// Breadcrumb Component
const Breadcrumb: React.FC<{ jobTitle: string }> = ({ jobTitle }) => (
  <div className="flex items-center gap-2 mb-4" data-testid="breadcrumb">
    <Link
      href="/dashboard"
      className="flex items-center text-neutral-500 hover:text-neutral-700 font-semibold md:text-lg text-sm transition-colors"
    >
      <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
      <span>Back to Dashboard</span>
    </Link>
    <span className="text-lg text-neutral-300">/</span>
    <Link
      href="/jobs"
      className="text-neutral-500 hover:text-neutral-700 font-semibold md:text-lg text-sm transition-colors"
    >
      Jobs
    </Link>
    <span className="text-lg text-neutral-300">/</span>
    <span className="font-semibold text-neutral-900 md:text-lg text-sm truncate">
      {jobTitle || "Job Details"}
    </span>
  </div>
);

// Tab Navigation Component
const TabNavigation: React.FC<{ 
  activeStep: number; 
  onStepChange: (step: number) => void 
}> = ({ activeStep, onStepChange }) => (
  <div className="flex gap-4 mb-6" data-testid="tab-navigation">
    <div className="flex gap-4 border-b border-neutral-300 w-fit">
      {STEPS.map((stepName, index) => (
        <button
          key={stepName}
          className={`px-4 py-2 text-center font-medium transition-colors whitespace-nowrap cursor-pointer ${
            index === activeStep
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => onStepChange(index)}
          type="button"
          data-testid={`tab-${stepName.toLowerCase().replace(' ', '-')}`}
        >
          {stepName}
        </button>
      ))}
    </div>
  </div>
);

// Status Dropdown Component
const StatusDropdown: React.FC<{ 
  status: JobStatus; 
  onChange: (status: JobStatus) => void; 
  disabled: boolean 
}> = ({ status, onChange, disabled }) => (
  <div className="relative" data-testid="status-dropdown">
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as JobStatus)}
      disabled={disabled}
      className={`appearance-none text-sm font-medium px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors pr-8 ${
        status === "active"
          ? "bg-green-100 text-green-700 focus:ring-green-500"
          : status === "closed"
          ? "bg-red-100 text-red-700 focus:ring-red-500"
          : "bg-yellow-100 text-yellow-700 focus:ring-yellow-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {JOB_STATUSES.map(statusOption => (
        <option key={statusOption} value={statusOption}>
          {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
        </option>
      ))}
    </select>
    <FaCaretDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black pointer-events-none" />
  </div>
);

// Action Buttons Component
const ActionButtons: React.FC<{
  jobId: string;
  loading: boolean;
  onShare: () => void;
  onDelete: () => void;
}> = ({ jobId, loading, onShare, onDelete }) => (
  <div className="flex flex-wrap gap-3" data-testid="action-buttons">
    <Link
      href={`/jobs/edit?jobId=${jobId}`}
      className="text-white text-sm font-normal bg-[#2C75C2] hover:bg-[#1e5ba8] px-3 py-2 rounded-lg transition-colors flex items-center"
      data-testid="edit-job-button"
    >
      <FiEdit3 className="mr-2 h-4 w-4" />
      Edit Job
    </Link>

    <button
      onClick={onShare}
      className="text-[#3F4044] text-sm font-normal bg-[#E5E6E8] hover:bg-[#d1d3d6] px-3 py-2 rounded-lg transition-colors flex items-center"
      type="button"
      data-testid="share-button"
    >
      <FiShare2 className="mr-2 h-4 w-4" />
      Share
    </button>

    <button
      onClick={onDelete}
      disabled={loading}
      className="text-white text-sm font-medium bg-[#C62828] hover:bg-[#B71C1C] px-3 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
      data-testid="delete-button"
    >
      <FaRegTrashAlt className="h-4 w-4 mr-2" />
      {loading ? "Deleting..." : "Delete"}
    </button>
  </div>
);

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  jobTitle: string;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, jobTitle, loading, error, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      data-testid="delete-modal"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Confirm Job Deletion
        </h3>
        <p className="text-gray-600 mb-2">
          Are you sure you want to delete <span className="font-medium">"{jobTitle}"</span>?
        </p>
        <p className="text-gray-600 mb-6">
          This action cannot be undone and will permanently remove the job posting and all associated data.
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-testid="delete-error">
            Error: {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
            data-testid="cancel-delete-button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            data-testid="confirm-delete-button"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaRegTrashAlt className="mr-2 h-4 w-4" />
                Delete Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Job Header Component
const JobHeader: React.FC<{ jobMetadata: JobMetadata }> = ({ jobMetadata }) => (
  <div className="flex gap-8 mb-8 items-center" data-testid="job-header">
    <img
      src={jobMetadata.company_logo_url || "/demo.png"}
      alt={`${jobMetadata.companyName} logo`}
      className="w-24 h-24 rounded-2xl object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/demo.png";
      }}
      data-testid="company-logo"
    />
    <div className="flex-1">
      <h1 className="text-2xl font-semibold text-[#000000] mb-1" data-testid="job-title">
        {jobMetadata.jobTitle}
      </h1>
      <p className="text-[#83858C] text-lg" data-testid="company-name">
        {jobMetadata.companyName}
      </p>
    </div>
  </div>
);

// Job Info Tags Component
const JobInfoTags: React.FC<{ 
  jobMetadata: JobMetadata; 
  numberOfCandidates: number;
  formatSalary: (min: string, max: string) => string;
}> = ({ jobMetadata, numberOfCandidates, formatSalary }) => (
  <div className="flex-1" data-testid="job-info-tags">
    {/* Job Type Tags */}
    <div className="flex flex-wrap gap-2 mb-4">
      {jobMetadata.jobType && (
        <span className="text-[#57595A] text-sm font-normal bg-[#F0F1F1] px-3 py-2 rounded-lg">
          {jobMetadata.jobType}
        </span>
      )}
      {jobMetadata.jobLocationType && (
        <span className="text-[#57595A] text-sm font-normal bg-[#F0F1F1] px-3 py-2 rounded-lg">
          {jobMetadata.jobLocationType}
        </span>
      )}
      {jobMetadata.workingType && (
        <span className="text-[#57595A] text-sm font-normal bg-[#F0F1F1] px-3 py-2 rounded-lg">
          {jobMetadata.workingType}
        </span>
      )}
    </div>

    {/* Job Info */}
    <div className="flex flex-wrap gap-2">
      {jobMetadata.jobLocation && (
        <span className="text-[#57595A] text-sm font-normal bg-[#F0F1F1] px-3 py-2 rounded-lg flex items-center">
          <GrLocation className="text-[#1E5CDC] text-base mr-2" />
          {jobMetadata.jobLocation}
        </span>
      )}
      <span className="text-[#57595A] text-sm font-normal bg-[#F0F1F1] px-3 py-2 rounded-lg flex items-center">
        <LiaRupeeSignSolid className="text-[#1E5CDC] text-base mr-1" />
        {formatSalary(jobMetadata.salary.min, jobMetadata.salary.max)}
      </span>
      <span className="text-[#57595A] text-sm font-normal bg-[#F0F1F1] px-3 py-2 rounded-lg flex items-center">
        <MdOutlinePeopleAlt className="text-[#1E5CDC] text-base mr-2" />
        {numberOfCandidates} Applicant{numberOfCandidates !== 1 ? 's' : ''}
      </span>
    </div>
  </div>
);

// Main Component
export default function JobDetailsComponent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // State management
  const [step, setStep] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [numberOfCandidates, setNumberOfCandidates] = useState(0);

  const userContext = useAppSelector(selectUserContext);
  

  const user = useAppSelector((state) => state.user.user);
  const organization = useAppSelector((state) => state.user.organization);
  const roles = useAppSelector((state) => state.user.roles);

    // Initialize authentication if not already done
  useEffect(() => {
    if (!user || !organization) {
      dispatch(initializeAuth());
    }
  }, [dispatch, user, organization]);

    // Memoize user context to prevent unnecessary re-renders
    const memoizedUserContext = useMemo((): UserContext | null => {
      console.log("Memoizing user context:", {
        userId: user?.id,
        organizationId: organization?.id,
        roles: roles[0],
      }
      )
      if (!user?.id || !organization?.id || !roles[0]) {
        return null;
      }
  
      return {
        userId: user.id,
        organizationId: organization.id,
        roles: roles.map(role => typeof role === 'string' ? role : role.toString()), // e.g., ['admin'], ['hr'], ['ta'], etc.
      };
    }, [user?.id, organization?.id, roles]);
  
    // Set user context when it's available
    useEffect(() => {
      if (memoizedUserContext && !userContext) {
        dispatch(setUserContext(memoizedUserContext));
      }
    }, [memoizedUserContext, userContext, dispatch]);
  
    // Load candidates when user context is available
    useEffect(() => {
      if (memoizedUserContext) {
        dispatch(fetchJobApplicationsWithAccess({
          filters: {}, // You can add default filters here if needed
          userContext: memoizedUserContext,
        }));
      }
    }, [dispatch, memoizedUserContext]);


  // Redux selectors
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  const jobs = useAppSelector(selectJobs);
  const selectedJob = useAppSelector(selectSelectedJob);
  const loading = useAppSelector(selectJobsLoading);
  const error = useAppSelector(selectJobsError);

  // URL params
  const params = useSearchParams();
  const jobId = params.get("jobID") || params.get("jobId");

  // Memoized job from store
  const currentJob = useMemo(() => {
    if (!jobId) return null;
    return selectedJob || jobs.find(job => job.id === jobId);
  }, [jobId, jobs, selectedJob]);

  // Map job data to component state
  const jobMetadata = useMemo((): JobMetadata => {
    if (!currentJob) {
      return {
        jobTitle: "",
        jobAdmin: "",
        jobType: "",
        jobLocationType: "",
        jobLocation: "",
        workingType: "",
        experience: { min: "", max: "" },
        salary: { min: "", max: "" },
        companyName: "",
        jobDescription: "",
        company_logo_url: "",
        status: "active",
      };
    }

    return {
      jobTitle: currentJob.title || "",
      jobAdmin: currentJob.created_by || "",
      jobType: currentJob.job_type || "",
      jobLocationType: currentJob.job_location_type || "",
      jobLocation: currentJob.location || "",
      workingType: currentJob.working_type || "",
      experience: { 
        min: currentJob.min_experience_needed?.toString() || "", 
        max: currentJob.max_experience_needed?.toString() || "" 
      },
      salary: { 
        min: currentJob.salary_min?.toString() || "", 
        max: currentJob.salary_max?.toString() || "" 
      },
      companyName: currentJob.company_name || "",
      jobDescription: currentJob.description || "",
      company_logo_url: currentJob.company_logo_url || "",
      status: (currentJob.status as JobStatus) || "active",
    };
  }, [currentJob]);

  // Handle job status update
  const handleStatusChange = useCallback(async (newStatus: JobStatus) => {
    if (!jobId) return;

    try {
      const result = await dispatch(updateJob({
        jobId: jobId,
        updates: { status: newStatus }
      }));

      if (updateJob.fulfilled.match(result)) {
        console.log("Job status updated successfully");
      } else {
        console.error("Error updating job status:", result.payload);
        alert("Failed to update job status");
      }
    } catch (err) {
      console.error("Unexpected error updating status:", err);
      alert("An unexpected error occurred");
    }
  }, [jobId, dispatch]);

  // Confirm and execute deletion
  const confirmDelete = useCallback(async () => {
    if (!jobId) return;

    try {
      const result = await dispatch(deleteJob(jobId));

      if (deleteJob.fulfilled.match(result)) {
        console.log("Job deleted successfully");
        setShowDeleteModal(false);
        
        setTimeout(() => {
          alert("Job deleted successfully");
          router.push("/jobs");
        }, 100);
      } else {
        console.error("Error deleting job:", result.payload);
        alert(`Failed to delete job: ${result.payload}`);
      }
    } catch (err) {
      console.error("Unexpected error deleting job:", err);
      alert("An unexpected error occurred while deleting the job");
    }
  }, [jobId, dispatch, router]);

  // Handle share functionality
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: jobMetadata.jobTitle,
          text: `Check out this job opportunity: ${jobMetadata.jobTitle} at ${jobMetadata.companyName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Job link copied to clipboard!");
      } catch (err) {
        alert("Share functionality is not available in this browser.");
      }
    }
  }, [jobMetadata.jobTitle, jobMetadata.companyName]);

  // Format salary display
  const formatSalary = useCallback((min: string, max: string) => {
    const minNum = parseInt(min) || 0;
    const maxNum = parseInt(max) || 0;
    
    if (minNum === 0 && maxNum === 0) return "Not specified";
    if (minNum === maxNum) return `${minNum.toLocaleString()}`;
    return `${minNum.toLocaleString()} - ${maxNum.toLocaleString()}`;
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (jobId) {
      dispatch(clearError());
      dispatch(fetchJobById({ jobId }));
    }
  }, [jobId, dispatch]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    router.push("/jobs");
  }, [router]);

  // Handle candidate click
  const handleCandidateClick = useCallback((candidate: CandidateWithApplication) => {
    console.log("Candidate clicked:", candidate);
    // Implement navigation to candidate detail page
  }, []);

  // Initialize job data
  useEffect(() => {
    if (jobId && !currentJob && !loading) {
      dispatch(fetchJobById({ jobId }));
    }
  }, [jobId, currentJob, loading, dispatch]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [error, dispatch]);

  // Early returns for different states
  if (loading) {
    return (
      <div className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}>
        <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
          <div className="flex items-center gap-2 mb-4 animate-pulse">
            <div className="w-40 h-6 bg-gray-300 rounded" />
            <div className="w-4 h-6 bg-gray-300 rounded" />
            <div className="w-16 h-6 bg-gray-300 rounded" />
            <div className="w-4 h-6 bg-gray-300 rounded" />
            <div className="w-32 h-6 bg-gray-300 rounded" />
          </div>
          <div className="flex gap-4 mb-6 animate-pulse">
            <div className="flex gap-4 border-b border-neutral-300 w-fit">
              {STEPS.map((_, i) => (
                <div key={i} className="w-24 h-10 bg-gray-300 rounded-t" />
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center w-full">
            <JobDetailsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}>
        <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
          <div className="flex justify-center items-center w-full min-h-[400px]">
            <ErrorState 
              error={error} 
              onRetry={handleRetry}
              onGoBack={handleGoBack}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!jobMetadata.jobTitle && !loading) {
    return (
      <div className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}>
        <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
          <div className="flex justify-center items-center w-full min-h-[400px]">
            <JobNotFound onGoBack={handleGoBack} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}
      data-testid="job-details-component"
    >
      <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
        <Breadcrumb jobTitle={jobMetadata.jobTitle} />
        <TabNavigation activeStep={step} onStepChange={setStep} />

        <div className="flex justify-center items-center w-full">
          <div className="max-w-5xl w-full pb-20">
            {step === 0 && (
              <div data-testid="job-details-tab">
                <JobHeader jobMetadata={jobMetadata} />

                <div className="flex flex-col lg:flex-row mb-6 justify-between items-start lg:items-end gap-6">
                  <JobInfoTags 
                    jobMetadata={jobMetadata}
                    numberOfCandidates={numberOfCandidates}
                    formatSalary={formatSalary}
                  />

                  <div className="flex flex-wrap gap-3">
                    <StatusDropdown 
                      status={jobMetadata.status}
                      onChange={handleStatusChange}
                      disabled={loading}
                    />
                    <ActionButtons
                      jobId={jobId || ""}
                      loading={loading}
                      onShare={handleShare}
                      onDelete={() => setShowDeleteModal(true)}
                    />
                  </div>
                </div>

                <div className="my-6" data-testid="job-description">
                  <h2 className="text-xl font-semibold text-[#000000] mb-4">
                  Job Description
                  </h2>
                  <div className="text-[#57595A] text-sm font-normal whitespace-pre-wrap">
                  {jobMetadata.jobDescription || "No job description provided."}
                  </div>
                </div>
                </div>
              )}

              {step === 1 && (
                <div data-testid="candidates-tab">
                <CandidatesList 
                  onCandidateClick={handleCandidateClick}
                />
                </div>
              )}

              {step === 2 && (
                <>
                Setting Feature is under development.
                </>
              )}
              </div>
            </div>
                <DeleteConfirmationModal
                  isOpen={showDeleteModal}
                  jobTitle={jobMetadata.jobTitle}
                  loading={loading}
                  error={error}
                  onConfirm={confirmDelete}
                  onCancel={() => setShowDeleteModal(false)}
                />
              </div>
            </div>
          );
        }
                