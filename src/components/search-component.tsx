import { IoSearch } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";
import {
  Suspense,
  useState,
  useRef,
  useEffect,
  memo,
  useCallback,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/store/features/userSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

// Memoized SearchBar component
const SearchBar = memo(() => {
  return (
    <div className="hidden md:block relative w-full max-w-md bg-neutral-200 rounded-xl min-w-[200px]">
      <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 flex-shrink-0" />
      <input
        type="text"
        placeholder="Search"
        className="outline-none py-2 pl-10 pr-4 w-full bg-transparent text-sm md:text-base placeholder:text-neutral-500 placeholder:text-sm md:placeholder:text-base truncate"
      />
    </div>
  );
});

SearchBar.displayName = "SearchBar";

// Memoized UserButton component
const UserButton = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleSignOut = useCallback(async () => {
    try {
      await dispatch(logoutUser());
      router.push("/login");
    } catch (error) {
      console.log("Failed to log out:", error);
    }
    setIsOpen(false);
  }, [dispatch, router]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative ml-4" ref={dropdownRef}>
      <button
        role="button"
        onClick={toggleDropdown}
        className="flex items-center bg-neutral-200 rounded-3xl px-2 py-2 cursor-pointer whitespace-nowrap"
      >
        <div className="flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-700 shadow-lg rounded-full p-2">
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
          <Link
            href="/profile"
            className="w-full text-left text-neutral-800 font-medium hover:font-semibold rounded transition px-0 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Edit Profile
          </Link>
          <Link
            href="/settings"
            className="w-full text-left text-neutral-800 font-medium hover:font-semibold rounded transition px-0 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <Link
            href="/help"
            className="w-full text-left text-neutral-800 font-medium hover:font-semibold rounded transition px-0 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Help Center
          </Link>
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
});

UserButton.displayName = "UserButton";

// Memoized MobileLogo component
const MobileLogo = memo(() => (
  <div className="md:hidden">
    <Image
      src="/wordmark-blue.svg"
      alt="logo"
      height={48}
      width={160}
      className="h-12 w-auto"
    />
  </div>
));

MobileLogo.displayName = "MobileLogo";

// Memoized SearchIcon component
const SearchIcon = memo(() => (
  <button className="md:hidden rounded-full p-2 ml-10">
    <IoSearch className="w-6 h-6 text-neutral-700" />
  </button>
));

SearchIcon.displayName = "SearchIcon";

const SearchComponent = memo(() => {
  return (
    <div className="w-full py-4 md:py-6 border-b border-neutral-200 transition-all duration-300">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-between w-full gap-4">
              <div className="h-12 w-40 bg-neutral-200 animate-pulse rounded" />
              <div className="hidden md:block flex-1 max-w-md min-w-[200px] h-10 bg-neutral-200 animate-pulse rounded-xl" />
              <div className="h-10 w-32 bg-neutral-200 animate-pulse rounded-3xl" />
            </div>
          }
        >
          <MobileLogo />
          <div className="hidden md:flex flex-1 items-center justify-center min-w-0">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <SearchIcon />
            <UserButton />
          </div>
        </Suspense>
      </div>
    </div>
  );
});

SearchComponent.displayName = "SearchComponent";

export default SearchComponent;
