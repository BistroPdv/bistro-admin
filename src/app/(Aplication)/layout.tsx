import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { ConditionalHeader } from "@/components/conditional-header";
import { PWAInit } from "@/components/pwa-init";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { RouteProtection } from "@/components/route-protection";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { Providers } from "./providers";

export default async function MainLayout({
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
                <ConditionalHeader breadcrumbs={breadcrumbs} />

                <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6 overflow-hidden">
                  <div className="flex-1 overflow-auto">{children}</div>
                </div>

                <PWAInit />
                <PWAInstallPrompt />
              </SidebarInset>
            </SidebarProvider>
          </Providers>
        </main>
      </RouteProtection>
    </AuthGuard>
  );
}
