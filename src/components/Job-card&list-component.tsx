"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MdCurrencyRupee } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import Image from "next/image";

type Job = {
  job_id: string;
  job_title: string;
  company_name: string;
  min_salary: number | null;
  max_salary: number | null;
  job_location: string;
};

const JobListComponent = ({ jobsFromStore }: { jobsFromStore: Job[] }) => {
  const router = useRouter();
  const formatSalary = (min: number | null, max: number | null) => {
    if ((min === 0 || min === null) && (max === 0 || max === null))
      return "Salary not specified";
    if (min === max) return `${(min || 0).toLocaleString()}`;
    return `${(min || 0).toLocaleString()} - ${(max || 0).toLocaleString()}`;
  };
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="min-w-full text-left text">
          <thead className="bg-neutral-200 shadow-sm text-neutral-900 font-medium text-base">
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
                <td className="px-4 py-4 font-medium text-neutral-900">
                  {job.job_title}
                </td>
                <td className="px-4 py-4 text-neutral-900">
                  {job.company_name || "N/A"}
                </td>
                <td className="px-4 py-4 text-neutral-900">
                  {formatSalary(job.min_salary, job.max_salary)}
                </td>
                <td className="px-4 py-4 text-neutral-900">
                  {job.job_location || "N/A"}
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams({ jobId: job.job_id });
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
  );
};

type JobCardProps = {
  id: string;
  title: string;
  company_name: string;
  location: string;
  min_salary: number;
  max_salary: number;
  company_logo_url?: string;
};

const JobCard = ({ job }: { job: JobCardProps }) => {
  const router = useRouter();
  const formatSalary = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Salary not specified";
    if (min === max) return `${min.toLocaleString()}`;
    return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const handleCardClick = () => {
    const params = new URLSearchParams({ jobId: job.id });
    router.push(`jobs/job-details?${params.toString()}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm p-4 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group h-full flex flex-col"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          <Image
            src={job.company_logo_url || "/demo.png"}
            alt={`${job.company_name} logo`}
            width={56}
            height={56}
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/demo.png";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h2>
          <p className="text-sm text-neutral-500 mt-1 truncate">
            {job.company_name}
          </p>
        </div>
      </div>

      <div className="space-y-2 mt-auto">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg w-fit">
            <MdCurrencyRupee className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-neutral-600 truncate">
              {formatSalary(job.min_salary, job.max_salary)}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg w-fit">
            <IoLocationOutline className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-neutral-600 truncate">{job.location}</p>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <span className="text-neutral-800 font-medium group-hover:text-blue-600 transition-colors flex items-center gap-1">
            View Details <FaChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

export { JobListComponent, JobCard };
export type { JobCardProps };
