
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-utils";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { APP_NAME } from "@/lib/constants";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const queryClient = new QueryClient();

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "The Global Agricultural Supply Chain Platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    // The <html> and <body> tags are in the root layout at /src/app/layout.tsx
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <AppHeader />
              <main className="container mx-auto max-w-screen-2xl px-4 py-6 md:px-6 lg:px-8 print:p-0">
                {children}
              </main>
              {/* Spacer for mobile bottom nav */}
              <div className="md:hidden h-16" />
            </div>
            <MobileBottomNavigation />
            <AppFooter />
            <Toaster />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
