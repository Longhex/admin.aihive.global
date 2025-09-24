"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import { EditSettingDialog } from "./edit-setting-dialog";
import Navigation from "./navigation";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout, me } = useAuth();
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
              <Navigation />
            </nav>
          </div>
          <div className="flex items-center gap-2">
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
              {/* <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button> */}
            </div>
            <div className="flex items-center gap-2 bg-gray-900 rounded-full p-1 max-sm:hidden">
              <span className="text-sm text-gray-300 ml-3">
                {me?.username || "-"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-800"
                disabled={!authReady}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </div>
            {authReady && (
              <>
                <Button
                  variant="destructive"
                  className="text-xs px-4 py-1 border border-red-500 bg-red-600 hover:bg-red-700 hover:text-white max-sm:hidden"
                  onClick={logout}
                >
                  Logout
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" color="red" strokeWidth={3} />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-4 md:hidden">
          <Navigation />
        </div>
        {children}
      </main>
      {isOpenSettingDialog && (
        <EditSettingDialog onClose={() => setIsOpenSettingDialog(false)} />
      )}
    </div>
  );
}
