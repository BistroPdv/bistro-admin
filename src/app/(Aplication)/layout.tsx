import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import UserDropdown from "@/components/user-dropdown";
import { Separator } from "@radix-ui/react-separator";
import { ReactNode } from "react";

export default function MainLayout({
  children,
  breadcrumbs,
}: Readonly<{
  children: ReactNode;
  breadcrumbs: ReactNode;
}>) {
  // const segments = pathname.split("/").filter(Boolean);

  return (
    <main>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
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
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
            <div className="min-h-[100vh] flex-1 md:min-h-min">{children} </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
