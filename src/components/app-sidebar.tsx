"use client";
import Logo from "@/assets/logo/logo.svg";
import { SearchForm } from "@/components/search-form";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Role } from "@/hooks/use-permissions";
import { authService } from "@/lib/auth";
import { hasMenuPermission } from "@/lib/permissions";
import {
  RiArtboard2Line,
  RiDashboard2Line,
  RiLogoutBoxLine,
  RiMoneyDollarCircleLine,
  RiPriceTag3Line,
  RiPrinterLine,
  RiQrCodeFill,
  RiSecurePaymentLine,
  RiSettings3Line,
  RiShoppingBasketLine,
  RiUserFollowLine,
} from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Importa usePathname
import * as React from "react";

const data = {
  admin: [
    {
      name: "Bistro Admin",
      logo: Logo.src,
    },
  ],
  restaurant: [
    {
      name: "Restaurante teste",
      cnpj: "00000000000000",
      logo: "",
    },
  ],
  navMain: [
    {
      id: "p1",
      title: "Restaurante",
      url: "#",
      items: [
        {
          id: "p11",
          title: "Dashboard",
          url: "/dashboard",
          icon: RiDashboard2Line,
          permission: "dashboard" as const,
        },
        {
          id: "p14",
          title: "Produtos",
          url: "/products",
          icon: RiPriceTag3Line,
          permission: "products" as const,
        },
        {
          id: "p15",
          title: "Mesas",
          url: "/tables",
          icon: RiArtboard2Line,
          permission: "tables" as const,
        },
        {
          id: "p16",
          title: "Comandas",
          url: "/commands",
          icon: RiQrCodeFill,
          permission: "commands" as const,
        },
        {
          id: "p17",
          title: "Impressoras",
          url: "/printers",
          icon: RiPrinterLine,
          permission: "printers" as const,
        },
        {
          id: "p18",
          title: "Pedidos",
          url: "/buffet",
          icon: RiShoppingBasketLine,
          permission: "orders" as const,
        },
      ],
    },
    {
      id: "p2",
      title: "Sistema",
      url: "#",
      items: [
        {
          id: "p21",
          title: "Usuários",
          url: "/users",
          icon: RiUserFollowLine,
          permission: "users" as const,
        },
        {
          id: "p22",
          title: "Formas de pagamento",
          url: "/payment-method",
          icon: RiSecurePaymentLine,
          permission: "paymentMethod" as const,
        },
        {
          id: "p23",
          title: "Configurações",
          url: "/settings",
          icon: RiSettings3Line,
          permission: "settings" as const,
        },
        {
          id: "p24",
          title: "Caixas",
          url: "/caixas",
          icon: RiMoneyDollarCircleLine,
          permission: "caixas" as const,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname(); // Obtém a rota atual
  const [activeItem, setActiveItem] = React.useState<string>("");

  // Define o item ativo com base na rota atual
  React.useEffect(() => {
    data.navMain.forEach((group) => {
      group.items.forEach((item) => {
        if (item.url === pathname) {
          setActiveItem(item.title);
        }
      });
    });
  }, [pathname]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex justify-start ml-2 items-center gap-3">
          <Image
            alt="logo"
            src={Logo.src}
            className="w-10 h-10"
            width={1080}
            height={1080}
          />
          <span className="font-semibold">Bistro Admin</span>
        </div>
        <hr className="border-t border-border mx-2 -mt-px" />
        {/* <TeamSwitcher teams={data.restaurant} /> */}
        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => {
          const user = authService.getUser();
          const userRole = user.role as Role;

          // Filtrar itens do menu baseado nas permissões
          const accessibleItems = group.items.filter((item) =>
            item.permission
              ? hasMenuPermission(userRole, item?.permission)
              : true
          );

          // Se não há itens acessíveis no grupo, não renderizar o grupo
          if (accessibleItems.length === 0) {
            return null;
          }

          return (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel className="uppercase text-muted-foreground/60">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-2">
                <SidebarMenu>
                  {accessibleItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                        isActive={activeItem === item.title}
                        onClick={() => setActiveItem(item.title)}
                      >
                        <Link href={item.url}>
                          {item.icon && (
                            <item.icon
                              className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                              size={22}
                              aria-hidden="true"
                            />
                          )}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
              onClick={() => authService.logout()}
            >
              <RiLogoutBoxLine
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
