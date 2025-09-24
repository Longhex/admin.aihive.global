"use client";

import type React from "react";
import { Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { EditSettingDialog } from "./edit-setting-dialog";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout, me } = useAuth();
  const pathname = usePathname();
  const auth = useAuth();
  const authReady = !!auth;
  const [isOpenSettingDialog, setIsOpenSettingDialog] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const roleCookie = cookies.find((c) => c.startsWith("systemUserRole="));
      if (roleCookie) {
      } else {
        // Nếu chưa có cookie, thử lấy từ localStorage (dự phòng)
        const localRole = localStorage.getItem("systemUserRole");
      }
      // Get username from localStorage
      const localUsername = localStorage.getItem("systemUserName");
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center">
              {/* Updated to use the white logo */}
              <Image
                src="ai-hive-logo.svg"
                alt="Oriagent"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <nav className="hidden md:flex">
              <div className="flex items-center bg-gray-900 rounded-full p-1">
                <Link
                  href="/"
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    pathname === "/"
                      ? "bg-white text-black shadow-md transform scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Overview
                </Link>
                <Link
                  href="/user-list"
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    pathname === "/user-list"
                      ? "bg-white text-black shadow-md transform scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  User List
                </Link>
                {/* Only show System User tab for SuperAdmin */}
                {me?.role === "SuperAdmin" && (
                  <Link
                    href="/system-user"
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      pathname === "/system-user"
                        ? "bg-white text-black shadow-md transform scale-105"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    System User
                  </Link>
                )}
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div>
              {me?.role === "SuperAdmin" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpenSettingDialog(true)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-gray-900 rounded-full p-1 pl-3">
              <span className="text-sm text-gray-300">
                {me?.username || "-"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-800"
                // onClick={logout}
                disabled={!authReady}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </div>
            {authReady && (
              <Button
                variant="destructive"
                className="text-xs px-4 py-1 border border-red-500 bg-red-600 hover:bg-red-700 hover:text-white"
                onClick={logout}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
      {isOpenSettingDialog && (
        <EditSettingDialog onClose={() => setIsOpenSettingDialog(false)} />
      )}
    </div>
  );
}
