"use client";

import type React from "react";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function Layout({ children }: { children: React.ReactNode }) {
  // Use try/catch to handle the case when auth context is not available
  const [logout, setLogout] = useState(() => {});
  const pathname = usePathname();
  const auth = useAuth();
  const [authReady, setAuthReady] = useState(!!auth);

  useEffect(() => {
    if (auth) {
      setLogout(() => auth.logout);
      setAuthReady(true);
    } else {
      console.warn("Auth context not available");
      setAuthReady(false);
    }
  }, [auth]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center">
              {/* Updated to use the white logo */}
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logowhite-za3MHloNLQsaQHuB3FaTuyq9cQcOuL.png"
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
                <Link
                  href="/user"
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    pathname === "/user"
                      ? "bg-white text-black shadow-md transform scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  System User
                </Link>
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center gap-2 bg-gray-900 rounded-full p-1 pl-3">
              <span className="text-sm text-gray-300">admin@chatx.vn</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-800"
                onClick={logout}
                disabled={!authReady}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
