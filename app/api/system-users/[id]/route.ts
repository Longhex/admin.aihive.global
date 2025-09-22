import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(params.id) },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { username, password, role } = body;
    const dataToUpdate: any = { username, role };
    if (typeof password === "string" && password.length > 0) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: Number(params.id) },
      data: dataToUpdate,
    });
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await prisma.user.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
