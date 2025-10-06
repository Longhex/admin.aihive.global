import { isAdmin, isSuperAdmin } from "@/lib/auth";
import { getCacheData } from "@/lib/cache";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();

  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const setting = await prisma.setting.findFirst();
    const token = setting?.oriagentToken;
    if (!token) {
      return NextResponse.json(
        { error: "Oriagent token not configured" },
        { status: 500 }
      );
    }

    await Promise.all([
      fetch("https://cloud.oriagent.com/console/api/account/extend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }),
      fetch("https://cloud.oriagent.com/console/api/account/max-apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }),
      fetch("https://cloud.oriagent.com/console/api/account/max-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }),
      fetch(
        "https://cloud.oriagent.com/console/api/account/max-file-datasets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      ),
    ]);

    await getCacheData(true);

    return NextResponse.json({ data: "success" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
