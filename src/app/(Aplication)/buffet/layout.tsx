import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { RouteProtection } from "@/components/route-protection";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { Providers } from "../providers";

export default function BuffetLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <RouteProtection>
        <main className="flex flex-col h-full">
          <Providers>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <SidebarInset className="overflow-hidden flex flex-col h-full">
                <div className="flex flex-1 flex-col overflow-hidden">
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
