import { Role, usePermissions } from "@/hooks/use-permissions";
import { ReactNode } from "react";

interface PermissionGuardProps {
  children: ReactNode;
  roles: Role[];
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  roles,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission({ roles })) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Componente específico para diferentes níveis de acesso
export function SysAdminGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard roles={["SYSADMIN"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function OwnerGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard roles={["SYSADMIN", "OWNER"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function ManagerGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      roles={["SYSADMIN", "OWNER", "MANAGER"]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function UserGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      roles={["SYSADMIN", "OWNER", "MANAGER", "USER"]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}
