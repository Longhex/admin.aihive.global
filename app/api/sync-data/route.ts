import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET() {
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

    await prisma.cacheData.upsert({
      where: { id: 1 },
      update: {
        data,
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        data,
        updatedAt: new Date(),
      },
    });

    // TODO: Lưu data vào DB hoặc KV
  } catch (error) {
    console.error("Error fetching data from Oriagent API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Oriagent API" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
