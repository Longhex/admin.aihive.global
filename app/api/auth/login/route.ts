import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // lưu trong env file

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

    // ✅ Login thành công → tạo JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set a cookie for authentication (simple, not JWT for now)
    const response = NextResponse.json({
      data: { id: user.id, username: user.username, role: user.role },
    });

    response.cookies.set("authToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
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
