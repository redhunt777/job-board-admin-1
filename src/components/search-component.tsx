import { IoSearch } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";
import { useContext } from "react";
import { SidebarContext } from "@/components/sidebar";

export default function SearchComponent() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("SearchComponent must be used within a SidebarProvider");
  }
  const { collapsed } = context;

  return (
    <div
      className={`w-full py-6 border-b border-neutral-200 transition-all duration-300 ${
        collapsed ? "md:ml-20" : "md:ml-20"
      }`}
    >
      <div className="container mx-auto flex items-center justify-center relative">
        <div className="relative w-1/3 bg-neutral-200 rounded-xl">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="outline-none py-2 pl-10 pr-4 w-full"
          />
        </div>
        <button
          role="button"
          className="absolute border border-transparent right-10 flex items-center bg-neutral-200 rounded-3xl px-2 py-2"
        >
          <div className="flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-700 shadow-lg rounded-full p-2">
            <img src="logomark-white.svg" alt="logo" className="h-3 w-3" />
          </div>
          <FaCaretDown className="w-5 h-5 text-neutral-500" />
        </button>
      </div>
    </div>
  );
}
