import { IoCloseSharp, IoPersonCircleSharp } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { memo, useCallback } from "react";

type candidates = {
  id: string;
  appliedDate: string;
  name: string;
  email: string;
  job: string;
  company: string;
  location: string;
  experience: number;
  currentctc: number;
  expectedctc: number;
  status: string;
};

// Memoized candidate header component
const CandidateHeader = memo(
  ({
    candidate,
    onClose,
  }: {
    candidate: candidates | null;
    onClose: () => void;
  }) => (
    <div className="p-6 border-b border-neutral-200">
      <div className="flex items-center gap-4 mb-4">
        <IoPersonCircleSharp className="w-16 h-16 text-neutral-500" />
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            {candidate?.name}
          </h2>
          <p className="text-neutral-500">Job Application: {candidate?.job}</p>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap">
        <div className="pr-4">
          <span className="font-semibold">ID</span>
          <div className="text-neutral-500">2556454</div>
        </div>
        <div className="relative inline-block w-48 cursor-pointer">
          <select className="bg-neutral-100 w-full h-full rounded-md px-3 py-2 text-neutral-800 focus:outline-none appearance-none cursor-pointer">
            <option value="">Select Job Status</option>
            <option value="applied">Applied</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
          <FaAngleDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
        </div>
        <button
          onClick={() => "message functionality to be implemented"}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Message
        </button>
        <button
          className="border border-red-700 hover:border-red-800 transition-colors px-4 py-2 rounded-md cursor-pointer"
          onClick={onClose}
        >
          <FaRegTrashAlt className="w-6 h-6 text-red-700 hover:text-red-800 transition-colors" />
        </button>
      </div>
    </div>
  )
);

CandidateHeader.displayName = "CandidateHeader";

// Memoized resume section component
const ResumeSection = memo(
  ({ candidateName }: { candidateName: string | undefined }) => (
    <div className="mb-6">
      <div className="font-semibold text-lg text-blue-700 mb-2">Resume</div>
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="bg-neutral-100 flex items-center gap-2 rounded-lg cursor-pointer pr-4 transition-colors"
        >
          <div className="text-white bg-red-700 py-6 px-3 rounded-l-lg">
            PDF
          </div>
          <div className="text-neutral-800 font-semibold">
            {`${candidateName}.pdf` || "Resume"}
            <div className="text-neutral-400 text-sm font-normal">844 KB</div>
          </div>
          <div>
            <FiDownload className="h-6 w-6 mx-2 text-neutral-800" />
          </div>
        </a>
      </div>
    </div>
  )
);

ResumeSection.displayName = "ResumeSection";

// Memoized personal details component
const PersonalDetails = memo(
  ({ candidate }: { candidate: candidates | null }) => (
    <div>
      <div className="font-semibold text-lg text-blue-700 mb-2">
        Personal Details
      </div>
      <div className="grid grid-cols-3 gap-4 text-xs text-neutral-700">
        <div>
          <div className="font-medium text-sm text-neutral-800">Full Name</div>{" "}
          {candidate?.name || "N/A"}
        </div>
        <div>
          <div className="font-medium text-sm text-neutral-800">Email</div>{" "}
          {candidate?.email || "N/A"}
        </div>
        <div>
          <div className="font-medium text-sm text-neutral-800">
            Mobile Number
          </div>{" "}
          {"N/A"}
        </div>
        <div>
          <div className="font-medium text-sm text-neutral-800">
            Date of Birth
          </div>{" "}
          {"N/A"}
        </div>
        <div>
          <div className="font-medium text-sm text-neutral-800">Address</div>{" "}
          {"N/A"}
        </div>
      </div>
    </div>
  )
);

PersonalDetails.displayName = "PersonalDetails";

// Memoized experience details component
const ExperienceDetails = memo(() => (
  <div className="mt-6">
    <div className="font-semibold text-lg text-blue-700 mb-2">
      Experience Details
    </div>
    <div className="flex gap-4 text-sm text-neutral-700 items-center">
      <div>
        <img src="/demo.png" alt="company_logo" className="h-10 w-10" />
      </div>
      <div>
        <div className="font-medium text-neutral-800">UI/UX Designer</div>
        <div className="text-neutral-600">Company Name</div>
        <div className="text-xs text-neutral-400">Oct 2024 - Dec 2024</div>
      </div>
    </div>
  </div>
));

ExperienceDetails.displayName = "ExperienceDetails";

const CandidatesDetailsOverlay = memo(
  ({
    candidatesDetailsOverlay,
    setCandidatesDetailsOverlay,
  }: {
    candidatesDetailsOverlay: { candidate: candidates | null; show: boolean };
    setCandidatesDetailsOverlay: React.Dispatch<
      React.SetStateAction<{ candidate: candidates | null; show: boolean }>
    >;
  }) => {
    const handleClose = useCallback(() => {
      setCandidatesDetailsOverlay({ candidate: null, show: false });
    }, [setCandidatesDetailsOverlay]);

    if (!candidatesDetailsOverlay.show) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl relative">
          <button
            className="absolute top-4 right-4 text-neutral-500 mx-6 hover:text-neutral-700 cursor-pointer"
            onClick={handleClose}
          >
            <IoCloseSharp className="w-8 h-8 text-neutral-800" />
          </button>

          <CandidateHeader
            candidate={candidatesDetailsOverlay.candidate}
            onClose={handleClose}
          />

          <div className="p-6">
            <ResumeSection
              candidateName={candidatesDetailsOverlay.candidate?.name}
            />
            <PersonalDetails candidate={candidatesDetailsOverlay.candidate} />
            <ExperienceDetails />
          </div>
        </div>
      </div>
    );
  }
);

CandidatesDetailsOverlay.displayName = "CandidatesDetailsOverlay";

export default CandidatesDetailsOverlay;
