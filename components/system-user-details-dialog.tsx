import type { SystemUser, User } from "@/types/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SystemUserDetailsDialogProps {
  user: SystemUser;
  isOpen: boolean;
  onClose: () => void;
}

export function SystemUserDetailsDialog({
  user,
  isOpen,
  onClose,
}: SystemUserDetailsDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState({
    username: user.username,
    role: user.role,
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: any = { ...editUser };
      if (!editUser.password) {
        delete payload["password"];
      }
      const res = await fetch(`/api/system-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }
      setEditMode(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/system-users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>System User Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 text-sm">
          {editMode ? (
            <>
              <div>
                <span className="font-medium text-gray-700">Username:</span>{" "}
                <Input
                  value={editUser.username}
                  onChange={(e) =>
                    setEditUser({ ...editUser, username: e.target.value })
                  }
                  className="inline-block w-auto ml-2"
                  disabled={saving}
                />
              </div>
              <div>
                <span className="font-medium text-gray-700">Role:</span>{" "}
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                  className="ml-2 border rounded px-2 py-1"
                  disabled={saving}
                >
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div>
                <span className="font-medium text-gray-700">Password:</span>{" "}
                <Input
                  type="password"
                  value={editUser.password}
                  onChange={(e) =>
                    setEditUser({ ...editUser, password: e.target.value })
                  }
                  className="inline-block w-auto ml-2"
                  placeholder="Leave blank to keep current password"
                  disabled={saving}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="font-medium text-gray-700">Username:</span>{" "}
                {user.username}
              </div>
              <div>
                <span className="font-medium text-gray-700">Role:</span>{" "}
                {user.role}
              </div>
            </>
          )}
          <div>
            <span className="font-medium text-gray-700">ID:</span>{" "}
            <span className="font-mono">{user.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Created:</span>{" "}
            {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
          </div>
          <div>
            <span className="font-medium text-gray-700">Updated:</span>{" "}
            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "-"}
          </div>
          {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
        </div>
        <DialogFooter className="flex flex-row gap-2 justify-end">
          {editMode ? (
            <>
              <Button
                onClick={() => setEditMode(false)}
                variant="outline"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} variant="default" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
              <Button onClick={() => setEditMode(true)} variant="secondary">
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
