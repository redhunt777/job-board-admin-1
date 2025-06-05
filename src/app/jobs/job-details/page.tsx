"use client";
import { useEffect, useState } from "react";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { GrLocation } from "react-icons/gr";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { FaRegTrashAlt, FaCaretDown } from "react-icons/fa";
import { FiShare2, FiEdit3 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { fetchJobById, deleteJob, updateJob } from "@/store/features/jobSlice";
import type { RootState } from "@/store/store";


const steps = ["Job Details", "Candidates", "Settings"];

type JobStatus = "active" | "closed" | "hold on";

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

export default function JobDetailsComponent() {
  const supabase = createClient();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [step, setStep] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  const jobsFromStore = useSelector((state: RootState) => state.jobs.jobs || []);
  const jobLoading = useSelector((state: RootState) => state.jobs.loading);
  const deleteLoading = useSelector((state: RootState) => state.jobs.loading || false);
  const deleteError = useSelector((state: RootState) => state.jobs.error);
  
  const [numberOfCandidates, setNumberOfCandidates] = useState(0);
  const [jobMetadata, setJobMetadata] = useState<JobMetadata>({
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
  });

  const params = useSearchParams();
  const jobId = params.get("jobID") || params.get("jobId");
  console.log("Job ID from params:", jobId);

  // Get job from Redux store
  const getJobFromStore = () => {
    if (!jobId || jobsFromStore.length === 0) return null;
    return jobsFromStore.find(job => job.job_id === jobId);
  };

  // Map job data to component state
  const mapJobDataToState = (jobData: any) => {
    return {
      jobTitle: jobData.job_title || "",
      jobAdmin: jobData.admin_id || "",
      jobType: jobData.job_type || "",
      jobLocationType: jobData.job_location_type || "",
      jobLocation: jobData.job_location || "",
      workingType: jobData.working_type || "",
      experience: { 
        min: jobData.min_experience_needed?.toString() || "", 
        max: jobData.max_experience_needed?.toString() || "" 
      },
      salary: { 
        min: jobData.min_salary?.toString() || "", 
        max: jobData.max_salary?.toString() || "" 
      },
      companyName: jobData.company_name || "",
      jobDescription: jobData.job_description || "",
      company_logo_url: jobData.company_logo_url || "",
      status: (jobData.status as JobStatus) || "active",
    };
  };

  // Handle job status update using Redux
  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!jobId) return;

    try {
      const result = await dispatch(updateJob({
        job_id: jobId,
        updates: { status: newStatus }
      }));

      if (updateJob.fulfilled.match(result)) {
        // Update local state
        setJobMetadata(prev => ({ ...prev, status: newStatus }));
        console.log("Job status updated successfully");
      } else {
        console.log("Error updating job status:", result.payload);
        alert("Failed to update job status");
      }
    } catch (err) {
      console.log("Unexpected error updating status:", err);
      alert("An unexpected error occurred");
    }
  };

  // Handle job deletion using Redux
  const handleDeleteJob = async () => {
    if (!jobId) return;

    try {
      // Check if user is the job creator
      const { data: user } = await supabase.auth.getUser();
      
      if (jobMetadata.jobAdmin !== user.user?.id) {
        alert("Only the job creator can delete this job");
        return;
      }

      setShowDeleteModal(true);
    } catch (err) {
      console.log("Error checking user permissions:", err);
      alert("An error occurred while checking permissions");
    }
  };

  // Confirm and execute deletion
  const confirmDelete = async () => {
    if (!jobId) return;

    try {
      const result = await dispatch(deleteJob(jobId));

      if (deleteJob.fulfilled.match(result)) {
        console.log("Job deleted successfully");
        setShowDeleteModal(false);
        
        // Show success message and redirect
        setTimeout(() => {
          alert("Job deleted successfully");
          router.push("/jobs");
        }, 100);
      } else {
        console.log("Error deleting job:", result.payload);
        alert(`Failed to delete job: ${result.payload}`);
      }
    } catch (err) {
      console.log("Unexpected error deleting job:", err);
      alert("An unexpected error occurred while deleting the job");
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: jobMetadata.jobTitle,
          text: `Check out this job opportunity: ${jobMetadata.jobTitle} at ${jobMetadata.companyName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Job link copied to clipboard!");
      } catch (err) {
        alert("Share functionality is not available in this browser.");
      }
    }
  };

  // Format salary display
  const formatSalary = (min: string, max: string) => {
    const minNum = parseInt(min) || 0;
    const maxNum = parseInt(max) || 0;
    
    if (minNum === 0 && maxNum === 0) return "Not specified";
    if (minNum === maxNum) return `${minNum.toLocaleString()}`;
    return `${minNum.toLocaleString()} - ${maxNum.toLocaleString()}`;
  };

  // Load job data when component mounts or job data changes
  useEffect(() => {
    if (!jobId) return;

    // First check if job exists in store
    const jobFromStore = getJobFromStore();
    
    if (jobFromStore) {
      // Job exists in store, use it
      setJobMetadata(mapJobDataToState(jobFromStore));
      setIsLoading(false);
    } else {
      // Job not in store, fetch it
      dispatch(fetchJobById(jobId));
    }
  }, [jobId, dispatch]);

  // Update local state when Redux store updates
  useEffect(() => {
    const jobFromStore = getJobFromStore();
    if (jobFromStore && !jobLoading) {
      setJobMetadata(mapJobDataToState(jobFromStore));
      setIsLoading(false);
    }
    if (!jobLoading) {
      setIsLoading(false);
    }
  }, [jobsFromStore, jobLoading, jobId]);

  // Handle delete error
  useEffect(() => {
    if (deleteError) {
      alert(`Error deleting job: ${deleteError}`);
      // Clear the error after showing it
      dispatch({ type: 'jobs/clearDeleteError' });
    }
  }, [deleteError, dispatch]);

  // Show loading state
  if (isLoading || jobLoading) {
    return (
      <div className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}>
        <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading job details...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if job not found
  if (!jobMetadata.jobTitle && !isLoading) {
    return (
      <div className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}>
        <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
          <div className="flex items-center justify-center h-64 flex-col">
            <div className="text-lg text-gray-600 mb-4">Job not found</div>
            <Link
              href="/jobs"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Jobs
            </Link>
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
    >
      <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-semibold text-lg transition-colors"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-neutral-300">/</span>
          <Link
            href="/jobs"
            className="text-neutral-500 hover:text-neutral-700 font-semibold text-lg transition-colors"
          >
            Jobs
          </Link>
          <span className="text-lg text-neutral-300">/</span>
          <span className="text-lg font-semibold text-neutral-900 truncate">
            {jobMetadata.jobTitle || "Job Details"}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-4 border-b border-neutral-300 w-fit">
            {steps.map((s, i) => (
              <button
                key={s}
                className={`px-4 py-2 text-center font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  i === step
                    ? "border-b-4 border-blue-600 text-blue-600"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setStep(i)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center items-center w-full">
          <div className="max-w-5xl w-full pb-20">
            {step === 0 && (
              <div>
                {/* Job Header */}
                <div className="flex gap-8 mb-8 items-center">
                  <img
                    src={jobMetadata.company_logo_url || "/demo.png"}
                    alt={`${jobMetadata.companyName} logo`}
                    className="w-24 h-24 rounded-2xl object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/demo.png";
                    }}
                  />
                  <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-[#000000] mb-1">
                      {jobMetadata.jobTitle}
                    </h1>
                    <p className="text-[#83858C] text-lg">
                      {jobMetadata.companyName}
                    </p>
                  </div>
                </div>

                {/* Job Details and Actions */}
                <div className="flex flex-col lg:flex-row mb-6 justify-between items-start lg:items-end gap-6">
                  <div className="flex-1">
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

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={jobMetadata.status}
                        onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
                        disabled={jobLoading}
                        className={`appearance-none text-sm font-medium px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors pr-8 ${
                          jobMetadata.status === "active"
                            ? "bg-green-100 text-green-700 focus:ring-green-500"
                            : jobMetadata.status === "closed"
                            ? "bg-red-100 text-red-700 focus:ring-red-500"
                            : "bg-yellow-100 text-yellow-700 focus:ring-yellow-500"
                        } ${jobLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="hold on">Hold on</option>
                      </select>
                      <FaCaretDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black pointer-events-none" />
                    </div>

                    {/* Edit Button */}
                    <Link
                      href={`/jobs/edit?jobId=${jobId}`}
                      className="text-white text-sm font-normal bg-[#2C75C2] hover:bg-[#1e5ba8] px-3 py-2 rounded-lg transition-colors flex items-center"
                    >
                      <FiEdit3 className="mr-2 h-4 w-4" />
                      Edit Job
                    </Link>

                    {/* Share Button */}
                    <button
                      onClick={handleShare}
                      className="text-[#3F4044] text-sm font-normal bg-[#E5E6E8] hover:bg-[#d1d3d6] px-3 py-2 rounded-lg transition-colors flex items-center"
                    >
                      <FiShare2 className="mr-2 h-4 w-4" />
                      Share
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={handleDeleteJob}
                      disabled={deleteLoading}
                      className="text-white text-sm font-medium bg-[#C62828] hover:bg-[#B71C1C] px-3 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      <FaRegTrashAlt className="h-4 w-4 mr-2" />
                      {deleteLoading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {/* Job Description */}
                <div className="my-6">
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
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">Candidates</h2>
                <p className="text-gray-600">Candidate management feature coming soon...</p>
              </div>
            )}
            
            {step === 2 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">Settings</h2>
                <p className="text-gray-600">Job settings feature coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Job Deletion
            </h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <span className="font-medium">"{jobMetadata.jobTitle}"</span>?
            </p>
            <p className="text-gray-600 mb-6">
              This action cannot be undone and will permanently remove the job posting and all associated data.
            </p>
            
            {deleteError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Error: {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
      )}
    </div>
  );
}