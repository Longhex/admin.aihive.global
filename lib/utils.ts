import { User } from "@/types/api";
import { type ClassValue, clsx } from "clsx";
import { isBefore, isThisMonth, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: string | number): string {
  // Convert string timestamp to number if necessary
  const numericTimestamp =
    typeof timestamp === "string" ? Number.parseInt(timestamp, 10) : timestamp;

  // Create a new Date object
  const date = new Date(numericTimestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds

  // Format the date
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export const getPaginatedData = <T>(
  data: T[],
  page: number,
  pageSize: number
): T[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
};

export function calculateYearlyGrowth(userData: User[]) {
  // Gom nhóm user theo năm
  const yearlyCounts: any = {};

  userData.forEach((item) => {
    const year = new Date(
      Number.parseInt(item.created_at) * 1000
    ).getFullYear();
    yearlyCounts[year] = (yearlyCounts[year] || 0) + 1;
  });
  // Sắp xếp các năm
  const years = Object.keys(yearlyCounts)
    .map(Number)
    .sort((a, b) => a - b);

  // Tính growth %
  const results: any = [];
  let prevUsers = null;

  for (const year of years) {
    const users = yearlyCounts[year];
    let growth = null;

    if (prevUsers !== null) {
      growth = Number((((users - prevUsers) / prevUsers) * 100).toFixed(2));
    }

    results.push(growth);
    prevUsers = users;
  }

  return results.at(-1) || null;
}

export function getTotalExpiringAccounts(users: User[]): number {
  if (!Array.isArray(users)) {
    console.error("Invalid data format: users is not an array");
    return 0;
  }

  const currentDate = new Date();
  return users.filter((user: User) => {
    if (!user.end_date) return false;
    const endDate = parseISO(user.end_date);
    return isThisMonth(endDate);
  }).length;
}

export function getExpiredAccountsCount(users: User[]): number {
  if (!Array.isArray(users)) {
    console.error("Invalid data format: users is not an array");
    return 0;
  }

  const currentDate = new Date();
  return users.filter((user: any) => {
    if (!user.end_date) return false;
    try {
      const endDate = parseISO(user.end_date);
      return isBefore(endDate, currentDate);
    } catch (err) {
      console.warn("Error parsing end date:", err);
      return false;
    }
  }).length;
}
