import { RiUserFollowLine } from "@remixicon/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Usuários",
};

export default function Page() {
  return (
    <div className="text-2xl font-bold flex gap-2 items-center">
      <RiUserFollowLine /> Usuários
    </div>
  );
}
