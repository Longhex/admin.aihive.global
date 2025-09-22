"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create a default context value
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication cookie when component is mounted
    const authStatus = Cookies.get("systemUserAuth");
    setIsAuthenticated(authStatus === "true");
    // Chỉ redirect nếu chưa đăng nhập, không phải trang /login, và KHÔNG phải đang gọi API (không phải môi trường server)
    // Đặc biệt: KHÔNG redirect nếu đang ở trang /system-user hoặc các trang admin khác khi đang thao tác nội bộ
    if (
      typeof window !== "undefined" &&
      authStatus !== "true" &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/system-user"
    ) {
      router.push("/login");
    }
  }, [router]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/system-users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        return false;
      }
      // Cookie is set by the API route (httpOnly)
      Cookies.set("systemUserAuth", "true", {
        expires: 7,
        path: "/",
        sameSite: "strict",
      });
      // Lưu role vào localStorage để client-side layout có thể đọc
      if (typeof window !== "undefined") {
        const resJson = await res.json();
        localStorage.setItem("systemUserRole", resJson?.data?.role || "");
        localStorage.setItem("systemUserName", resJson?.data?.username || "");
      }
      setIsAuthenticated(true);
      setTimeout(() => {
        router.push("/");
      }, 100);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    // Gọi API để xóa cookie httpOnly phía server (nếu cần)
    await fetch("/api/system-users/logout", { method: "POST" });
    // Xóa cookie phía client (dự phòng)
    Cookies.remove("systemUserAuth", { path: "/" });
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
