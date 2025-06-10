import { RxCross2 } from "react-icons/rx";
import { useEffect, memo, useCallback } from "react";

interface FilterOption {
  id: string;
  label: string;
  type: "radio" | "checkbox";
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

// Memoized filter option component
const FilterOptionItem = memo(
  ({
    option,
    type,
    isSelected,
    onChange,
  }: {
    option: string;
    type: "radio" | "checkbox";
    isSelected: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type={type}
        checked={isSelected}
        onChange={onChange}
        className="accent-green-600 w-5 h-5"
      />
      <span>{option}</span>
    </label>
  )
);

FilterOptionItem.displayName = "FilterOptionItem";

// Memoized filter section component
const FilterSection = memo(
  ({
    filter,
    onOptionChange,
  }: {
    filter: FilterOption;
    onOptionChange: (option: string) => void;
  }) => (
    <div className="mt-4 py-4 border-b border-neutral-200">
      <div className="font-semibold text-lg mb-2">{filter.label}</div>
      <div
        className={`flex gap-8 flex-wrap ${
          ["jobs", "company", "currentCtc", "expectedCtc", "location"].includes(
            filter.id
          )
            ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2"
            : "flex flex-col md:flex-row gap-4 md:gap-8"
        }`}
      >
        {filter.options.map((option) => (
          <FilterOptionItem
            key={option}
            option={option}
            type={filter.type}
            isSelected={filter.selected.includes(option)}
            onChange={() => onOptionChange(option)}
          />
        ))}
      </div>
    </div>
  )
);

FilterSection.displayName = "FilterSection";

// Memoized sort options component
const SortOptions = memo(
  ({
    sortBy,
    setSortBy,
  }: {
    sortBy: string;
    setSortBy: (v: string) => void;
  }) => (
    <div className="mb-4 py-4 border-b border-neutral-200">
      <div className="font-semibold text-lg mb-2">Sort By</div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {[
          { value: "az", label: "Name (A-Z)" },
          { value: "za", label: "Name (Z-A)" },
          { value: "recent", label: "Most Recent" },
        ].map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              checked={sortBy === option.value}
              onChange={() => setSortBy(option.value)}
              className="accent-green-600 w-5 h-5"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
);

SortOptions.displayName = "SortOptions";

const FiltersModal: React.FC<FiltersModalProps> = memo(
  ({
    show,
    onClose,
    sortBy,
    setSortBy,
    filterOptions,
    onClearAll,
    onApply,
  }) => {
    const handleEscapeKey = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      },
      [onClose]
    );

    useEffect(() => {
      if (show) {
        document.addEventListener("keydown", handleEscapeKey);
      }
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }, [show, handleEscapeKey]);

    if (!show) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div className="bg-white md:rounded-2xl p-0 border border-neutral-200 max-w-2xl w-full h-full md:h-9/10 relative animate-fadeIn flex flex-col">
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
            <SortOptions sortBy={sortBy} setSortBy={setSortBy} />
            {filterOptions.map((filter) => (
              <FilterSection
                key={filter.id}
                filter={filter}
                onOptionChange={filter.onChange}
              />
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
  }
);

FiltersModal.displayName = "FiltersModal";

export default FiltersModal;
