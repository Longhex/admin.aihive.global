import { isSuperAdmin } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(_req: Request) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(_req.url);
  try {
    const username = searchParams.get("username");
    const page = +(searchParams.get("page") || "1");
    const pageSize = +(searchParams.get("pageSize") || "1");

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        where: {
          username: username
            ? {
                contains: username,
                mode: "insensitive",
              }
            : undefined,
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.user.count({
        where: {
          username: username
            ? {
                contains: username,
                mode: "insensitive",
              }
            : undefined,
        },
      }),
    ]);
    return NextResponse.json({ data: users, total });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { username, password, role } = body;
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, role },
    });
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
