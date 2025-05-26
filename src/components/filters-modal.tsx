import { RxCross2 } from "react-icons/rx";
import React from "react";

interface FilterOption {
  id: string;
  label: string;
  type: 'radio' | 'checkbox';
  options: readonly string[];
  selected: string[];
  onChange: (option: string) => void;
}

interface FiltersModalProps {
  show: boolean;
  onClose: () => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  filterOptions: FilterOption[];
  onClearAll: () => void;
  onApply: () => void;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  show,
  onClose,
  sortBy,
  setSortBy,
  filterOptions,
  onClearAll,
  onApply,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-white rounded-2xl p-0 border border-neutral-200 max-w-2xl w-full h-9/10 relative animate-fadeIn flex flex-col"
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between rounded-t-2xl px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <div className="font-semibold text-2xl">All Filters</div>
          <button
            className="text-2xl text-neutral-400 hover:text-neutral-700 cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <RxCross2 className="w-6 h-6" />
          </button>
        </div>
        {/* Scrollable Filters */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="mb-4 py-4 border-b border-neutral-200">
            <div className="font-semibold text-lg mb-2">Sort By</div>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={sortBy === "az"} onChange={() => setSortBy("az")}
                  className="accent-green-600 w-5 h-5" />
                <span>Name (A-Z)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={sortBy === "za"} onChange={() => setSortBy("za")}
                  className="accent-green-600 w-5 h-5" />
                <span>Name (Z-A)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={sortBy === "recent"} onChange={() => setSortBy("recent")}
                  className="accent-green-600 w-5 h-5" />
                <span>Most Recent</span>
              </label>
            </div>
          </div>
          
          {filterOptions.map((filter) => (
            <div key={filter.id} className="mt-4 py-4 border-b border-neutral-200">
              <div className="font-semibold text-lg mb-2">{filter.label}</div>
              <div className={`flex gap-8 flex-wrap ${
                ['jobs', 'company', 'currentCtc', 'expectedCtc', 'location'].includes(filter.id) 
                ? 'grid grid-cols-2 gap-x-8 gap-y-2' 
                : 'flex gap-8'
              }`}>
                {filter.options.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type={filter.type} 
                      checked={filter.selected.includes(option)} 
                      onChange={() => filter.onChange(option)}
                      className="accent-green-600 w-5 h-5" 
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Fixed Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t border-neutral-200 rounded-b-2xl sticky bottom-0 bg-white z-10">
          <button
            className="px-6 py-2 rounded-lg border border-neutral-400 bg-neutral-50 text-neutral-700 font-medium hover:bg-neutral-100 cursor-pointer"
            onClick={onClearAll}
          >
            Clear All
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
            onClick={onApply}
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal; 