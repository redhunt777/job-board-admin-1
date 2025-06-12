import { GoPlus } from "react-icons/go";
import { IoList } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";

// Loading skeleton component
export const JobCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center mb-4">
      <div className="w-14 h-14 bg-neutral-300 rounded-xl"></div>
      <div className="flex-1 ml-4">
        <div className="h-5 bg-neutral-300 rounded mb-2"></div>
        <div className="h-4 bg-neutral-300 rounded w-3/4"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-8 bg-neutral-300 rounded-lg w-32"></div>
      <div className="h-8 bg-neutral-300 rounded-lg w-24"></div>
    </div>
    <div className="mt-4">
      <div className="h-6 bg-neutral-300 rounded w-24 ml-auto"></div>
    </div>
  </div>
);

// Empty state component
export const EmptyState: React.FC<{ onAddJob: () => void }> = ({ onAddJob }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
      <IoList className="w-16 h-16 text-neutral-400" />
    </div>
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">No jobs found</h3>
    <p className="text-neutral-600 mb-6">Get started by adding your first job posting.</p>
    <button
      type="button"
      onClick={onAddJob}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 px-4 transition-colors cursor-pointer flex items-center gap-2"
    >
      <GoPlus className="h-5 w-5" />
      Add Your First Job
    </button>
  </div>
);

// Error state component
export const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">Error loading jobs</h3>
    <p className="text-neutral-600 mb-6">{error}</p>
    <button
      type="button"
      onClick={onRetry}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 px-4 transition-colors cursor-pointer"
    >
      Try Again
    </button>
  </div>
);

// Filter dropdown component
export const FilterDropdown: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ label, value, options, onChange, isOpen, onToggle }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center gap-1 font-medium cursor-pointer border border-neutral-500 px-4 py-2 rounded-3xl hover:border-neutral-700 transition-colors"
    >
      {value || label}
      <FaCaretDown className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
        <div className="py-2">
          <button
            onClick={() => {
              onChange('');
              onToggle();
            }}
            className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm"
          >
            All {label}
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);
