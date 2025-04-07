import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;

  breadcrumbs: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${fontSans.variable} font-sans antialiased h-full flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col flex-1 h-full">{children}</div>
          <Toaster position="top-right" className="!top-16" />
        </ThemeProvider>
      </body>
    </html>
  );
}
