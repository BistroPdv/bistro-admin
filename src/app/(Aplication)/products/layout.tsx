import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Produtos",
};

import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col flex-1 h-full">{children}</div>;
}
