"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { User } from "@/types/api"

type EditDateDialogProps = {
  user: User
  onClose: () => void
}

export const EditDateDialog = ({ user, onClose }: EditDateDialogProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ""
    try {
      // Try to parse the date string
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString)
        return ""
      }
      return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    } catch (error) {
      console.error("Error formatting date:", error)
      return ""
    }
  }

  const [endDate, setEndDate] = useState(formatDate(user.end_date))
  const [apiKey, setApikey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function tinhSoNgay(ngayCu: string, ngayMoi: string) {
    try {
      const date1 = ngayCu ? new Date(ngayCu) : new Date()
      const date2 = new Date(ngayMoi)

      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        console.error("Invalid date in tinhSoNgay:", { ngayCu, ngayMoi })
        return 0
      }

      const timeDiff = date2.getTime() - date1.getTime()
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) // Use Math.ceil to round up
    } catch (error) {
      console.error("Error calculating days:", error)
      return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Use the hardcoded token that's working in other parts of the application
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjI2YjRhMTAtNDk2Mi00MGM0LTkyODktNmVmMmNlNjI3OWZlIiwiZXhwIjoxNzU5NDc1MDQzLCJpc3MiOiJTRUxGX0hPU1RFRCIsInN1YiI6IkNvbnNvbGUgQVBJIFBhc3Nwb3J0In0.HtmVsL6Sts0CkRRRMsCmuoitC3Wqr0Eh5Vn7b-Gcizc"

      const formattedNewEndDate = new Date(endDate).toISOString()
      const days = tinhSoNgay(user.end_date, formattedNewEndDate)

      console.log("Sending request with data:", {
        user_id: user.id,
        days,
        openai_key: apiKey,
      })

      const response = await fetch("https://cloud.oriagent.com/console/api/account/extend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          days,
          openai_key: apiKey,
        }),
      })

      const responseData = await response.text()
      console.log("API Response:", response.status, responseData)

      if (!response.ok) {
        throw new Error(`Failed to update end date: ${response.status} ${responseData}`)
      }

      setSuccess("End date updated successfully!")

      // Wait a moment before reloading to show success message
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error updating end date:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Extend end date for {user.name}</DialogTitle>
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
                placeholder="Optional"
              />
            </div>
            {error && <div className="col-span-4 text-red-400 bg-red-900/20 p-3 rounded-md text-sm mt-2">{error}</div>}
            {success && (
              <div className="col-span-4 text-green-400 bg-green-900/20 p-3 rounded-md text-sm mt-2">{success}</div>
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
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
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
  )
}
