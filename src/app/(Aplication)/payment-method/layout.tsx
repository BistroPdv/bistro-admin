import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Formas de pagamento",
};
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
