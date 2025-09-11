"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

// Create a default context value
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication cookie when component is mounted
    const authStatus = Cookies.get("isAuthenticated")
    setIsAuthenticated(authStatus === "true")
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === "admin@chatx.vn" && password === "ChatX@2025") {
      // Set cookie with path and domain to ensure it's used across the entire application
      Cookies.set("isAuthenticated", "true", {
        expires: 7, // Cookie expires after 7 days
        path: "/", // Apply to all paths
        sameSite: "strict", // Enhance security
      })

      // Update state after setting cookie
      setIsAuthenticated(true)

      // Redirect to home page after successful login
      setTimeout(() => {
        router.push("/")
      }, 100)

      return true
    } else {
      return false
    }
  }

  const logout = () => {
    // Remove cookie when logging out
    Cookies.remove("isAuthenticated", { path: "/" })
    setIsAuthenticated(false)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
