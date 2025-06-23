
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DamDoh - Agricultural Network',
  description: 'Connecting the agricultural supply chain.',
  icons: {
    icon: 'https://placehold.co/32x32.png',
    shortcut: 'https://placehold.co/32x32.png',
    apple: 'https://placehold.co/180x180.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
 children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-muted/40`} suppressHydrationWarning>
        <AppHeader />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto container mx-auto max-w-screen-2xl p-4 md:p-6 lg:p-8 flex-grow pb-20 md:pb-8">
            {children}
          </main>
        </div>

        <Toaster />
        <AppFooter />
        <MobileBottomNavigation />
      </body>
    </html>
  );
}
