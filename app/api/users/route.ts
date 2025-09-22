import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET(_req: Request) {
  // Check authentication (systemUserAuth cookie)
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("systemUserAuth")?.value === "true";
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Fetching users from API...");
    const setting = await prisma.setting.findFirst();
    const token = setting?.oriagentToken;
    if (!token) {
      return NextResponse.json(
        { error: "Oriagent token not configured" },
        { status: 500 }
      );
    }
    try {
      const res = await fetch(
        "https://cloud.oriagent.com/console/api/account/admin",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      console.log("API response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`API responded with status ${res.status}: ${errorText}`);
        throw new Error(
          `API request failed with status ${res.status}: ${errorText}`
        );
      }

      const data = await res.json();
      console.log(
        "API response data:",
        JSON.stringify(data).slice(0, 200) + "..."
      ); // Log first 200 characters of response

      // Ensure phone_number field is included in the response data
      const processedData = Array.isArray(data)
        ? data.map((user) => ({
            ...user,
            phone_number: user.phone_number || null, // Ensure phone_number is included, default to null if not present
          }))
        : [];

      return NextResponse.json({ data: processedData });
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
