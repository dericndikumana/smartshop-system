import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";

import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { SessionTimeout } from "@/components/providers/session-timeout";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "SmartShop System",
  description: "Professional POS and inventory management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <NextTopLoader color="#0ea5e9" showSpinner={true} />
        <AuthProvider>
          <SessionTimeout />
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              disableTransitionOnChange
            >
              {children}
          <Toaster 
            position="top-center" 
            toastOptions={{
              classNames: {
                toast: "w-full flex p-4 rounded-lg shadow-sm font-medium text-sm border",
                success: "bg-[#e5f5ec] text-[#0f5132] border-[#c3e6cb]",
                error: "bg-[#ffe5e5] text-[#b02a37] border-[#f5c2c7]",
                info: "bg-blue-100 text-blue-800 border-blue-200",
                warning: "bg-amber-100 text-amber-800 border-amber-200",
              }
            }}
          />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
