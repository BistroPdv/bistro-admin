import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Usuários",
};
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
