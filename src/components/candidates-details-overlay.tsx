import { IoCloseSharp, IoPersonCircleSharp } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa6";
import { FaRegTrashAlt, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase } from "react-icons/fa";
import { FiDownload, FiMail, FiClock } from "react-icons/fi";
import { memo, useCallback, useState } from "react";
import { CandidateWithApplication } from "@/store/features/candidatesSlice";

// Memoized candidate header component
const CandidateHeader = memo(
  ({
    candidate,
    onClose,
    onStatusUpdate,
  }: {
    candidate: CandidateWithApplication | null;
    onClose: () => void;
    onStatusUpdate: (applicationId: string, status: string) => void;
  }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
      if (!candidate || isUpdating || newStatus === candidate.application_status) return;
      
      setIsUpdating(true);
      try {
        await onStatusUpdate(candidate.application_id, newStatus);
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-4 mb-4">
          <IoPersonCircleSharp className="w-16 h-16 text-neutral-500" />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-neutral-900">
              {candidate?.name}
            </h2>
            <p className="text-neutral-500 mb-1">
              Applied for: {candidate?.job_title}
            </p>
            {candidate?.company_name && (
              <p className="text-sm text-neutral-400">
                at {candidate.company_name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap items-center">
          <div className="pr-4">
            <span className="font-semibold text-sm text-neutral-600">Application ID</span>
            <div className="text-neutral-800 font-mono text-sm">
              {candidate?.application_id.slice(-8) || "N/A"}
            </div>
          </div>
          
          <div className="relative inline-block w-48">
            <select 
              className="bg-neutral-100 w-full h-full rounded-md px-3 py-2 text-neutral-800 focus:outline-none appearance-none cursor-pointer disabled:opacity-50"
              value={candidate?.application_status || ""}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <FaAngleDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 pointer-events-none" />
          </div>
          
          <button
            onClick={() => window.open(`mailto:${candidate?.candidate_email}`, '_blank')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
          >
            <FiMail className="w-4 h-4" />
            Email
          </button>
          
          <button
            className="border border-red-700 hover:border-red-800 transition-colors px-4 py-2 rounded-md cursor-pointer flex items-center gap-2"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this application?')) {
                // Handle deletion logic here
                onClose();
              }
            }}
          >
            <FaRegTrashAlt className="w-4 h-4 text-red-700" />
            Delete
          </button>
        </div>
      </div>
    );
  }
);

CandidateHeader.displayName = "CandidateHeader";

// Memoized resume section component
const ResumeSection = memo(
  ({ candidate }: { candidate: CandidateWithApplication | null }) => (
    <div className="mb-6">
      <div className="font-semibold text-lg text-blue-700 mb-3 flex items-center gap-2">
        <FiDownload className="w-5 h-5" />
        Resume & Documents
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-neutral-100 flex items-center gap-2 rounded-lg cursor-pointer pr-4 transition-colors hover:bg-neutral-200">
          <div className="text-white bg-red-700 py-4 px-3 rounded-l-lg">
            PDF
          </div>
          <div className="text-neutral-800 font-semibold">
            {candidate?.name ? `${candidate.name}_Resume.pdf` : "Resume.pdf"}
            <div className="text-neutral-400 text-sm font-normal">Download Resume</div>
          </div>
          <FiDownload className="h-5 w-5 mx-2 text-neutral-600" />
        </div>
      </div>
    </div>
  )
);

ResumeSection.displayName = "ResumeSection";

// Memoized personal details component
const PersonalDetails = memo(
  ({ candidate }: { candidate: CandidateWithApplication | null }) => (
    <div className="mb-6">
      <div className="font-semibold text-lg text-blue-700 mb-3 flex items-center gap-2">
        <IoPersonCircleSharp className="w-5 h-5" />
        Personal Details
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <FiMail className="w-4 h-4 text-neutral-500 mt-1" />
          <div>
            <div className="font-medium text-sm text-neutral-800 mb-1">Email Address</div>
            <div className="text-sm text-neutral-600">{candidate?.candidate_email || "N/A"}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <FaPhone className="w-4 h-4 text-neutral-500 mt-1" />
          <div>
            <div className="font-medium text-sm text-neutral-800 mb-1">Phone Number</div>
            <div className="text-sm text-neutral-600">{candidate?.mobile_number || "N/A"}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <FaMapMarkerAlt className="w-4 h-4 text-neutral-500 mt-1" />
          <div>
            <div className="font-medium text-sm text-neutral-800 mb-1">Location</div>
            <div className="text-sm text-neutral-600">
              {candidate?.address || candidate?.job_location || "N/A"}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <FaCalendarAlt className="w-4 h-4 text-neutral-500 mt-1" />
          <div>
            <div className="font-medium text-sm text-neutral-800 mb-1">Applied Date</div>
            <div className="text-sm text-neutral-600">
              {candidate?.applied_date 
                ? new Date(candidate.applied_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : "N/A"
              }
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <FiClock className="w-4 h-4 text-neutral-500 mt-1" />
          <div>
            <div className="font-medium text-sm text-neutral-800 mb-1">Notice Period</div>
            <div className="text-sm text-neutral-600">{candidate?.notice_period || "N/A"}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <FaBriefcase className="w-4 h-4 text-neutral-500 mt-1" />
          <div>
            <div className="font-medium text-sm text-neutral-800 mb-1">Gender</div>
            <div className="text-sm text-neutral-600">{candidate?.gender || "N/A"}</div>
          </div>
        </div>
      </div>
    </div>
  )
);

PersonalDetails.displayName = "PersonalDetails";

// Memoized salary details component
const SalaryDetails = memo(
  ({ candidate }: { candidate: CandidateWithApplication | null }) => (
    <div className="mb-6">
      <div className="font-semibold text-lg text-blue-700 mb-3">
        Salary Information
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="font-medium text-sm text-green-800 mb-1">Current CTC</div>
          <div className="text-lg font-semibold text-green-700">
            {candidate?.current_ctc ? `₹${candidate.current_ctc}L` : "Not specified"}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="font-medium text-sm text-blue-800 mb-1">Expected CTC</div>
          <div className="text-lg font-semibold text-blue-700">
            {candidate?.expected_ctc ? `₹${candidate.expected_ctc}L` : "Not specified"}
          </div>
        </div>
      </div>
    </div>
  )
);

SalaryDetails.displayName = "SalaryDetails";

// Memoized job details component
const JobDetails = memo(
  ({ candidate }: { candidate: CandidateWithApplication | null }) => (
    <div className="mb-6">
      <div className="font-semibold text-lg text-blue-700 mb-3">
        Job Requirements
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-medium text-sm text-neutral-800 mb-1">Position</div>
          <div className="text-sm text-neutral-600">{candidate?.job_title || "N/A"}</div>
        </div>
        
        <div>
          <div className="font-medium text-sm text-neutral-800 mb-1">Company</div>
          <div className="text-sm text-neutral-600">{candidate?.company_name || "N/A"}</div>
        </div>
        
        <div>
          <div className="font-medium text-sm text-neutral-800 mb-1">Experience Required</div>
          <div className="text-sm text-neutral-600">
            {candidate?.min_experience_needed && candidate?.max_experience_needed
              ? `${candidate.min_experience_needed}-${candidate.max_experience_needed} years`
              : "N/A"
            }
          </div>
        </div>
        
        <div>
          <div className="font-medium text-sm text-neutral-800 mb-1">Job Location</div>
          <div className="text-sm text-neutral-600">{candidate?.job_location || "N/A"}</div>
        </div>
      </div>
    </div>
  )
);

JobDetails.displayName = "JobDetails";

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

const CandidatesDetailsOverlay = memo(
  ({
    candidatesDetailsOverlay,
    setCandidatesDetailsOverlay,
    onStatusUpdate,
  }: {
    candidatesDetailsOverlay: { candidate: CandidateWithApplication | null; show: boolean };
    setCandidatesDetailsOverlay: React.Dispatch<
      React.SetStateAction<{ candidate: CandidateWithApplication | null; show: boolean }>
    >;
    onStatusUpdate?: (applicationId: string, status: string) => void;
  }) => {
    const handleClose = useCallback(() => {
      setCandidatesDetailsOverlay({ candidate: null, show: false });
    }, [setCandidatesDetailsOverlay]);

    const handleStatusUpdate = useCallback(async (applicationId: string, status: string) => {
      if (onStatusUpdate) {
        await onStatusUpdate(applicationId, status);
      }
    }, [onStatusUpdate]);

    if (!candidatesDetailsOverlay.show || !candidatesDetailsOverlay.candidate) return null;

    const candidate = candidatesDetailsOverlay.candidate;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
          <button
            className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700 cursor-pointer z-10 bg-white rounded-full p-1 shadow-sm"
            onClick={handleClose}
          >
            <IoCloseSharp className="w-6 h-6 text-neutral-800" />
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            <CandidateHeader
              candidate={candidate}
              onClose={handleClose}
              onStatusUpdate={handleStatusUpdate}
            />

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-neutral-900">Application Details</h3>
                <StatusBadge status={candidate.application_status} />
              </div>

              <ResumeSection candidate={candidate} />
              <PersonalDetails candidate={candidate} />
              <SalaryDetails candidate={candidate} />
              <JobDetails candidate={candidate} />
              
              {/* Additional Notes Section */}
              <div>
                <div className="font-semibold text-lg text-blue-700 mb-3">
                  Additional Information
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {"No additional information provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CandidatesDetailsOverlay.displayName = "CandidatesDetailsOverlay";

export default CandidatesDetailsOverlay;