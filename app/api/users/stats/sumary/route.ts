import { isAuthenticated } from "@/lib/auth";
import {
  calculateYearlyGrowth,
  getExpiredAccountsCount,
  getTotalExpiringAccounts,
} from "@/lib/utils";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function GET(_req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cacheData = await prisma.cacheData.findFirst();
    try {
      const expiredAccountsCount = getExpiredAccountsCount(
        (cacheData?.data as []) || null
      );
      const totalExpiringAccounts = getTotalExpiringAccounts(
        (cacheData?.data as []) || null
      );

      return NextResponse.json({
        total: (cacheData?.data as any)?.length || 0,
        yearlyGrowth: calculateYearlyGrowth((cacheData?.data as any) || []),
        expiredAccountsCount,
        totalExpiringAccounts,
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
