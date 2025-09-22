import { Role } from "@/hooks/use-permissions";

// Configuração de permissões por rota
export const ROUTE_PERMISSIONS = {
  // Rotas do SYSADMIN - acesso a todos os estabelecimentos
  "/admin": ["SYSADMIN"],

  // Rotas do OWNER - acesso total ao estabelecimento
  "/dashboard": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/products": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/tables": ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  "/orders": ["SYSADMIN", "OWNER", "MANAGER", "USER"],

  // Rotas do MANAGER - algumas funcionalidades administrativas
  "/printers": ["SYSADMIN", "OWNER", "MANAGER"],

  // Rotas do OWNER - apenas proprietários
  "/users": ["SYSADMIN", "OWNER"],
  "/payment-method": ["SYSADMIN", "OWNER"],
  "/settings": ["SYSADMIN", "OWNER"],
  "/caixas": ["SYSADMIN", "OWNER"],
} as const;

// Configuração de permissões para itens do menu
export const MENU_PERMISSIONS = {
  // Seção Restaurante
  dashboard: ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  commands: ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  products: ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  tables: ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  orders: ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  printers: ["SYSADMIN", "OWNER", "MANAGER"],

  // Seção Sistema
  users: ["SYSADMIN", "OWNER"],
  paymentMethod: ["SYSADMIN", "OWNER"],
  settings: ["SYSADMIN", "OWNER"],
  caixas: ["SYSADMIN", "OWNER"],
} as const;

// Configuração de permissões para funcionalidades específicas
export const FEATURE_PERMISSIONS = {
  // Gestão de usuários
  createUser: ["SYSADMIN", "OWNER"],
  editUser: ["SYSADMIN", "OWNER"],
  deleteUser: ["SYSADMIN", "OWNER"],

  // Configurações do sistema
  editSettings: ["SYSADMIN", "OWNER"],
  viewSettings: ["SYSADMIN", "OWNER"],

  // Gestão de produtos
  createProduct: ["SYSADMIN", "OWNER", "MANAGER"],
  editProduct: ["SYSADMIN", "OWNER", "MANAGER"],
  deleteProduct: ["SYSADMIN", "OWNER"],

  // Gestão de pedidos
  viewOrders: ["SYSADMIN", "OWNER", "MANAGER", "USER"],
  editOrders: ["SYSADMIN", "OWNER", "MANAGER"],
  cancelOrders: ["SYSADMIN", "OWNER", "MANAGER"],

  // Gestão de mesas
  manageTables: ["SYSADMIN", "OWNER", "MANAGER"],

  // Relatórios e caixas
  viewReports: ["SYSADMIN", "OWNER"],
  manageCash: ["SYSADMIN", "OWNER"],
} as const;

// Função para verificar se um role tem permissão para uma rota
export function hasRoutePermission(userRole: Role, pathname: string): boolean {
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

// Função para verificar se um role tem permissão para um item do menu
export function hasMenuPermission(
  userRole: Role,
  menuItem: keyof typeof MENU_PERMISSIONS
): boolean {
  const allowedRoles = MENU_PERMISSIONS[menuItem];
  return allowedRoles.includes(userRole as any);
}

// Função para verificar se um role tem permissão para uma funcionalidade
export function hasFeaturePermission(
  userRole: Role,
  feature: keyof typeof FEATURE_PERMISSIONS
): boolean {
  const allowedRoles = FEATURE_PERMISSIONS[feature];
  return allowedRoles.includes(userRole as any);
}

// Função para obter todas as rotas que um role pode acessar
export function getAccessibleRoutes(userRole: Role): string[] {
  return Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    hasRoutePermission(userRole, route)
  );
}

// Função para obter todos os itens de menu que um role pode ver
export function getAccessibleMenuItems(
  userRole: Role
): (keyof typeof MENU_PERMISSIONS)[] {
  return Object.keys(MENU_PERMISSIONS).filter((menuItem) =>
    hasMenuPermission(userRole, menuItem as keyof typeof MENU_PERMISSIONS)
  ) as (keyof typeof MENU_PERMISSIONS)[];
}
