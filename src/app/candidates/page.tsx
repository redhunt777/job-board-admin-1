"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { GoPlus } from "react-icons/go";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import Link from "next/link";
import CandidatesList from "@/components/candidates_list_component";
import {
  fetchJobApplications,
  clearError,
  selectCandidatesError,
  CandidateWithApplication,
} from "@/store/features/candidatesSlice";

export default function Candidates() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  const error = useAppSelector(selectCandidatesError);
  const router = useRouter();
  
  const handleAddJob = () => {
    router.push("/jobs/add-job");
  };

  // Load candidates on component mount
  useEffect(() => {
    dispatch(fetchJobApplications({}));
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Handle candidate click (optional - for future use)
  const handleCandidateClick = (candidate: CandidateWithApplication) => {
    // You can implement navigation to candidate detail page here
    console.log("Candidate clicked:", candidate);
  };

  return (
    <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
      <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
        {/* Back Navigation and Title */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-500 hover:text-gray-700 font-semibold text-lg transition-colors"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-gray-300 font-light">/</span>
          <span className="text-lg font-bold text-gray-900">Candidates</span>
        </div>

        {/* Add jobs button */}
        <div className="flex items-center justify-between my-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#151515]">
              All Candidates
            </h1>
            <p className="text-sm text-[#606167] mt-2">
              Manage all candidates and their applications with ease.
            </p> 
          </div>
          <div>
            <button
              type="button"
              onClick={handleAddJob}
              aria-label="Add Job"
              className="bg-blue-600 hover:bg-blue-700 text-white sm:font-medium sm:text-xl rounded-lg py-2 transition-colors cursor-pointer px-5 flex items-center gap-2"
            >
              <GoPlus className="h-8 w-8" />
              Add Job
            </button>
          </div>
        </div>

        {/* Candidates List Component */}
        <CandidatesList
          showHeader={false} // We're showing our own header above
          showFilters={true}
          showPagination={true}
          showSorting={true}
          onCandidateClick={handleCandidateClick}
        />
      </div>
    </div>
  );
}