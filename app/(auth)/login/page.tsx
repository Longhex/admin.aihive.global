"use client";

import type React from "react";
import "@/app/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff } from "lucide-react";
import styles from "@/styles/particles.module.css";
import "@/styles/background-animation.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Chỉ chuyển hướng khi trang được tải lần đầu và đã xác thực
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác");
      }
      // Không cần chuyển hướng ở đây, login() đã xử lý
    } catch (error) {
      console.error("Login error:", error);
      setError("Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with video background */}
      <div className="hidden lg:block lg:w-2/3 relative overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://cdn.dribbble.com/uploads/48292/original/30fd1f7b63806eff4db0d4276eb1ac45.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Right side with login form */}
      <div className="w-full lg:w-2/3 flex flex-col p-8 lg:p-12 bg-black text-white relative overflow-hidden">
        <div className="animated-background"></div>
        <div className={styles.particleContainer}>
          <div className={styles.glowing}>
            <span style={{ "--i": 1 } as React.CSSProperties}></span>
            <span style={{ "--i": 2 } as React.CSSProperties}></span>
            <span style={{ "--i": 3 } as React.CSSProperties}></span>
          </div>
          <div className={styles.glowing}>
            <span style={{ "--i": 1 } as React.CSSProperties}></span>
            <span style={{ "--i": 2 } as React.CSSProperties}></span>
            <span style={{ "--i": 3 } as React.CSSProperties}></span>
          </div>
          <div className={styles.glowing}>
            <span style={{ "--i": 1 } as React.CSSProperties}></span>
            <span style={{ "--i": 2 } as React.CSSProperties}></span>
            <span style={{ "--i": 3 } as React.CSSProperties}></span>
          </div>
          <div className={styles.glowing}>
            <span style={{ "--i": 1 } as React.CSSProperties}></span>
            <span style={{ "--i": 2 } as React.CSSProperties}></span>
            <span style={{ "--i": 3 } as React.CSSProperties}></span>
          </div>
        </div>
        <div className="flex items-center justify-center h-full relative z-20">
          <div className="max-w-md w-full bg-gray-900 p-8 rounded-[20px] shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                {/* Updated to use the white logo */}
                <Image
                  src="ai-hive-logo.svg"
                  alt="Oriagent"
                  width={160}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                Tiếng Việt (Việt Nam)
              </Button>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-white">
              Xin chào, quản trị viên! 👋
            </h2>
            <p className="text-gray-400 mb-8">
              Chào mừng các lãnh đạo đăng nhập vào Admin quản lý khách hàng của
              chatx
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Tên đăng nhập
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 text-white border-gray-700"
                  placeholder="Nhập tên đăng nhập được cấp cho bạn"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 bg-gray-800 text-white border-gray-700"
                    placeholder="Nhập mật khẩu được cấp cho bạn"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Đang đăng nhập</span>
                    <span className="animate-spin">⏳</span>
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-gray-400">
              Bằng cách nhấn vào "Đăng ký tài khoản", tôi đồng ý với{" "}
              <a href="#" className="text-indigo-400 hover:underline">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-indigo-400 hover:underline">
                Chính sách Bảo mật
              </a>{" "}
              của ChatX và đồng ý nhận thông tin cập nhật, ưu đãi đặc biệt và
              email quảng cáo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
