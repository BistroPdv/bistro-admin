"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserDropdown from "@/components/user-dropdown";
import { Separator } from "@radix-ui/react-separator";
import { usePathname } from "next/navigation";

interface ConditionalHeaderProps {
  breadcrumbs: React.ReactNode;
}

export function ConditionalHeader({ breadcrumbs }: ConditionalHeaderProps) {
  const pathname = usePathname();

  // Ocultar header na rota /buffet
  if (pathname.startsWith("/buffet")) {
    return null;
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger className="-ms-4" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        {breadcrumbs}
      </div>
      <div className="flex gap-3 ml-auto">
        <UserDropdown />
        <ThemeToggle />
      </div>
    </header>
  );
}
