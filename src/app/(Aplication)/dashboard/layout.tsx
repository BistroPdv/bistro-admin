import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Bistro Admin - Dashboard",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col flex-1 h-full">{children}</div>;
}
