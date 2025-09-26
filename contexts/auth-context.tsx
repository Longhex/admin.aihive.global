"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  username: string;
  role: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  me: null | User;
  isChecking: boolean;
}

// Create a default context value
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  me: null,
  isChecking: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [me, setMe] = useState(null);
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const handle = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setIsAuthenticated(true);
        setMe(res?.data?.data);
        localStorage.setItem("systemUserRole", res?.data?.role || "");
        localStorage.setItem("systemUserName", res?.data?.username || "");
      } catch (error) {
        // router.push("/login");
      } finally {
        setIsChecking(false);
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

      const resJson = await res.json();
      // Lưu role vào localStorage để client-side layout có thể đọc
      if (typeof window !== "undefined") {
        localStorage.setItem("systemUserRole", resJson?.data?.role || "");
        localStorage.setItem("systemUserName", resJson?.data?.username || "");
      }
      setMe(resJson);
      setIsAuthenticated(true);
      router.push("/");
      // setTimeout(() => {
      // }, 100);
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
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, me, isChecking }}
    >
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
