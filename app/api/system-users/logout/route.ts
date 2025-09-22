import { NextResponse } from "next/server";

export async function POST() {
  // Xóa cookie xác thực phía server (httpOnly)
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("systemUserAuth", "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(0), // Hết hạn ngay lập tức
  });
  return response;
}
