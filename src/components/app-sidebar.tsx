"use client";
import Logo from "@/assets/bistro.png";
import { SearchForm } from "@/components/search-form";
import { TeamSwitcher } from "@/components/team-switcher";
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
import {
  RiCodeSSlashLine,
  RiDashboard2Line,
  RiLoginCircleLine,
  RiLogoutBoxLine,
  RiSettings3Line,
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
      logo: "",
    },
  ],
  navMain: [
    {
      title: "Seções",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: RiDashboard2Line,
        },
        {
          title: "Usuários",
          url: "/users",
          icon: RiUserFollowLine,
          isActive: true,
        },
        {
          title: "Produtos",
          url: "/products",
          icon: RiCodeSSlashLine,
        },
        {
          title: "Mesas",
          url: "/tables",
          icon: RiLoginCircleLine,
        },
      ],
    },
    {
      title: "Outros",
      url: "#",
      items: [
        {
          title: "Configurações",
          url: "/settings",
          icon: RiSettings3Line,
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
        <TeamSwitcher teams={data.restaurant} />
        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/60">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
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
        ))}
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto">
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
