import { isAuthenticated } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function GET(_req: Request) {
  // Check authentication (systemUserAuth cookie)
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(_req.url);
  const selectedYear =
    searchParams.get("year") || new Date().getFullYear().toString();
  try {
    const cacheData = await prisma.cacheData.findFirst();
    try {
      const users = (cacheData?.data as any[]) || [];

      users.sort(
        (a, b) => Number.parseInt(a.created_at) - Number.parseInt(b.created_at)
      );

      const userGrowth: { [key: string]: number } = {};
      let totalUsers = 0;

      users.forEach((user) => {
        const date = new Date(Number.parseInt(user.created_at) * 1000);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const key = `${year}-${month}`;

        totalUsers++;
        userGrowth[key] = totalUsers;
      });

      const data = Object.entries(userGrowth)
        .filter(([date]) => date.startsWith(selectedYear))
        .map(([date, totalUsers]) => ({ date, totalUsers }));

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
