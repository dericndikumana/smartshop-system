import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";

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
                success: "bg-green-500 text-white border-green-600",
                error: "bg-purple-600 text-white border-purple-700",
                info: "bg-blue-500 text-white border-blue-600",
                warning: "bg-amber-500 text-white border-amber-600",
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
