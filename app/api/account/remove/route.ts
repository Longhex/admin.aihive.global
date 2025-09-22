import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

async function isSuperAdmin() {
  // cookies() can be used directly as a function in app router API routes
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("systemUserId");
  const userId = userIdCookie?.value;
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  return user?.role === "SuperAdmin";
}

export async function POST(
  req: Request,
  { params }: { params: { user_id: string } }
) {
  if (!(await isSuperAdmin())) {
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
    const response = await fetch(
      "https://cloud.oriagent.com/console/api/account/remove",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      }
    );

    return NextResponse.json({ data: await response.json() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
