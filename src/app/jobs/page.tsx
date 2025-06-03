"use server";
import { createClient } from "@/utils/supabase/server"; // Use server client
import JobsClientComponent from "./JobsClientComponent";

export default async function JobsPage() {
  // Fetch jobs on the server side
  const supabase = await createClient();
  
  let jobs: Array<{
    job_id: string;
    admin_id: string;
    job_title: string;
    company_name: string;
    job_location: string;
    max_salary: number;
    min_salary: number;
    company_logo: string;
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
      jobs = data.map((job) => ({
        ...job,
        job_id: String(job.job_id),
        admin_id: String(job.admin_id),
        job_title: job.job_title || 'Untitled Job',
        company_name: job.company_name || 'Unknown Company',
        job_location: job.job_location || 'Remote',
        max_salary: job.max_salary ?? 0,
        min_salary: job.min_salary ?? 0,
        company_logo: job.company_logo_url || '/demo.png', 
      }));
    }
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
  }

  return <JobsClientComponent initialJobs={jobs} />;
}