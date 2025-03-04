import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { IntlProvider } from "@/components/providers/intl-provider";
import { getLocale } from "next-intl/server";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScriptFlow",
  description: "Ai powered scene breakdowns",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <IntlProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <div className="[--header-height:calc(theme(spacing.14))]">
                  <SidebarProvider className="flex flex-col">
                    <SiteHeader />
                    <div className="flex flex-1">
                      <AppSidebar />
                      <SidebarInset>
                        {children}
                        <Toaster />
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </div>
              </ThemeProvider>
            </IntlProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
