import { Inter } from "next/font/google";

import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
  breadcrumb,
}: Readonly<{
  children: React.ReactNode;
  breadcrumb: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scheme-only-dark">
      <body className={`${fontSans.variable} font-sans antialiased`}>
        {breadcrumb}
        {children}
      </body>
    </html>
  );
}
