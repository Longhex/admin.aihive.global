"use client";

import { useState } from "react";
import type { User } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { UserDetailsDialog } from "./user-details-dialog";
import { formatDate } from "@/lib/utils";
import { EditDateDialog } from "./edit-date-dialog";
import { useAuth } from "@/contexts/auth-context";

export function UserListItem({
  user,
  currentUserRole = "",
}: {
  user: User;
  currentUserRole?: string;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const { me } = useAuth();
  const handleEditDate = () => setIsEditDateOpen(true);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      await fetch(`api/account/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      alert("Đã xảy ra lỗi khi xóa người dùng");
    }
  };

  return (
    <Card className="mb-4 border border-gray-200">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 space-y-4 sm:space-y-0 bg-white text-gray-800 rounded-[5px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 w-full">
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Role: {user.role}</p>
            <p className="text-sm font-medium">
              Subscription Plan: {user.subscription_plan}
            </p>
            <p className="text-sm text-gray-600">Language: {user.language}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Max apps: {user.max_apps}</p>
            <p className="text-sm  font-medium">
              Max tokens: {user.max_tokens}
            </p>
            <p className="text-sm  font-medium">
              Max file datasets: {user.max_file_datasets}
            </p>
          </div>
          <div>
            <p className="text-sm">Theme: {user.theme}</p>
            <p className="text-sm">Timezone: {user.timezone}</p>
          </div>
          <div>
            <p className="text-sm">Phone: {user.phone_number || "N/A"}</p>
            <p className="text-sm">Last Login IP: {user.last_login_ip}</p>
          </div>
          <div>
            <p className="text-sm">
              Last Login: {new Date(user.last_login).toLocaleString()}
            </p>
            <p className="text-sm">End Date: {user.end_date}</p>
          </div>
          <div>
            <p className="text-sm">Created: {formatDate(user.created_at)}</p>
          </div>
        </div>
        <div className="flex justify-end">
          {me?.role !== "Viewer" && (
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
      </CardContent>
      <UserDetailsDialog
        user={user}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      {isEditDateOpen && (
        <EditDateDialog user={user} onClose={() => setIsEditDateOpen(false)} />
      )}
    </Card>
  );
}
