import Link from "next/link";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { JobStatus, JobMetadata } from "@/types/custom";
import { JOB_STATUSES, STEPS } from "@/types/custom";
import { FaCaretDown, FaRegTrashAlt } from "react-icons/fa";
import { FiShare2, FiEdit3 } from "react-icons/fi";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { GrLocation } from "react-icons/gr";
import { MdOutlinePeopleAlt } from "react-icons/md";
import Image from "next/image";

export const JobDetailsSkeleton: React.FC = () => (
  <div className="max-w-5xl w-full pb-20" data-testid="job-details-skeleton">
    <div className="flex gap-8 mb-8 items-center animate-pulse">
      <div className="w-24 h-24 bg-neutral-300 rounded-2xl" />
      <div className="flex-1">
        <div className="h-8 bg-neutral-300 rounded mb-2 w-3/4" />
        <div className="h-6 bg-neutral-300 rounded w-1/2" />
      </div>
    </div>

    <div className="flex flex-col lg:flex-row mb-6 justify-between items-start lg:items-end gap-6 animate-pulse">
      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-8 bg-neutral-300 rounded-lg w-20" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-8 bg-neutral-300 rounded-lg w-32" />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-24 h-10 bg-neutral-300 rounded-lg" />
        ))}
      </div>
    </div>

    <div className="my-6 animate-pulse">
      <div className="h-6 bg-neutral-300 rounded w-32 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-4 bg-neutral-300 rounded" />
        ))}
      </div>
    </div>
  </div>
);

export const ErrorState: React.FC<{
  error: string;
  onRetry: () => void;
  onGoBack: () => void;
}> = ({ error, onRetry, onGoBack }) => (
  <div
    className="flex flex-col items-center justify-center py-12 text-center"
    data-testid="error-state"
  >
    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <svg
        className="w-16 h-16 text-red-400"
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
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
      Error loading job details
    </h3>
    <p className="text-neutral-600 mb-6" data-testid="error-message">
      {error}
    </p>
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
        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg py-2 px-4 transition-colors"
        data-testid="go-back-button"
      >
        Go Back
      </button>
    </div>
  </div>
);

export const JobNotFound: React.FC<{ onGoBack: () => void }> = ({
  onGoBack,
}) => (
  <div
    className="flex flex-col items-center justify-center py-12 text-center"
    data-testid="job-not-found"
  >
    <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
      <svg
        className="w-16 h-16 text-neutral-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17H9v-2.5a6 6 0 016-6v2.5z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
      Job not found
    </h3>
    <p className="text-neutral-600 mb-6">
      The job you&apos;re looking for doesn&apos;t exist or has been removed.
    </p>
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
export const Breadcrumb: React.FC<{ jobTitle: string }> = ({ jobTitle }) => (
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
export const TabNavigation: React.FC<{
  activeStep: number;
  onStepChange: (step: number) => void;
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
          data-testid={`tab-${stepName.toLowerCase().replace(" ", "-")}`}
        >
          {stepName}
        </button>
      ))}
    </div>
  </div>
);

// Status Dropdown Component
export const StatusDropdown: React.FC<{
  status: JobStatus;
  onChange: (status: JobStatus) => void;
  disabled: boolean;
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
      {JOB_STATUSES.map((statusOption) => (
        <option key={statusOption} value={statusOption}>
          {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
        </option>
      ))}
    </select>
    <FaCaretDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black pointer-events-none" />
  </div>
);

// Action Buttons Component
export const ActionButtons: React.FC<{
  jobId: string;
  loading: boolean;
  onShare: () => void;
  onDelete: () => void;
}> = ({ jobId, loading, onShare, onDelete }) => (
  <div className="flex flex-wrap gap-3" data-testid="action-buttons">
    <Link
      href={`/jobs/edit?jobId=${jobId}`}
      className="text-white text-sm font-normal bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors flex items-center"
      data-testid="edit-job-button"
    >
      <FiEdit3 className="mr-2 h-4 w-4" />
      Edit Job
    </Link>

    <button
      onClick={onShare}
      className="text-neutral-700 text-sm font-normal bg-neutral-200 hover:bg-neutral-300 px-3 py-2 rounded-lg transition-colors flex items-center"
      type="button"
      data-testid="share-button"
    >
      <FiShare2 className="mr-2 h-4 w-4" />
      Share
    </button>

    <button
      onClick={onDelete}
      disabled={loading}
      className="text-white text-sm font-medium bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
      data-testid="delete-button"
    >
      <FaRegTrashAlt className="h-4 w-4 mr-2" />
      {loading ? "Deleting..." : "Delete"}
    </button>
  </div>
);

// Delete Confirmation Modal Component
export const DeleteConfirmationModal: React.FC<{
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
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Confirm Job Deletion
        </h3>
        <p className="text-neutral-600 mb-2">
          Are you sure you want to delete{" "}
          <span className="font-medium">&ldquo;{jobTitle}&rdquo;</span>?
        </p>
        <p className="text-neutral-600 mb-6">
          This action cannot be undone and will permanently remove the job
          posting and all associated data.
        </p>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            data-testid="delete-error"
          >
            Error: {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-neutral-600 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors disabled:opacity-50"
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
export const JobHeader: React.FC<{ jobMetadata: JobMetadata }> = ({
  jobMetadata,
}) => (
  <div className="flex gap-8 mb-8 items-center" data-testid="job-header">
    <Image
      src={jobMetadata.company_logo_url || "/demo.png"}
      alt={`${jobMetadata.companyName} logo`}
      width={96}
      height={96}
      className="rounded-2xl object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/demo.png";
      }}
      data-testid="company-logo"
    />
    <div className="flex-1">
      <h1
        className="text-2xl font-semibold text-neutral-900 mb-1"
        data-testid="job-title"
      >
        {jobMetadata.jobTitle}
      </h1>
      <p className="text-neutral-500 text-lg" data-testid="company-name">
        {jobMetadata.companyName}
      </p>
    </div>
  </div>
);

// Job Info Tags Component
export const JobInfoTags: React.FC<{
  jobMetadata: JobMetadata;
  numberOfCandidates: number;
  formatSalary: (min: string, max: string) => string;
}> = ({ jobMetadata, numberOfCandidates, formatSalary }) => (
  <div className="flex-1" data-testid="job-info-tags">
    {/* Job Type Tags */}
    <div className="flex flex-wrap gap-2 mb-4">
      {jobMetadata.jobType && (
        <span className="text-neutral-500 text-sm font-normal bg-neutral-200 px-3 py-2 rounded-lg">
          {jobMetadata.jobType}
        </span>
      )}
      {jobMetadata.jobLocationType && (
        <span className="text-neutral-500 text-sm font-normal bg-neutral-200 px-3 py-2 rounded-lg">
          {jobMetadata.jobLocationType}
        </span>
      )}
      {jobMetadata.workingType && (
        <span className="text-neutral-500 text-sm font-normal bg-neutral-200 px-3 py-2 rounded-lg">
          {jobMetadata.workingType}
        </span>
      )}
    </div>

    {/* Job Info */}
    <div className="flex flex-wrap gap-2">
      {jobMetadata.jobLocation && (
        <span className="text-neutral-500 text-sm font-normal bg-neutral-200 px-3 py-2 rounded-lg flex items-center">
          <GrLocation className="text-blue-600 text-base mr-2" />
          {jobMetadata.jobLocation}
        </span>
      )}
      <span className="text-neutral-500 text-sm font-normal bg-neutral-200 px-3 py-2 rounded-lg flex items-center">
        <LiaRupeeSignSolid className="text-blue-600 text-base mr-1" />
        {formatSalary(jobMetadata.salary.min, jobMetadata.salary.max)}
      </span>
      <span className="text-neutral-500 text-sm font-normal bg-neutral-200 px-3 py-2 rounded-lg flex items-center">
        <MdOutlinePeopleAlt className="text-blue-600 text-base mr-2" />
        {numberOfCandidates} Applicant{numberOfCandidates !== 1 ? "s" : ""}
      </span>
    </div>
  </div>
);
