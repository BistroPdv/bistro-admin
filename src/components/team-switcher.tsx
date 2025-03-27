"use client";

import Image from "next/image";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RiAddLine, RiExpandUpDownLine, RiStore3Line } from "@remixicon/react";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    cnpj: string;
    logo?: string;
  }[];
}) {
  const [activeTeam, setActiveTeam] = React.useState<{
    name: string;
    cnpj: string;
    logo: string;
  } | null>(null);

  if (!teams.length) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-3 [&>svg]:size-auto"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden bg-zinc-500 dark:bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTeam && activeTeam.logo ? (
                  <Image
                    src={activeTeam?.logo}
                    width={36}
                    height={36}
                    alt={activeTeam.name}
                  />
                ) : (
                  <RiStore3Line />
                )}
              </div>
              <div className="grid flex-1 text-left text-base leading-tight">
                <span className="truncate font-medium">
                  {activeTeam?.name ?? "Restaurante"}
                </span>
              </div>
              <RiExpandUpDownLine
                className="ms-auto text-muted-foreground/60"
                size={20}
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="uppercase text-muted-foreground/60 text-xs">
              Empresas
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.cnpj}
                onClick={() =>
                  setActiveTeam({ ...team, logo: team.logo || "" })
                }
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md overflow-hidden">
                  {team.logo && (
                    <Image
                      src={team.logo || ""}
                      width={36}
                      height={36}
                      alt={team.name}
                    />
                  )}
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <RiAddLine className="opacity-60" size={16} aria-hidden="true" />
              <div className="font-medium">Adicionar restaurante</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
