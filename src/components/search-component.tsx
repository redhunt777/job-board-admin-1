import { IoSearch } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";
import { useContext, Suspense, useState, useRef, useEffect } from "react";
import { SidebarContext } from "@/components/sidebar";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

function SearchBar() {
  return (
    <div className="hidden md:block relative w-1/3 bg-neutral-200 rounded-xl">
      <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search"
        className="outline-none py-2 pl-10 pr-4 w-full"
      />
    </div>
  );
}

function UserButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="md:absolute md:right-10" ref={dropdownRef}>
      <button
        role="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-neutral-200 rounded-3xl px-2 py-2 cursor-pointer"
      >
        <div className="flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-900 shadow-lg rounded-full p-2">
          <Image
            src="/logomark-white.svg"
            alt="logo"
            width={12}
            height={12}
            className="h-3 w-3"
          />
        </div>
        <FaCaretDown className="w-5 h-5 text-neutral-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-b-xl shadow-2xl z-50 py-4 px-4 flex flex-col gap-3">
          <button
            className="w-full text-left text-neutral-800 font-medium hover:font-semibold rounded transition px-0 cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            Edit Profile
          </button>
          <button
            className="w-full text-left text-neutral-800 font-medium hover:font-semibold rounded transition px-0 cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            Settings
          </button>
          <button
            className="w-full text-left text-neutral-800 font-medium hover:font-semibold rounded transition px-0 cursor-pointer"
            onClick={() => router.push("/help")}
          >
            Help Center
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-left text-red-600 rounded transition px-0 font-medium hover:font-semibold cursor-pointer"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

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
      <div className="container mx-auto flex items-center justify-between md:justify-center px-4 md:px-0 relative">
        {/* Mobile Logo */}
        <Suspense
          fallback={
            <div className="h-12 w-40 bg-neutral-200 animate-pulse rounded" />
          }
        >
          <div className="md:hidden">
            <Image
              src="/wordmark-blue.svg"
              alt="logo"
              height={48}
              width={160}
              className="h-12 w-auto"
            />
          </div>
        </Suspense>

        {/* Search Bar - Hidden on Mobile */}
        <Suspense
          fallback={
            <div className="hidden md:block w-1/3 h-10 bg-neutral-200 animate-pulse rounded-xl" />
          }
        >
          <SearchBar />
        </Suspense>

        {/* Mobile Search Icon */}
        <button className="md:hidden rounded-full p-2 ml-10">
          <IoSearch className="w-6 h-6 text-neutral-700" />
        </button>

        <Suspense
          fallback={
            <div className="h-10 w-32 bg-neutral-200 animate-pulse rounded-3xl" />
          }
        >
          <UserButton />
        </Suspense>
      </div>
    </div>
  );
}
