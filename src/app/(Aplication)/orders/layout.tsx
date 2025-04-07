import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Pedidos",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
