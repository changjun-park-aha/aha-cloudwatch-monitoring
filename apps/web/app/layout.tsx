import type React from "react";
import "@aha-monitoring/ui/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js App",
  description: "Next.js app in a Turborepo monorepo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
