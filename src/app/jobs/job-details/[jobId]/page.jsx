import { createClient } from "@/utils/supabase/server";
import JobDetailsClient from "../JobDetailsClient";
import Link from "next/link";

// Generate static params for the most recent jobs
export async function generateStaticParams() {
  const supabase = await createClient();

  try {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("job_id")
      .order("created_at", { ascending: false })
      .limit(10); // Pre-render the 10 most recent jobs

    return (
      jobs?.map((job) => ({
        jobId: job.job_id.toString(),
      })) || []
    );
  } catch (error) {
    console.error("Failed to fetch jobs for static generation:", error);
    return [];
  }
}

export async function revalidate() {
  return 1800;
}

export default async function JobDetailsPage({ params }) {
  const supabase = await createClient();
  const { jobId } = params;

  if (!jobId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Job Not Found
          </h1>
          <p className="text-neutral-600 mb-6">
            The job you are looking for does not exist or has been deleted.
          </p>
          <Link
            href="/jobs"
            className="text-blue-600 hover:underline font-semibold"
          >
            Go back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Fetch job details on the server
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("job_id", jobId)
    .single();

  if (jobError || !job) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Job Not Found
          </h1>
          <p className="text-neutral-600 mb-6">
            The job you are looking for does not exist or has been deleted.
          </p>
          <Link
            href="/jobs"
            className="text-blue-600 hover:underline font-semibold"
          >
            Go back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Fetch number of candidates
  const { count: candidateCount } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })
    .eq("job_id", jobId);

  // Transform job data for the client component
  const jobMetadata = {
    jobTitle: job.job_title,
    jobType: job.job_type,
    jobLocationType: job.job_location_type,
    jobLocation: job.job_location,
    workingType: job.working_type,
    experience: { min: job.experience_min, max: job.experience_max },
    salary: { min: job.max_salary, max: job.min_salary },
    companyName: job.company_name,
    jobDescription: job.job_description,
    company_logo_url: job.company_logo_url || "",
    jobAdmin: job.admin_id,
  };

  return (
    <JobDetailsClient
      initialJobMetadata={jobMetadata}
      initialCandidateCount={candidateCount || 0}
      jobId={jobId}
    />
  );
}
