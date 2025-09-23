"use client";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserListItem } from "@/components/user-list-item";
import type { User } from "@/types/api";
import axios from "axios";
import saveAs from "file-saver";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 10;

type SortOption = "name" | "created";
type SortDirection = "asc" | "desc";

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUserRole(localStorage.getItem("systemUserRole") || "");
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler); // hủy timeout cũ trước khi set cái mới
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios("/api/users", {
          params: {
            pageSize: itemsPerPage,
            page: currentPage,
            search: debouncedQuery,
            sortOption,
            sortDirection,
          },
        });

        setUsers(res?.data?.data || []);
        setTotal(res?.data?.total);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery, itemsPerPage, currentPage, sortOption, sortDirection]);

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const handleSort = (option: SortOption) => {
    setCurrentPage(1);
    if (option === sortOption) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortOption(option);
      setSortDirection(option === "created" ? "desc" : "asc");
    }
  };

  const exportToCSV = async () => {
    setIsDownloading(true);
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Language",
      "Theme",
      "Last Login",
      "Last Login IP",
      "End Date",
      "Created At",
    ];

    try {
      const res = await axios("/api/users", {
        params: {
          pageSize: 10000000,
          page: currentPage,
          search: debouncedQuery,
          sortOption,
          sortDirection,
        },
      });

      const users: User[] = res?.data?.data || [];
      const csvContent = [
        headers.join(","),
        ...users.map(
          (user) =>
            `${user.name},${user.email},${user.phone_number || "N/A"},${
              user.role
            },${user.language || ""},${user.theme || ""},${
              user.last_login || ""
            },${user.last_login_ip || ""},${user.end_date || ""},${
              user.created_at || ""
            }`
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "user_list.csv");
      setIsDownloading(false);
    } catch (error) {
      setIsDownloading(false);
      throw error;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User List</h2>
          <p className="text-muted-foreground">Total users: {total}</p>
          <p className="text-muted-foreground">
            View and manage user accounts • Total users: {total}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm bg-white text-gray-800 placeholder-gray-500 border-gray-300"
            />
            <Button
              isLoading={isDownloading}
              onClick={exportToCSV}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Export CSV
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              >
                Sort by {sortOption === "name" ? "Name" : "Created"} (
                {sortDirection === "asc" ? "Oldest first" : "Newest first"})
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("name")}>
                Sort by Name{" "}
                {sortOption === "name" &&
                  (sortDirection === "asc" ? "(A-Z)" : "(Z-A)")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("created")}>
                Sort by Created{" "}
                {sortOption === "created" &&
                  (sortDirection === "asc"
                    ? "(Oldest first)"
                    : "(Newest first)")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-500">Loading users...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 bg-red-100 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div>
              {users.map((user) => (
                <UserListItem
                  currentUserRole={currentUserRole}
                  key={`${user.id}-${currentPage}`}
                  user={user}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="page-size"
                  className="text-sm text-gray-500 font-medium mr-1"
                >
                  Rows per page:
                </label>
                <div className="relative">
                  <select
                    id="page-size"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setItemsPerPage(Number(e.target.value));
                    }}
                    className="appearance-none border border-gray-300 rounded-lg px-4 py-1.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow transition-colors hover:border-indigo-400 pr-8 cursor-pointer"
                    style={{ minWidth: 80 }}
                  >
                    {[5, 10, 20, 50, 100].map((size) => (
                      <option key={size} value={size} className="text-gray-800">
                        {size}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 9l6 6 6-6"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, total)} of {total}{" "}
                users
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
