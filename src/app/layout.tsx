
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
  // Super App Vision Note: The root layout is designed to be cohesive.
  // The AppHeader and AppFooter provide consistent navigation and branding,
  // while the main content area is flexible enough to accommodate the
  // diverse dashboards and modules of the super app, ensuring a unified
  // user experience for all 21 stakeholder types.
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-muted/40`} suppressHydrationWarning>
        <AppHeader />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex-grow pb-20 md:pb-8">
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
