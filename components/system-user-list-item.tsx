import { SystemUserDetailsDialog } from "@/components/system-user-details-dialog";
import { Button } from "@/components/ui/button";
import type { SystemUser } from "@/types/api";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function SystemUserListItem({
  user,
  onEdit,
  onDelete,
}: {
  user: SystemUser;
  onEdit?: (user: SystemUser) => void;
  onDelete?: (user: SystemUser) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div
      className="relative group bg-white border border-gray-200 rounded-2xl shadow-md px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between transition hover:shadow-lg"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 w-full">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-900 truncate">
              {user.username}
            </span>
            <span className="ml-2 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
              {user.role}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate">
            ID: <span className="font-mono">{user.id}</span>
          </div>
        </div>
        <div className="flex flex-col sm:items-end sm:ml-4 mt-3 sm:mt-0 min-w-[120px]">
          <div className="text-xs text-gray-400 pt-3">Created:</div>
          <div className="text-sm text-gray-700 font-medium">
            {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        {user.role !== "SuperAdmin" && (
          <Button
            variant="ghost"
            size="icon"
            className="focus:ring-0"
            onClick={() => setIsDetailsOpen(true)}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">View user details</span>
          </Button>
        )}
      </div>
      <SystemUserDetailsDialog
        user={user}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}
