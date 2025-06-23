
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation"; // New Import

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
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
 children: React.ReactNode;
}>) {
  return (
    // Conceptual Structure for a 'Super App' Layout
    // The goal is a cohesive shell that integrates various modules seamlessly.
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-muted/40`} suppressHydrationWarning>
        {/* Super App Header Area:
 This header needs to be adaptive based on the current module/page.
 It should consistently include:
 - Branding (DamDoh logo)
 - Universal Search Bar (prominently placed, potentially with AI integration for contextual search)
 - Quick Access/Notifications (e.g., unread messages, alerts)
 - User Profile/Account Access
 The current AppHeader is a starting point but needs significant enhancement for this role.
 */}
        <AppHeader />

        {/* Conceptual Layout Structure for Desktop/Tablet */}
        {/* This layout provides a persistent sidebar for navigation on larger screens */}
        <div className="flex flex-1 overflow-hidden">
          {/*
            Main Content Area Integration:
            This is where the content of the specific page/module (like Messaging, Marketplace, etc.)
            will be rendered based on the current route.

            The `children` prop provided by Next.js automatically handles rendering
            the correct page component based on the route.

            We can conceptually think of this area conditionally rendering the
            refined static UI from files like `src/app/messages/page.tsx`,
            `src/app/sustainability/page.tsx`, etc.
          */}
          {/* Main Content Area (scrollable) */}
          {/* This area will dynamically render the content of the active module (Marketplace, Traceability, Financial Hub, etc.). */}
          <main className="flex-1 overflow-y-auto container mx-auto max-w-screen-2xl p-4 md:p-6 lg:p-8 flex-grow pb-20 md:pb-8"> {/* Added pb-20 for mobile */}
            {children}
          </main>
        </div>

        {/*
          Super App Main Content Area (Mobile - no persistent sidebar):
          On smaller screens, the sidebar is hidden, and the header/bottom navigation are primary navigation.
          The `main` container above is the primary content area on ALL screen sizes now,
          but the flex layout container around it provides the sidebar structure on larger screens.
        */}

        <Toaster />
        <AppFooter />
        <MobileBottomNavigation /> {/* Added Mobile Bottom Navigation */}
      </body>
    </html>
  );
}
