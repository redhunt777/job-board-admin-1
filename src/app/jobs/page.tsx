"use server";
import { createClient } from "@/utils/supabase/server"; // Use server client
import JobsClientComponent from "./JobsClientComponent";

export default async function JobsPage() {
  // Fetch jobs on the server side
  const supabase = await createClient();
  
  let jobs: Array<{
    admin_id: string
    application_deadline: string | null
    benefits: string[] | null
    company_logo_url: string | null
    company_name: string
    created_at: string | null
    job_description: string | null
    job_id: string
    job_location: string | null
    job_location_type: string | null
    job_title: string
    job_type: string | null
    max_experience_needed: number | null
    max_salary: number | null
    min_experience_needed: number | null
    min_salary: number | null
    requirements: string[] | null
    status: string | null
    updated_at: string | null
    working_type: string | null
  }> = [];

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(18);
    
    if (error) {
      console.error('Error fetching jobs:', error);
    } else if (data) {
      // Sanitize job data on server
      jobs = data.map(job => ({
        ...job,
        company_name: job.company_name ?? '', // replace null with empty string
      }));
    }
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
  }

  return <JobsClientComponent initialJobs={jobs} />;
}