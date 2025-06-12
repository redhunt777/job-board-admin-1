"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useSearchParams, useRouter } from "next/navigation";
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
import { JobMetadata, JobStatus } from "@/types/custom";
import { STEPS} from "@/types/custom"
import { JobDetailsSkeleton, ErrorState, JobNotFound, Breadcrumb, TabNavigation, StatusDropdown, ActionButtons, DeleteConfirmationModal, JobHeader, JobInfoTags } from "./utils";

// Main Component - Optimized Version
export default function JobDetailsComponent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // State management
  const [step, setStep] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [numberOfCandidates, setNumberOfCandidates] = useState(0);

  // Redux selectors - moved up for better organization
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  const jobs = useAppSelector(selectJobs);
  const selectedJob = useAppSelector(selectSelectedJob);
  const loading = useAppSelector(selectJobsLoading);
  const error = useAppSelector(selectJobsError);
  const userContext = useAppSelector(selectUserContext);
  const user = useAppSelector((state) => state.user.user);
  const organization = useAppSelector((state) => state.user.organization);
  const roles = useAppSelector((state) => state.user.roles);

  // URL params
  const params = useSearchParams();
  const jobId = params.get("jobID") || params.get("jobId");

  // Helper function to safely get user role
  const getUserRole = useCallback(() => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return "";
    }
    
    const firstRole = roles[0];
    if (!firstRole) {
      return "";
    }
    
    // Handle different role structures
    if (typeof firstRole === 'string') {
      return firstRole;
    }
    
    if (firstRole.role && firstRole.role.name) {
      return firstRole.role.name;
    }
    return "";
  }, [roles]);

  const isAuthReady = useMemo(() => {
    return !!(user?.id && organization?.id && roles && roles.length > 0);
  }, [user?.id, organization?.id, roles]);

  const currentJob = useMemo(() => {
    if (!jobId) return null;
    return selectedJob || jobs.find(job => job.id === jobId);
  }, [jobId, jobs, selectedJob]);

  const memoizedUserContext = useMemo((): UserContext | null => {
    if (!isAuthReady) return null;

    return {
      userId: user?.id!,
      organizationId: organization?.id!,
      roles: roles.map(role => {
        if (typeof role === 'string') return role;
        if (role?.role?.name) return role.role.name;
        return role?.toString() || '';
      }).filter(Boolean), // Remove empty strings
    };
  }, [isAuthReady, user?.id, organization?.id, roles]);

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

  const formattedSalary = useMemo(() => {
    const minNum = parseInt(jobMetadata.salary.min) || 0;
    const maxNum = parseInt(jobMetadata.salary.max) || 0;
    
    if (minNum === 0 && maxNum === 0) return "Not specified";
    if (minNum === maxNum) return `${minNum.toLocaleString()}`;
    return `${minNum.toLocaleString()} - ${maxNum.toLocaleString()}`;
  }, [jobMetadata.salary.min, jobMetadata.salary.max]);

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

  const handleRetry = useCallback(() => {
    if (jobId) {
      dispatch(clearError());
      dispatch(fetchJobById({ jobId }));
    }
  }, [jobId, dispatch]);

  const handleGoBack = useCallback(() => {
    router.push("/jobs");
  }, [router]);

  const handleCandidateClick = useCallback((candidate: CandidateWithApplication) => {
    console.log("Candidate clicked:", candidate);
    // Implement navigation to candidate detail page
  }, []);

  // Initialize authentication if not ready
  useEffect(() => {
    if (!isAuthReady) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isAuthReady]);

  // Set user context when it's available
  useEffect(() => {
    if (memoizedUserContext && !userContext) {
      dispatch(setUserContext(memoizedUserContext));
    }
  }, [memoizedUserContext, userContext, dispatch]);

  // Load candidates when user context is available
  useEffect(() => {
    if (memoizedUserContext && userContext) {
      dispatch(fetchJobApplicationsWithAccess({
        filters: {},
        userContext: memoizedUserContext,
      }));
    }
  }, [dispatch, memoizedUserContext, userContext]);

  // Initialize job data - Fixed the error here
  useEffect(() => {
    if (jobId && !currentJob && !loading && isAuthReady) {
      const userRole = getUserRole();
      dispatch(fetchJobById({ 
        jobId, 
        userId: user?.id || "", 
        userRole: userRole 
      }));
    }
  }, [jobId, currentJob, loading, isAuthReady, user?.id, dispatch, getUserRole]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [error, dispatch]);

  const containerClassName = useMemo(() => {
    return `transition-all duration-300 min-h-full md:pb-0 px-0 ${
      collapsed ? "md:ml-20" : "md:ml-64"
    } md:pt-0 pt-4`;
  }, [collapsed]);

  // Early returns for different states
  if (loading) {
    return (
      <div className={containerClassName}>
        <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
          <div className="flex items-center gap-2 mb-4 animate-pulse">
            <div className="w-40 h-6 bg-neutral-300 rounded" />
            <div className="w-4 h-6 bg-neutral-300 rounded" />
            <div className="w-16 h-6 bg-neutral-300 rounded" />
            <div className="w-4 h-6 bg-neutral-300 rounded" />
            <div className="w-32 h-6 bg-neutral-300 rounded" />
          </div>
          <div className="flex gap-4 mb-6 animate-pulse">
            <div className="flex gap-4 border-b border-neutral-300 w-fit">
              {STEPS.map((_, i) => (
                <div key={i} className="w-24 h-10 bg-neutral-300 rounded-t" />
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
      <div className={containerClassName}>
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
      <div className={containerClassName}>
        <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
          <div className="flex justify-center items-center w-full min-h-[400px]">
            <JobNotFound onGoBack={handleGoBack} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName} data-testid="job-details-component">
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
                    formatSalary={() => formattedSalary}
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