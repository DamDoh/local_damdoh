
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { APP_NAME } from "@/lib/constants";
import { getMessages } from 'next-intl/server';
import { Providers } from "@/components/Providers";
import { locales } from '../../../i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

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
    <Providers locale={locale} messages={messages}>
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
    </Providers>
  );
}
