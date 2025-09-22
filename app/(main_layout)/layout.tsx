import "@/app/globals.css";
import { Layout } from "@/components/layout";
import type React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}

export const metadata = {
  generator: "v0.app",
};
