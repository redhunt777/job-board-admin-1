"use client";
import { SidebarContext } from "@/components/sidebar";
import { useContext, useState, useEffect } from "react";
import { GoPlus } from "react-icons/go";
import { IoList } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import Link from "next/link";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { MdCurrencyRupee } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Jobs() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("No sidebar context found");
  }
  const { collapsed } = context;
  const router = useRouter();

  const [viewMode, setViewMode] = useState("board"); // 'board' or 'list'

  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
      const fetchJobs = async () => {
        const supabase = createClient();
        // Fetch jobs from the Supabase database
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10); // Fetch only the latest 10 jobs
        if (error) {
          console.error('Error fetching jobs:', error);
        } else if (data) {
          // Sanitize job data
          // Ensure all fields are present and have default values if missing
          // Convert admin_id to string and provide default values for other fields
          // This is a basic sanitization, you can adjust it based on your requirements
          const sanitizedJobs = data.map((job) => ({
            ...job,
            job_id: job.job_id, 
            admin_id: String(job.admin_id),
            job_title: job.job_title || 'Untitled Job',
            company_name: job.company_name || 'Unknown Company',
            job_location: job.job_location || 'Remote',
            max_salary: job.max_salary,
            min_salary: job.min_salary
          }));
          setJobs(sanitizedJobs);
        }
      };

      fetchJobs();
    }, []);

    const handleAddJob = async () => {
      router.push("/jobs/add-job");
    }

  return (
    <div
      className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}
    >
      <div className="mt-4 px-2 md:px-4 py-4 ">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-semibold text-lg"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <p>Back to Dashboard</p>
          </Link>
          <span className="text-lg text-neutral-300">/</span>
          <span className="text-lg font-bold text-neutral-900">Jobs</span>
        </div>

        <div className="flex items-center justify-between my-6 ">
          <div>
            <h1 className="text-2xl font-semibold text-[#151515]">
              Manage All Jobs
            </h1>
            <p className="text-sm text-[#606167] mt-2">
              Manage your job listings and applications with ease.
            </p>
          </div>
          <div>
            <button
              type="submit"
              onClick={handleAddJob}
              aria-label="Add Job"
              className="bg-blue-600 hover:bg-blue-700 text-white sm:font-medium sm:text-xl rounded-lg py-2 transition-colors cursor-pointer px-5 flex items-center gap-2"
            >
              <span>
                <GoPlus className="h-8 w-8" />
              </span>
              Add Job
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex item-center justify-center gap-2">
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-3xl text-sm transition-colors ${
                viewMode === "board"
                  ? "bg-[#1E5CDC] text-white hover:bg-[#1A4BB0]"
                  : "border border-[#606167] text-[#606167] hover:text-[#4B5563]"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.16696 1.06244C6.37649 1.26006 5.75356 1.94743 5.64187 2.7422C5.59031 3.12025 5.58602 10.5051 5.63757 10.8617C5.65905 11.0035 5.68912 11.171 5.70631 11.2355L5.73638 11.3557H4.29721C3.41222 11.3557 2.76352 11.3729 2.62605 11.403C1.84417 11.5663 1.19547 12.2321 1.04511 13.0269C0.984964 13.3405 0.984964 21.0132 1.04511 21.3268C1.19547 22.1173 1.84847 22.7875 2.62605 22.9507C2.785 22.9851 4.88576 22.998 9.71451 22.998C17.1381 22.998 16.7944 23.0066 17.2798 22.7746C17.8039 22.5211 18.2722 21.8681 18.3581 21.2581C18.4097 20.8801 18.414 13.4952 18.3624 13.1386C18.341 12.9968 18.3109 12.8293 18.2937 12.7606L18.2636 12.6446H19.7028C20.5878 12.6446 21.2365 12.6274 21.374 12.5973C22.1429 12.4383 22.8088 11.751 22.9549 10.9734C23.015 10.6598 23.015 2.98707 22.9549 2.67346C22.8088 1.88728 22.1515 1.21281 21.374 1.04956C21.026 0.976524 7.45909 0.989412 7.16696 1.06244ZM16.4679 6.82343V11.3557H11.9785C7.65671 11.3557 7.48057 11.3515 7.32591 11.2741C7.23999 11.2312 7.13259 11.1538 7.08963 11.1066C6.89201 10.8875 6.89201 10.9133 6.88772 6.84491C6.88772 4.32743 6.9049 2.94411 6.93068 2.841C6.98653 2.63909 7.14118 2.45436 7.32591 2.36414C7.45479 2.2997 7.91447 2.29111 11.9699 2.29111H16.4679V6.82343ZM21.2236 2.33837C21.3954 2.40281 21.5372 2.54458 21.6274 2.7422C21.7047 2.90545 21.709 3.11165 21.709 6.82343C21.709 10.5352 21.7047 10.7414 21.6274 10.9047C21.5372 11.1023 21.3954 11.2441 21.2236 11.3085C21.1463 11.3386 20.5104 11.3557 19.4278 11.3557H17.7567V6.82343V2.29111H19.4278C20.5104 2.29111 21.1463 2.3083 21.2236 2.33837ZM11.8711 17.1769V21.7092H7.38606C4.3101 21.7092 2.85804 21.6963 2.77641 21.6619C2.60457 21.5975 2.4628 21.4557 2.37258 21.2581C2.29525 21.0949 2.29096 20.8844 2.29096 17.1855C2.29096 12.9625 2.28237 13.1214 2.51865 12.8637C2.72486 12.6403 2.54013 12.6489 7.37317 12.6446H11.8711V17.1769ZM16.7815 12.7863C17.1123 13.0398 17.0908 12.709 17.0908 17.1769C17.0908 21.6448 17.1123 21.314 16.7815 21.5674L16.6268 21.6877L14.8912 21.7006L13.1599 21.7135V17.1769V12.6403L14.8912 12.6532L16.6268 12.666L16.7815 12.7863Z"
                  fill={viewMode === "board" ? "white" : "#606167"}
                />
              </svg>
              Board
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-3xl text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-[#1E5CDC] text-white hover:bg-[#1A4BB0]"
                  : "border border-[#606167] text-[#606167] hover:text-[#4B5563]"
              }`}
            >
              <IoList className="w-5 h-5" />
              List
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-[#606167]">
            <div className="flex items-center gap-2 justify-center border-r border-[#606167] pr-2">
              <div className="flex items-center gap-1 font-medium cursor-pointer border border-[#606167] px-4 py-2 rounded-3xl">
                Job Status
                <span>
                  <FaCaretDown className="w-5 h-5 text-[#606167]" />
                </span>
              </div>
              <div className="flex items-center gap-1 font-medium cursor-pointer border border-[#606167] px-4 py-2 rounded-3xl">
                Job Location
                <span>
                  <FaCaretDown className="w-5 h-5 text-[#606167]" />
                </span>
              </div>
              <div className="flex items-center gap-1 font-medium cursor-pointer border border-[#606167] px-4 py-2 rounded-3xl">
                Company
                <span>
                  <FaCaretDown className="w-5 h-5 text-[#606167]" />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-medium cursor-pointer bg-[#E5E6E8] px-4 py-2 rounded-3xl">
              <span>
                <CiFilter className="w-5 h-5 text-[#606167]" />
              </span>
              All Filters
            </div>
          </div>
        </div>
            <div className={`grid ${viewMode === "board" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
          {(jobs ?? []).map((job) => (
            <JobCard
              key={job.job_id}
              job={{
                id: Number(job.job_id), 
                title: job.job_title ?? "",
                company: job.company_name ?? "",
                location: job.job_location ?? "",
                min_salary: job.min_salary ?? "",
                max_salary: job.max_salary ?? "",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  min_salary: number;
  max_salary: number;
};

const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Image
            src="/demo.png"
            alt="company logo"
            width={56}
            height={56}
            className="w-14 h-14 rounded-xl"
          />
        </div>
        <div className="flex-1 ml-4">
          <h2 className="text-xl font-semibold text-[#151515]">{job.title}</h2>
          <p className="text-sm text-[#83858C]">{job.company}</p>
        </div>
      </div>
      <div>
        <div className="inline-flex items-center justify-center gap-2 mb-2 bg-[#F0F1F1] px-4 py-2 rounded-lg">
          <span>
            <MdCurrencyRupee className="w-5 h-5 text-[#1E5CDC]" />
          </span>
          <p className="text-sm text-[#606167]">${job.min_salary}-${job.max_salary}</p>
        </div>
      </div>
      <div>
        <div className="inline-flex items-center justify-center gap-2 mb-4 bg-[#F0F1F1] px-4 py-2 rounded-lg">
          <span>
            <IoLocationOutline className="w-5 h-5 text-[#1E5CDC]" />
          </span>
          <p className="text-sm text-[#606167]">{job.location}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-[#151515] mr-0 ml-auto font-medium text-sm py-2 flex items-center gap-2"
          onClick={() => alert(`Viewing details for ${job.title}`)}
        >
          View Details <FaChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
