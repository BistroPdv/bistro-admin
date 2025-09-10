import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { RouteProtection } from "@/components/route-protection";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import UserDropdown from "@/components/user-dropdown";
import { Separator } from "@radix-ui/react-separator";
import { ReactNode } from "react";
import { Providers } from "./providers";

export default function MainLayout({
  children,
  breadcrumbs,
}: Readonly<{
  children: ReactNode;
  breadcrumbs: ReactNode;
}>) {
  return (
    <AuthGuard>
      <RouteProtection>
        <main className="flex flex-col h-full">
          <Providers>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8 flex flex-col h-full">
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
                <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6 overflow-hidden">
                  <div className="flex-1 overflow-auto">{children}</div>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Providers>
        </main>
      </RouteProtection>
    </AuthGuard>
  );
}
