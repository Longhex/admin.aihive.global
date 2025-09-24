import { isAuthenticated } from "@/lib/auth";
import { getCacheData } from "@/lib/cache";
import { PrismaClient } from "@prisma/client";
import { isBefore, parseISO } from "date-fns";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function GET(_req: Request) {
  // Check authentication (systemUserAuth cookie)
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cacheData = await getCacheData();
    try {
      const users = (cacheData?.data as any[]) || [];

      // Calculate active and expired users
      const currentDate = new Date();
      const expiredUsers = users.filter((user) => {
        if (!user.end_date) return false;
        try {
          const endDate = parseISO(user.end_date);
          return isBefore(endDate, currentDate);
        } catch (err) {
          console.warn("Error parsing end date:", err);
          return false;
        }
      }).length;

      const activeUsers = users.length - expiredUsers;

      // Prepare chart data
      const data = [
        { name: "Active Users", value: activeUsers, color: "#a78bfa" }, // Purple
        { name: "Expired Accounts", value: expiredUsers, color: "#fcd34d" }, // Yellow
      ];

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
