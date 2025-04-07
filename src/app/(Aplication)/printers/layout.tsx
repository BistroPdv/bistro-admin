import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Impressoras",
};

export default function PrintersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
