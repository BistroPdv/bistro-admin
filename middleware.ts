import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Configuração de permissões por rota
const ROUTE_PERMISSIONS = {
  // Rotas do SYSADMIN - acesso a todos os estabelecimentos
  "/admin": ["SYSADMIN"],

  // Rotas do OWNER - acesso total ao estabelecimento
  "/dashboard": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/products": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/tables": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/orders": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/printers": ["SYSADMIN", "OWNER", "MANAGER"],
  "/users": ["SYSADMIN", "OWNER"],
  "/payment-method": ["SYSADMIN", "OWNER"],
  "/settings": ["SYSADMIN", "OWNER"],
  "/caixas": ["SYSADMIN", "OWNER"],
} as const;

// Função para obter o role do usuário do token
function getUserRole(request: NextRequest): string | null {
  try {
    // Primeiro, tentar obter do cookie (se o token estiver sendo salvo em cookie)
    let token = request.cookies.get("token")?.value;

    // Se não estiver no cookie, tentar do header Authorization
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }
    }

    if (!token) {
      console.log("[Middleware] Token não encontrado em cookies ou headers");
      return null;
    }

    // Decodificar o JWT (em produção, use uma biblioteca como jose)
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("[Middleware] Token decodificado:", payload);
    return payload.role || null;
  } catch (error) {
    console.error("[Middleware] Erro ao decodificar token:", error);
    return null;
  }
}

// Função para verificar se o usuário tem permissão para a rota
function hasPermission(userRole: string | null, pathname: string): boolean {
  if (!userRole) return false;

  // Encontrar a rota correspondente
  const route = Object.keys(ROUTE_PERMISSIONS).find((route) =>
    pathname.startsWith(route)
  );

  if (!route) {
    // Se a rota não estiver na configuração, permitir acesso
    return true;
  }

  const allowedRoles =
    ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];
  return allowedRoles.includes(userRole as any);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pular middleware para rotas públicas
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Verificar se o usuário está autenticado
  const userRole = getUserRole(request);

  console.log(`[Middleware] Rota: ${pathname}, Role: ${userRole}`);

  if (!userRole) {
    console.log(
      `[Middleware] Usuário não autenticado, redirecionando para login`
    );
    // Redirecionar para login se não estiver autenticado
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Verificar permissões para a rota
  const hasAccess = hasPermission(userRole, pathname);
  console.log(
    `[Middleware] Usuário ${userRole} tem acesso a ${pathname}: ${hasAccess}`
  );

  if (!hasAccess) {
    console.log(
      `[Middleware] Acesso negado para ${userRole} em ${pathname}, redirecionando para dashboard`
    );
    // Redirecionar para dashboard se não tiver permissão
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configurar quais rotas o middleware deve executar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
