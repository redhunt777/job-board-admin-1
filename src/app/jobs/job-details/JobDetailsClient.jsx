"use client";

import { useState } from "react";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { GrLocation } from "react-icons/gr";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { FiEdit3 } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";

const steps = ["Job Details", "Candidates", "Settings"];

export default function JobDetailsClient({ initialJobMetadata, initialCandidateCount, jobId }) {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  const [jobMetadata] = useState(initialJobMetadata);
  const [number_of_candidates] = useState(initialCandidateCount);
  const handleDeleteJob = async () => {
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;
    if (authError || !user) {
      alert("Authentication error. Please log in again.");
      return;
    }
    if (jobMetadata.jobAdmin !== user.id) {
      alert("Only the job creator can delete the job");
       return;
     }
    if (
      !confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }
    const { error } = await supabase.from("jobs").delete().eq("job_id", jobId);
    if (error) {
      console.log("Error deleting job:", error);
      return;
    }
    console.log("Job deleted successfully");
    alert("Job deleted successfully");
    router.push("/jobs");
  };

  return (
    <div
      className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}
    >
      <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-semibold text-lg"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-neutral-300">/</span>
          <Link
            href="/jobs"
            className="text-neutral-500 hover:text-neutral-700 font-semibold text-lg"
          >
            Jobs
          </Link>
          <span className="text-lg text-neutral-300">/</span>
          <span className="text-lg font-semibold text-neutral-900">
            {jobMetadata.jobTitle}
          </span>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="flex gap-4 border-b border-neutral-300 w-fit">
            {steps.map((s, i) => (
              <button
                key={s}
                className={`px-4 py-2 text-center font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  i === step
                    ? "border-b-4 border-blue-600 text-blue-600"
                    : "text-neutral-500"
                }`}
                onClick={() => setStep(i)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center w-full">
          <div className="max-w-5xl w-full pb-20">
            {step === 0 && (
              <div>
                <div className="flex gap-8 mb-8 items-center">
                  <img
                    src={jobMetadata.company_logo_url || "/demo.png"}
                    alt="company_logo"
                    className="w-24 h-24 rounded-2xl"
                  />
                  <div>
                    <span className="block text-2xl font-semibold text-neutral-900 ">
                      {jobMetadata.jobTitle}
                    </span>
                    <span className="block text-neutral-500">
                      {jobMetadata.companyName}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row mb-6 justify-between items-end">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {jobMetadata.jobType && (
                        <>
                          <span className="text-neutral-500 text-sm font-normal bg-neutral-100 px-3 py-2 rounded-lg mr-4">
                            {jobMetadata.jobType}
                          </span>
                          <span className="text-neutral-500 text-sm font-normal bg-neutral-100 px-3 py-2 rounded-lg mr-4">
                            {jobMetadata.jobLocationType}
                          </span>
                          <span className="text-neutral-500 text-sm font-normal bg-neutral-100 px-3 py-2 rounded-lg mr-4">
                            {jobMetadata.workingType}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobMetadata.jobLocation && (
                        <>
                          <span className="text-neutral-500 text-sm font-normal bg-neutral-100 px-3 py-2 rounded-lg mr-4">
                            <GrLocation className="inline text-blue-600 text-xl mr-1" />
                            {jobMetadata.jobLocation}
                          </span>
                          <span className="text-neutral-500 text-sm font-normal bg-neutral-100 px-3 py-2 rounded-lg mr-4">
                            <LiaRupeeSignSolid className="text-blue-600 inline text-xl mr-1" />
                            {jobMetadata.salary.max} - {jobMetadata.salary.min}
                          </span>
                          <span className="text-neutral-500 text-sm font-normal bg-neutral-100 px-3 py-2 rounded-lg mr-4">
                            <MdOutlinePeopleAlt className="inline text-blue-600 text-xl mr-1" />
                            {number_of_candidates} Applicants
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-4">
                    <div className="relative inline-block w-24">
                      <select
                        className={`appearance-none w-full text-sm font-normal px-3 py-2 rounded-lg bg-green-100 text-green-700 focus:outline-none focus:ring-2 focus:ring-green-700 transition-colors`}
                      >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="hold on">Hold on</option>
                      </select>
                      <FaCaretDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black pointer-events-none" />
                    </div>
                    <Link
                      href={`/jobs/job-details/${jobId}/edit`}
                      className="text-white text-sm font-normal bg-blue-600 px-3 py-2 rounded-lg"
                    >
                      <FiEdit3 className="inline mr-2 h-5 w-5" />
                      Edit Job
                    </Link>
                    <button
                      className="text-neutral-500 text-sm font-normal bg-neutral-100 px-3 py-2 rounded-lg"
                      onClick={() => {
                        alert("share functionality is not implemented yet.");
                      }}
                    >
                      <FiShare2 className="inline mr-2 h-5 w-5" />
                      Share
                    </button>
                    <button
                      className="text-white text-sm font-semibold bg-red-600 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
                      onClick={handleDeleteJob}
                      type="button"
                    >
                      <FaRegTrashAlt className="h-5 w-5 inline mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="my-6">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                    Job Description
                  </h2>
                  <p className="text-neutral-500 text-sm font-normal">
                    {jobMetadata.jobDescription || "No job description provided."}
                  </p>
                </div>
              </div>
            )}
            {step === 1 && <>Candidates Register</>}
            {step === 2 && <>Settings</>}
          </div>
        </div>
      </div>
    </div>
  );
} 