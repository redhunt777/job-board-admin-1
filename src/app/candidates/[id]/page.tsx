"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import Link from "next/link";
import { 
  fetchJobApplicationsWithAccess, 
  selectCandidatesLoading, 
  selectCandidatesError,
  selectUserContext,
  selectFilteredCandidatesWithAccess,
  CandidateWithApplication
} from "@/store/features/candidatesSlice";

export default function CandidateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;
  const dispatch = useAppDispatch();

  const [candidate, setCandidate] = useState<CandidateWithApplication | null>(null);
  const loading = useAppSelector(selectCandidatesLoading);
  const error = useAppSelector(selectCandidatesError);
  const userContext = useAppSelector(selectUserContext);
  const candidates = useAppSelector(selectFilteredCandidatesWithAccess);
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);

  useEffect(() => {
    if (userContext && candidates.length === 0 && !loading && !error) {
      dispatch(
        fetchJobApplicationsWithAccess({
          filters: {},
          userContext: userContext,
        })
      );
    }
  }, [userContext, candidates.length, loading, error, dispatch]);

  useEffect(() => {
    if (candidates.length > 0 && candidateId) {
      const foundCandidate = candidates.find(
        (c) => c.application_id.includes(candidateId)
      );
      setCandidate(foundCandidate || null);
    }
  }, [candidates, candidateId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-6 ${collapsed ? "md:ml-20" : "md:ml-60"} pt-4`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-neutral-600">Loading candidate details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-6 ${collapsed ? "md:ml-20" : "md:ml-60"} pt-4`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Candidate</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-6 ${collapsed ? "md:ml-20" : "md:ml-60"} pt-4`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">Candidate Not Found</h2>
            <p className="text-yellow-600">The candidate you're looking for could not be found.</p>
            <Link 
              href="/candidates"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Candidates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 h-full px-3 md:px-6 ${collapsed ? "md:ml-20" : "md:ml-60"} pt-4`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/candidates"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-medium transition-colors"
          >
            <HiOutlineArrowCircleLeft className="w-5 h-5 mr-1" />
            <span>Back to Candidates</span>
          </Link>
        </div>

        {/* Candidate Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
              <div className="text-gray-600 mt-1">
                <p>{candidate.candidate_email}</p>
                {candidate.mobile_number && <p>{candidate.mobile_number}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium 
                ${candidate.application_status === "accepted" ? "bg-green-100 text-green-800 border border-green-200" : 
                  candidate.application_status === "rejected" ? "bg-red-100 text-red-800 border border-red-200" : 
                  "bg-yellow-100 text-yellow-800 border border-yellow-200"}`}>
                {candidate.application_status.charAt(0).toUpperCase() + candidate.application_status.slice(1)}
              </div>
              {candidate.resume_link && (
                <a 
                  href={candidate.resume_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Download Resume
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Personal Details */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{candidate.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{candidate.candidate_email}</p>
                </div>
                
                {candidate.mobile_number && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{candidate.mobile_number}</p>
                  </div>
                )}
                
                {candidate.address && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{candidate.address}</p>
                  </div>
                )}
                
                {candidate.gender && (
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900">{candidate.gender}</p>
                  </div>
                )}
                
                {candidate.dob && (
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium text-gray-900">{formatDate(candidate.dob)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Middle Column - Application Details */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Job Title</p>
                  <p className="font-medium text-gray-900">{candidate.job_title}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{candidate.company_name || "Not specified"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Application ID</p>
                  <p className="font-medium text-gray-900">{candidate.application_id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Applied Date</p>
                  <p className="font-medium text-gray-900">{formatDate(candidate.applied_date)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                    ${candidate.application_status === "accepted" ? "bg-green-100 text-green-800 border border-green-200" : 
                      candidate.application_status === "rejected" ? "bg-red-100 text-red-800 border border-red-200" : 
                      "bg-yellow-100 text-yellow-800 border border-yellow-200"}`}>
                    {candidate.application_status.charAt(0).toUpperCase() + candidate.application_status.slice(1)}
                  </div>
                </div>
                
                {candidate.notice_period && (
                  <div>
                    <p className="text-sm text-gray-500">Notice Period</p>
                    <p className="font-medium text-gray-900">{candidate.notice_period}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Professional Details */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
              
              <div className="space-y-4">
                {candidate.current_ctc !== null && (
                  <div>
                    <p className="text-sm text-gray-500">Current CTC</p>
                    <p className="font-medium text-gray-900">{candidate.current_ctc}</p>
                  </div>
                )}
                
                {candidate.expected_ctc !== null && (
                  <div>
                    <p className="text-sm text-gray-500">Expected CTC</p>
                    <p className="font-medium text-gray-900">{candidate.expected_ctc}</p>
                  </div>
                )}
                
                {candidate.linkedin_url && (
                  <div>
                    <p className="text-sm text-gray-500">LinkedIn</p>
                    <a 
                      href={candidate.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View Profile
                    </a>
                  </div>
                )}
                
                {candidate.portfolio_url && (
                  <div>
                    <p className="text-sm text-gray-500">Portfolio</p>
                    <a 
                      href={candidate.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View Portfolio
                    </a>
                  </div>
                )}
                
                {candidate.resume_link && (
                  <div>
                    <p className="text-sm text-gray-500">Resume</p>
                    <a 
                      href={candidate.resume_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Experience Section */}
        {candidate.experience && candidate.experience.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
            
            <div className="space-y-6">
              {candidate.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4 pb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{exp.job_title}</h3>
                      <p className="text-gray-600">{exp.company_name}</p>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 md:mt-0">
                      {exp.start_date && formatDate(exp.start_date)} - {exp.currently_working ? "Present" : exp.end_date ? formatDate(exp.end_date) : "N/A"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Education Section */}
        {candidate.education && candidate.education.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
            
            <div className="space-y-6">
              {candidate.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4 pb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.college_university}</p>
                      {edu.field_of_study && <p className="text-gray-500 text-sm">{edu.field_of_study}</p>}
                      {edu.grade_percentage && <p className="text-gray-500 text-sm">Grade: {edu.grade_percentage}</p>}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 md:mt-0">
                      {edu.start_date && formatDate(edu.start_date)} - {edu.is_current ? "Present" : edu.end_date ? formatDate(edu.end_date) : "N/A"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
} 