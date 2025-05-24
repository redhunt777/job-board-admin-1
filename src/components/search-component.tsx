import React from "react";
import { IoSearch } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";

function SearchComponent() {
  return (
    <div className="max-w-7xl mx-auto px-2 md:px-8 pt-8 border-b border-[#E5E6E8]">
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-1/3 bg-[#E5E6E8] rounded-md">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#83858C] w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="border border-[#E5E6E8] focus:border-[#83858C] outline-none rounded-lg py-2 pl-10 pr-4 w-full"
          />
        </div>
        <button
          role="button"
          className="absolute border border-transparent right-10 flex items-center bg-[#E5E6E8] focus:border-[#83858C] outline-none rounded-3xl	 px-2 py-2"
        >
        <div className="flex items-center justify-center bg-[#1E3170] shadow-lg rounded-full p-2">
          <img
            src="logomark-white.svg"
            alt="logo"
            className="h-3 w-3 rounded-full"
          />
          </div>
          <FaCaretDown className="w-5 h-5 text-[#606167]" />
        </button>
      </div>
    </div>
  );
}

export { SearchComponent };
