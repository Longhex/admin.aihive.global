"use client";

import { useState } from "react";
import type { User } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Calendar, Trash2 } from "lucide-react";
import { EditDateDialog } from "./edit-date-dialog";

interface UserDetailsDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailsDialog({
  user,
  isOpen,
  onClose,
}: UserDetailsDialogProps) {
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditDate = () => {
    setIsEditDateOpen(true);
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      setIsDeleting(true);

      await fetch(`api/account/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      onClose(); // Close the dialog
      window.location.reload(); // Reload the page to reflect changes
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      alert("Đã xảy ra lỗi khi xóa người dùng");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white">User Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Name:</span>
              <span className="col-span-3 text-white">{user.name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Email:</span>
              <span className="col-span-3 text-white">{user.email}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Phone:</span>
              <span className="col-span-3 text-white">
                {user.phone_number || "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Role:</span>
              <span className="col-span-3 text-white">{user.role}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Language:</span>
              <span className="col-span-3 text-white">{user.language}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Theme:</span>
              <span className="col-span-3 text-white">{user.theme}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Timezone:</span>
              <span className="col-span-3 text-white">{user.timezone}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Last Login:</span>
              <span className="col-span-3 text-white">
                {user.last_login
                  ? format(parseISO(user.last_login), "dd MMM yyyy HH:mm:ss")
                  : "Never"}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Last Login IP:</span>
              <span className="col-span-3 text-white">
                {user.last_login_ip || "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">End Date:</span>
              <span className="col-span-3 text-white">
                {user.end_date
                  ? format(parseISO(user.end_date), "dd MMM yyyy HH:mm:ss")
                  : "No end date"}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-gray-300">Created:</span>
              <span className="col-span-3 text-white">
                {user.created_at
                  ? format(
                      new Date(Number(user.created_at) * 1000),
                      "dd MMM yyyy HH:mm:ss"
                    )
                  : "Unknown"}
              </span>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleEditDate}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Edit End Date
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete User"}
              </Button>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEditDateOpen && (
        <EditDateDialog user={user} onClose={() => setIsEditDateOpen(false)} />
      )}
    </>
  );
}
