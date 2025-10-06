"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { User } from "@/types/api";

type EditDateDialogProps = {
  user: User;
  onClose: () => void;
};

export const EditUserDialog = ({ user, onClose }: EditDateDialogProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      // Try to parse the date string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "";
      }
      return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const [endDate, setEndDate] = useState(formatDate(user.end_date));
  const [apiKey, setApikey] = useState("");
  const [maxApps, setMaxApps] = useState<number>(user?.max_apps);
  const [maxTokens, setMaxTokens] = useState<number>(user?.max_tokens);
  const [maxFileDatasets, setMaxFileDatasets] = useState<number>(
    user?.max_file_datasets
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function tinhSoNgay(ngayCu: string, ngayMoi: string) {
    try {
      const date1 = ngayCu ? new Date(ngayCu) : new Date();
      const date2 = new Date(ngayMoi);

      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        console.error("Invalid date in tinhSoNgay:", { ngayCu, ngayMoi });
        return 0;
      }

      const timeDiff = date2.getTime() - date1.getTime();
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Use Math.ceil to round up
    } catch (error) {
      console.error("Error calculating days:", error);
      return 0;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formattedNewEndDate = new Date(endDate).toISOString();
      const days = tinhSoNgay(user.end_date, formattedNewEndDate);

      console.log("Sending request with data:", {
        user_id: user.id,
        days,
        openai_key: apiKey,
      });

      const response = await fetch("api/account/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          days,
          openai_key: apiKey,
          max_apps: maxApps,
          max_tokens: maxTokens,
          max_file_datasets: maxFileDatasets,
        }),
      });

      const responseData = await response.text();
      console.log("API Response:", response.status, responseData);

      if (!response.ok) {
        throw new Error(
          `Failed to update end date: ${response.status} ${responseData}`
        );
      }

      setSuccess("End date updated successfully!");

      // Wait a moment before reloading to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error updating end date:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right text-gray-300">
                End Date
              </Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
              <Label htmlFor="api-key" className="text-right text-gray-300">
                API Key
              </Label>
              <Input
                id="api-key"
                type="text"
                value={apiKey}
                onChange={(e) => setApikey(e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                // placeholder="Optional"
              />
              <Label htmlFor="max-apps" className="text-right text-gray-300">
                Max apps
              </Label>
              <Input
                id="max-apps"
                type="number"
                value={maxApps}
                onChange={(e) =>
                  setMaxApps(e.target.value as unknown as number)
                }
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                // placeholder="Number"
              />
              <Label htmlFor="max-tokens" className="text-right text-gray-300">
                Max token
              </Label>
              <Input
                id="max-tokens"
                type="number"
                value={maxTokens}
                onChange={(e) =>
                  setMaxTokens(e.target.value as unknown as number)
                }
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                // placeholder="Optional"
              />
              <Label
                htmlFor="max-file-datasets"
                className="text-right text-gray-300"
              >
                Max file datasets
              </Label>
              <Input
                id="max-file-datasets"
                type="number"
                value={maxFileDatasets}
                onChange={(e) =>
                  setMaxFileDatasets(e.target.value as unknown as number)
                }
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                // placeholder="Optional"
              />
            </div>
            {error && (
              <div className="col-span-4 text-red-400 bg-red-900/20 p-3 rounded-md text-sm mt-2">
                {error}
              </div>
            )}
            {success && (
              <div className="col-span-4 text-green-400 bg-green-900/20 p-3 rounded-md text-sm mt-2">
                {success}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
