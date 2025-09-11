"use client";

import { useState } from "react";
import type { User } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { UserDetailsDialog } from "./user-details-dialog";
import { formatDate } from "@/lib/utils";
import { EditDateDialog } from "./edit-date-dialog";

export function UserListItem({ user }: { user: User }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);

  const handleEditDate = () => setIsEditDateOpen(true);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      await fetch(`https://cloud.oriagent.com/console/api/account/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjI2YjRhMTAtNDk2Mi00MGM0LTkyODktNmVmMmNlNjI3OWZlIiwiZXhwIjoxNzU5NDc1MDQzLCJpc3MiOiJTRUxGX0hPU1RFRCIsInN1YiI6IkNvbnNvbGUgQVBJIFBhc3Nwb3J0In0.HtmVsL6Sts0CkRRRMsCmuoitC3Wqr0Eh5Vn7b-Gcizc",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          <div>
            <h3 className="font-semibold">{user.username}</h3>
            <p className="text-sm text-gray-600">ID: {user.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Role: {user.role}</p>
          </div>
          <div>
            <p className="text-sm">
              Created: {user.createdAt ? formatDate(user.createdAt) : "-"}
            </p>
            <p className="text-sm">
              Updated: {user.updatedAt ? formatDate(user.updatedAt) : "-"}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="focus:ring-0"
            onClick={() => setIsDetailsOpen(true)}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">View user details</span>
          </Button>
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
