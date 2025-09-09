import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Caixas",
};

export default function CaixasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
