import { isAuthenticated } from "@/lib/auth";
import { getCacheData } from "@/lib/cache";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function GET(_req: Request) {
  // Check authentication (systemUserAuth cookie)
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(_req.url);
  const selectedMonth =
    searchParams.get("month") || new Date().getMonth().toString();
  const selectedYear =
    searchParams.get("year") || new Date().getFullYear().toString();
  try {
    const cacheData = await getCacheData();
    try {
      const users = (cacheData?.data as any[]) || [];

      const filteredUsers = users.filter((user) => {
        try {
          const timestamp = Number.parseInt(user.created_at);
          if (isNaN(timestamp)) {
            console.warn("Invalid timestamp:", user.created_at);
            return false;
          }

          const date = new Date(timestamp * 1000);
          return (
            date.getFullYear().toString() === selectedYear &&
            date.getMonth().toString() === selectedMonth
          );
        } catch (err) {
          console.warn("Error parsing date:", err);
          return false;
        }
      });

      const usersByDay: { [key: string]: number } = {};

      filteredUsers.forEach((user) => {
        try {
          const timestamp = Number.parseInt(user.created_at);
          if (isNaN(timestamp)) return;

          const date = new Date(timestamp * 1000);
          const day = date.getDate().toString().padStart(2, "0");
          usersByDay[day] = (usersByDay[day] || 0) + 1;
        } catch (err) {
          console.warn("Error processing user:", err);
        }
      });

      const daysInMonth = new Date(
        Number.parseInt(selectedYear),
        Number.parseInt(selectedMonth) + 1,
        0
      ).getDate();
      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const day = (i + 1).toString().padStart(2, "0");
        return { day, count: usersByDay[day] || 0 };
      });
      return NextResponse.json({
        data,
      });
    } catch (apiError) {
      console.error(
        "Error fetching from external API, using fallback data:",
        apiError
      );
      // Return fallback data if the API call fails
      return NextResponse.json({
        data: [],
        message: "Using fallback data due to API error",
      });
    }
  } catch (error) {
    console.error("Unexpected error in API route:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : String(error),
        data: [], // Still return fallback data on unexpected errors
      },
      { status: 200 } // Return 200 with fallback data instead of 500
    );
  }
}
