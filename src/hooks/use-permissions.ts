import { authService } from "@/lib/auth";

type Role = "OWNER" | "MANAGER" | "USER";

interface PermissionConfig {
  roles: Role[];
}

export function usePermissions() {
  const user = authService.getUser();

  const hasPermission = (config: PermissionConfig) => {
    if (!user) return false;
    return config.roles.includes(user.role as Role);
  };

  const isOwner = () => hasPermission({ roles: ["OWNER"] });
  const isManager = () => hasPermission({ roles: ["OWNER", "MANAGER"] });
  const isUser = () => hasPermission({ roles: ["OWNER", "MANAGER", "USER"] });

  return {
    hasPermission,
    isOwner,
    isManager,
    isUser,
    currentRole: user?.role as Role,
  };
}
