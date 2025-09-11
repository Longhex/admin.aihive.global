"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { UserListItem } from "@/components/user-list-item";
import { Loading } from "@/components/loading";
import { Input } from "@/components/ui/input";
import type { User } from "@/types/api";

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Thêm state cho form tạo user
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "Admin",
  });
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserLoading, setAddUserLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    setAddUserLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add user");
      }
      const data = await res.json();
      setUsers([data.data, ...users]);
      setShowAddUser(false);
      setNewUser({ username: "", password: "", role: "Admin" });
    } catch (err: any) {
      setAddUserError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }
        const data = await res.json();
        setUsers(data.data);
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
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.username?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const goToNextPage = () =>
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  const goToPreviousPage = () =>
    setCurrentPage((page) => Math.max(page - 1, 1));

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Accounts</h2>
            <p className="text-muted-foreground">
              View and manage user accounts
            </p>
          </div>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            onClick={() => setShowAddUser(true)}
          >
            + Add User
          </button>
        </div>
        {showAddUser && (
          <form
            onSubmit={handleAddUser}
            className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col gap-6 w-full max-w-4xl shadow-2xl animate-fade-in mx-auto mt-4"
            style={{ zIndex: 10 }}
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full min-w-[220px] bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full min-w-[220px] bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full min-w-[220px] bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition text-gray-900"
                >
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            {addUserError && (
              <div className="text-red-500 text-sm font-medium text-center">
                {addUserError}
              </div>
            )}
            <div className="flex gap-3 justify-end mt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow"
                disabled={addUserLoading}
              >
                {addUserLoading ? "Adding..." : "Add User"}
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition shadow"
                onClick={() => setShowAddUser(false)}
                disabled={addUserLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm mb-4"
        />
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-red-500 p-4 bg-red-100 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-4">
              {currentUsers.map((user) => (
                <UserListItem key={user.id} user={user} />
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
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
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
          </div>
        )}
      </div>
    </Layout>
  );
}
