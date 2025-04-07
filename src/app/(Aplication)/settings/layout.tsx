import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Configurações",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
