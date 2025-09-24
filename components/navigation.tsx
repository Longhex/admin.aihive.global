import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { logout, me } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex items-center bg-gray-900 rounded-full p-1 w-fit">
      <Link
        href="/"
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
          pathname === "/"
            ? "bg-white text-black shadow-md transform scale-105"
            : "text-gray-300 hover:text-white hover:bg-gray-800"
        }`}
      >
        Overview
      </Link>
      <Link
        href="/user-list"
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
          pathname === "/user-list"
            ? "bg-white text-black shadow-md transform scale-105"
            : "text-gray-300 hover:text-white hover:bg-gray-800"
        }`}
      >
        User List
      </Link>
      {/* Only show System User tab for SuperAdmin */}
      {me?.role === "SuperAdmin" && (
        <Link
          href="/system-user"
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            pathname === "/system-user"
              ? "bg-white text-black shadow-md transform scale-105"
              : "text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          System User
        </Link>
      )}
    </div>
  );
}
