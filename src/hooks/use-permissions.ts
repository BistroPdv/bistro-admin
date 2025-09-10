import { authService } from "@/lib/auth";

export type Role = "SYSADMIN" | "OWNER" | "MANAGER" | "USER";

interface PermissionConfig {
  roles: Role[];
}

export function usePermissions() {
  const user = authService.getUser();

  const hasPermission = (config: PermissionConfig) => {
    if (!user) return false;
    return config.roles.includes(user.role as Role);
  };

  const isSysAdmin = () => hasPermission({ roles: ["SYSADMIN"] });
  const isOwner = () => hasPermission({ roles: ["SYSADMIN", "OWNER"] });
  const isManager = () =>
    hasPermission({ roles: ["SYSADMIN", "OWNER", "MANAGER"] });
  const isUser = () =>
    hasPermission({ roles: ["SYSADMIN", "OWNER", "MANAGER", "USER"] });

  // Funções específicas para verificar se o usuário tem acesso a funcionalidades
  const canAccessRoute = (pathname: string) => {
    if (!user) return false;
    const { hasRoutePermission } = require("@/lib/permissions");
    return hasRoutePermission(user.role as Role, pathname);
  };

  const canAccessMenu = (menuItem: string) => {
    if (!user) return false;
    const { hasMenuPermission } = require("@/lib/permissions");
    return hasMenuPermission(user.role as Role, menuItem as any);
  };

  const canUseFeature = (feature: string) => {
    if (!user) return false;
    const { hasFeaturePermission } = require("@/lib/permissions");
    return hasFeaturePermission(user.role as Role, feature as any);
  };

  return {
    hasPermission,
    isSysAdmin,
    isOwner,
    isManager,
    isUser,
    canAccessRoute,
    canAccessMenu,
    canUseFeature,
    currentRole: user?.role as Role,
  };
}
