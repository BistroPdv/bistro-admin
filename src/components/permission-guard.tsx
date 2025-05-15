import { usePermissions } from "@/hooks/use-permissions";
import { ReactNode } from "react";

interface PermissionGuardProps {
  children: ReactNode;
  roles: ("OWNER" | "MANAGER" | "USER")[];
}

export function PermissionGuard({ children, roles }: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission({ roles })) {
    return null;
  }

  return <>{children}</>;
}
