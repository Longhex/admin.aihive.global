import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

async function isSuperAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("systemUserId")?.value;
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  return user?.role === "SuperAdmin";
}

export async function POST(req: Request) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { oriagentToken } = body;
    if (!oriagentToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    await prisma.setting.updateMany({
      data: {
        oriagentToken,
      },
    }); // Xóa tất cả các bản ghi hiện có
    return NextResponse.json({ data: "Setting updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
