"use client";

import { LoadingScreen } from "@/components/loading-screen";
import { usePermissions } from "@/hooks/use-permissions";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mapeamento de rotas para roles necessários
const ROUTE_ROLES_MAP: Record<string, string[]> = {
  "/dashboard": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/products": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/tables": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/orders": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/printers": ["SYSADMIN", "OWNER", "MANAGER"],
  "/users": ["SYSADMIN", "OWNER"],
  "/settings": ["SYSADMIN", "OWNER"],
  "/caixas": ["SYSADMIN", "OWNER"],
  "/payment-method": ["SYSADMIN", "OWNER"],
};

export function RouteProtection({ children }: { children: React.ReactNode }) {
  const { currentRole, hasPermission } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (isChecking) {
        console.warn("[RouteProtection] Timeout na verificação de permissões");
        setHasAccess(true);
        setIsChecking(false);
      }
    }, 3000);

    // Pular verificação para rotas públicas
    if (
      pathname === "/" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api")
    ) {
      clearTimeout(timeout);
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    // Se ainda não temos o role do usuário, continuar carregando
    if (!currentRole) {
      return;
    }

    // Encontrar a rota correspondente no mapeamento
    const route = Object.keys(ROUTE_ROLES_MAP).find((route) =>
      pathname.startsWith(route)
    );

    // Se a rota não estiver no mapeamento, permitir acesso
    if (!route) {
      console.log(
        `[RouteProtection] Rota ${pathname} não mapeada, permitindo acesso`
      );
      clearTimeout(timeout);
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    const requiredRoles = ROUTE_ROLES_MAP[route];

    // Verificar se o usuário tem permissão
    if (hasPermission({ roles: requiredRoles as any })) {
      console.log(
        `[RouteProtection] Acesso permitido para ${currentRole} em ${pathname}`
      );
      clearTimeout(timeout);
      setHasAccess(true);
      setIsChecking(false);
    } else {
      console.log(
        `[RouteProtection] Acesso negado para ${currentRole} em ${pathname}`
      );
      console.log(
        `[RouteProtection] Roles necessários: ${requiredRoles.join(", ")}`
      );
      clearTimeout(timeout);
      router.push("/dashboard");
    }

    return () => clearTimeout(timeout);
  }, [currentRole, pathname, hasPermission, router, isChecking]);

  // Mostrar loading enquanto verifica permissões
  if (isChecking) {
    return (
      <LoadingScreen
        title="Verificando permissões"
        description="Aguarde enquanto verificamos seu acesso..."
        size="md"
      />
    );
  }

  // Se não tem acesso, não renderizar nada (o redirect vai acontecer)
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
