// lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function verifyToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded; // trả user info
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export async function isSuperAdmin() {
  try {
    const decoded: any = await verifyToken();

    return decoded?.role === "SuperAdmin";
  } catch (error) {
    return false;
  }
}

export async function isAuthenticated() {
  try {
    const decoded: any = await verifyToken();
    return true;
  } catch (error) {
    return false;
  }
}
