"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { SystemUserListItem } from "@/components/system-user-list-item";
import { SystemUserAddForm } from "@/components/system-user-add-form";
import { Loading } from "@/components/loading";
import { Input } from "@/components/ui/input";
import type { SystemUser } from "@/types/api";

export default function SystemUserPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserLoading, setAddUserLoading] = useState(false);

  const handleAddUser = async (form: {
    username: string;
    password: string;
    role: string;
  }) => {
    setAddUserError(null);
    setAddUserLoading(true);
    try {
      const res = await fetch("/api/system-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add user");
      }
      const data = await res.json();
      setUsers([data.data, ...users]);
      setShowAddUser(false);
    } catch (err: any) {
      setAddUserError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  // Xử lý xóa user
  const handleDeleteUser = async (user: SystemUser) => {
    if (!confirm(`Are you sure you want to delete user '${user.username}'?`))
      return;
    try {
      setLoading(true);
      const res = await fetch(`/api/system-users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý edit user (hiện dialog hoặc inline, ở đây chỉ alert demo)
  const handleEditUser = (user: SystemUser) => {
    alert(`Edit user: ${user.username}`);
    // TODO: show edit dialog hoặc inline form
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/system-users");
        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }
        const data = await res.json();
        setUsers(data.data);
      } catch (error) {
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Users</h2>
          <p className="text-muted-foreground">View and manage system users</p>
        </div>
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
          onClick={() => setShowAddUser(true)}
        >
          + Add System User
        </button>
      </div>
      {showAddUser && (
        <SystemUserAddForm
          onAdd={handleAddUser}
          loading={addUserLoading}
          error={addUserError}
          onCancel={() => setShowAddUser(false)}
          show={showAddUser}
        />
      )}
      <Input
        placeholder="Search system users..."
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
            {currentUsers.map((user: SystemUser) => (
              <SystemUserListItem
                key={user.id}
                user={user}
                onEdit={() => handleEditUser(user)}
                onDelete={() => handleDeleteUser(user)}
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
  );
}
