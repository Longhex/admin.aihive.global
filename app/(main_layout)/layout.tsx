import "@/app/globals.css";
import AuthWrapper from "@/components/AuthWrapper";
import { Layout } from "@/components/layout";
import type React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <Layout>{children}</Layout>
    </AuthWrapper>
  );
}

export const metadata = {
  generator: "v0.app",
};
