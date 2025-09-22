import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing username or password" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Kiểm tra xem tài khoản có bị khóa không
    if (
      user.lockedUntil &&
      DateTime.fromISO(user.lockedUntil.toISOString()) > DateTime.local()
    ) {
      return NextResponse.json(
        { error: "Account locked. Please try again later." },
        { status: 403 }
      );
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // Tăng số lần thử đăng nhập sai
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: user.failedAttempts + 1,
        },
      });

      // Nếu số lần thử đăng nhập sai vượt quá ngưỡng, khóa tài khoản
      if (user.failedAttempts >= 5) {
        const lockedUntil = DateTime.local().plus({ minutes: 30 }).toJSDate(); // Khóa tài khoản 30 phút
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lockedUntil,
          },
        });

        return NextResponse.json(
          {
            error:
              "Too many failed login attempts. Your account is locked for 30 minutes.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
    // Set a cookie for authentication (simple, not JWT for now)
    const response = NextResponse.json({
      data: { id: user.id, username: user.username, role: user.role },
    });
    response.cookies.set("systemUserAuth", "true", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    response.cookies.set("systemUserId", String(user.id), {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
