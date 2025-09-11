import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp: string | number): string {
  // Convert string timestamp to number if necessary
  const numericTimestamp = typeof timestamp === "string" ? Number.parseInt(timestamp, 10) : timestamp

  // Create a new Date object
  const date = new Date(numericTimestamp * 1000) // Multiply by 1000 to convert seconds to milliseconds

  // Format the date
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}
