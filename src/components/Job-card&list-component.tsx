"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { MdCurrencyRupee } from 'react-icons/md';
import { IoLocationOutline } from 'react-icons/io5';
import { FaChevronRight } from 'react-icons/fa';

type Job = {
  job_id: string;
  job_title: string;
  company_name: string;
  min_salary: number | null;
  max_salary: number | null;
  job_location: string;
};

const JobListComponent = ({jobsFromStore}: { jobsFromStore: Job[]}) => {
  const router = useRouter();
  const formatSalary = (min: number | null, max: number | null) => {
    if ((min === 0 || min === null) && (max === 0 || max === null)) return "Salary not specified";
    if (min === max) return `${(min || 0).toLocaleString()}`;
    return `${(min || 0).toLocaleString()} - ${(max || 0).toLocaleString()}`;
  };
  return (
      <div>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full text-left text">
            <thead className="bg-[#F0F1F1] shadow-sm text-[#151515] font-medium text-base">
              <tr>
                <th className="px-4 py-4">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-4">Job</th>
                <th className="px-4 py-4">Company</th>
                <th className="px-4 py-4">Salary</th>
                <th className="px-4 py-4">Location</th>
                <th className="px-4 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {jobsFromStore.map((job) => (
                <tr key={`job-row-${job.job_id}-${job.job_title}`}>
                  <td className="px-4 py-4">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-4 font-medium text-[#272833]">{job.job_title}</td>
                  <td className="px-4 py-4 text-[#272833]">{job.company_name || "N/A"}</td>
                  <td className="px-4 py-4 text-[#272833]">{formatSalary(job.min_salary, job.max_salary)}</td>
                  <td className="px-4 py-4 text-[#272833]">{job.job_location || "N/A"}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                    onClick={() => {
                      const params = new URLSearchParams({ jobId: job.job_id});
                      router.push(`jobs/job-details?${params.toString()}`);
                    }}
                      type="button" 
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  )
}


type JobCardProps = {
  id: string;
  title: string;
  company_name: string;
  location: string;
  min_salary: number;
  max_salary: number;
  company_logo_url?: string;
}

const JobCard = ({ job }: { job: JobCardProps }) => {
  const router = useRouter();
  console.log("JobCard job:", job);
  const formatSalary = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Salary not specified";
    if (min === max) return `${min.toLocaleString()}`;
    return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  };
  
  return (
        <div className="bg-white rounded-2xl shadow-sm p-3 md:p-6  hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <img
                src={job.company_logo_url || "/demo.png"}
                alt={`${job.company_name} logo`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/demo.png";
                }}
              />
            </div>
            <div className="flex-1 ml-4">
              <h2 className="text-xl font-semibold text-[#151515] line-clamp-2">{job.title}</h2>
              <p className="text-sm text-[#83858C] mt-1">{job.company_name}</p>
              <p className="text-sm text-[#83858C] mt-1 block md:hidden">{job.location}</p>
            </div>
          </div>
          <div className="space-y-2 hidden md:block">
            <div className="block">
              <div className="inline-flex items-center justify-start gap-2 bg-[#F0F1F1] px-4 py-2 rounded-lg">
                <MdCurrencyRupee className="w-5 h-5 text-[#1E5CDC]" />
                <p className="text-sm text-[#606167]">{formatSalary(job.min_salary, job.max_salary)}</p>
              </div>
            </div>
            <div className="block">
              <div className="inline-flex items-center justify-start gap-2 bg-[#F0F1F1] px-4 py-2 rounded-lg">
                <IoLocationOutline className="w-5 h-5 text-[#1E5CDC]" />
                <p className="text-sm text-[#606167]">{job.location}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              className="text-[#151515] mr-0 ml-auto font-medium text-sm py-2 flex items-center gap-2 cursor-pointer hover:text-[#1E5CDC] transition-colors"
              onClick={() => {
                const params = new URLSearchParams({ jobId: job.id });
                router.push(`jobs/job-details?${params.toString()}`);
              }}  
            >
              View Details <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      
  );
};

export { JobListComponent, JobCard };
export type { JobCardProps };