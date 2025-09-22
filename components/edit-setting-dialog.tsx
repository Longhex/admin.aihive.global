"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type EditSettingDialogProps = {
  onClose: () => void;
};

export const EditSettingDialog = ({ onClose }: EditSettingDialogProps) => {
  const [oriagentToken, setOriagentToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("api/setting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oriagentToken,
        }),
      });

      const responseData = await response.text();
      console.log("API Response:", response.status, responseData);

      if (!response.ok) {
        throw new Error(
          `Failed to update end date: ${response.status} ${responseData}`
        );
      }

      setSuccess("Setting updated successfully!");

      // Wait a moment before reloading to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error updating setting:", error);
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
          <DialogTitle className="text-white">Setting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-key" className="text-right text-gray-300">
                Oriagent Token
              </Label>
              <Input
                id="api-key"
                type="text"
                value={oriagentToken}
                onChange={(e) => setOriagentToken(e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                placeholder="Optional"
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
