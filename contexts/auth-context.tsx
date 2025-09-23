"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

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
    const handle = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setIsAuthenticated(true);
        localStorage.setItem("systemUserRole", res?.data?.role || "");
        localStorage.setItem("systemUserName", res?.data?.username || "");
      } catch (error) {
        router.push("/login");
      }
    };
    handle();
  }, [router]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        return false;
      }

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
    await fetch("/api/auth/logout", { method: "POST" });
    // Xóa cookie phía client (dự phòng)
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
