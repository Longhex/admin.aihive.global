import { isAuthenticated } from "@/lib/auth";
import { getPaginatedData } from "@/lib/utils";
import { User } from "@/types/api";
import { PrismaClient } from "@prisma/client";
import { isBefore, isThisMonth, parseISO } from "date-fns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function GET(_req: Request) {
  const { searchParams } = new URL(_req.url);

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Fetching users from API...");
    const cacheData = await prisma.cacheData.findFirst();

    try {
      const filteredData = filterData(cacheData?.data as any, {
        isExpiring: searchParams.get("expiring") === "true",
        isThisMonthFilter: searchParams.get("isThisMonthFilter") === "true",
        year: searchParams.get("year") || "all",
        month: searchParams.get("month") || "all",
        day: searchParams.get("day") || "all",
        filterBy: searchParams.get("filterBy"),
        search: searchParams.get("search"),
      });

      const sortedData = sorted(
        filteredData as any,
        searchParams.get("sortOption") || "created",
        searchParams.get("sortDirection") || "desc"
      );

      const data = cacheData?.data
        ? getPaginatedData(
            sortedData as any[],
            Number(searchParams.get("page") || "1"),
            Number(searchParams.get("pageSize") || "10")
          )
        : [];

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

      return NextResponse.json({
        data: processedData,
        total: sortedData?.length || 0,
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

function filterData(data: User[], filterValues: any) {
  return (data || [])
    .filter((user: User) => {
      if (!filterValues?.filterBy) return true;
      if (filterValues?.filterBy === "end_date" && !user.end_date) return false;
      try {
        const filterValue =
          filterValues.filterBy === "created_at"
            ? new Date(Number.parseInt(user.created_at) * 1000)
            : parseISO(user.end_date);
        // Apply year filter
        if (
          filterValues?.year &&
          filterValues.year !== "all" &&
          filterValue.getFullYear() !== Number.parseInt(filterValues?.year)
        ) {
          return false;
        }

        // Apply month filter
        if (
          filterValues?.month &&
          filterValues?.month !== "all" &&
          filterValue.getMonth() !== Number.parseInt(filterValues?.month)
        ) {
          return false;
        }

        // Apply day filter
        if (
          filterValues?.day &&
          filterValues?.day !== "all" &&
          filterValue.getDate() !== Number.parseInt(filterValues?.day)
        ) {
          return false;
        }

        return true;
      } catch (err) {
        console.warn("Error parsing created date:", err);
        return false;
      }
    })
    .filter((user: User) => {
      if (filterValues.isExpiring) {
        if (!user.end_date) return false;
        if (filterValues.isThisMonthFilter) {
          const endDate = parseISO(user.end_date);
          return isThisMonth(endDate);
        }
        const currentDate = new Date();
        const endDate = parseISO(user.end_date);
        return isBefore(endDate, currentDate);
      }
      return true;
    })
    .filter((user: User) => {
      if (filterValues?.search) {
        const searchQuery = filterValues?.search;
        return (
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });
}

function sorted(data: User[], sortOption: string, sortDirection: string) {
  return (data || []).sort((a, b) => {
    if (sortOption === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === "asc"
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
}
