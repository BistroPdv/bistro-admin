import { UserList } from "@/components/user-form";
import { RiUserFollowLine } from "@remixicon/react";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold flex gap-2 items-center">
        <RiUserFollowLine /> Usuários
      </div>
      <UserList />
    </div>
  );
}
