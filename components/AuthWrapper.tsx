"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

export default function AuthWrapper({ children }: PropsWithChildren) {
  const { isChecking, isAuthenticated, me } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isChecking && !me) router.push("/login");
  }, [isChecking]);

  if (!me && isChecking) return null;

  return <>{children}</>;
}
