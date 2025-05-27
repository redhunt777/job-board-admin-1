import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiHomeAlt } from "react-icons/bi";
import { BsBriefcase } from "react-icons/bs";
import { GoPeople } from "react-icons/go";
import { HiOutlineChatAlt2 } from "react-icons/hi";

const navItems = [
  { to: "/dashboard", icon: <BiHomeAlt className="w-6 h-6" />, label: "Dashboard" },
  { to: "/jobs", icon: <BsBriefcase className="w-6 h-6" />, label: "Jobs" },
  { to: "/candidates", icon: <GoPeople className="w-6 h-6" />, label: "Candidates" },
  { to: "/inbox", icon: <HiOutlineChatAlt2 className="w-6 h-6" />, label: "Inbox" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1E3170] to-[#07123A] flex justify-around items-center h-20 w-full md:hidden shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            href={item.to}
            className={`flex flex-col items-center justify-center px-6 py-2 text-white transition-colors duration-200 rounded-t-2xl rounded-b-lg ${
              isActive ? "bg-blue-900" : "hover:bg-blue-900"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
