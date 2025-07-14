
import type { Metadata } from "next";
import '../globals.css';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { APP_NAME } from "@/lib/constants";
import { Providers } from "@/components/Providers";
import {NextIntlClientProvider} from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n-config';
import { notFound } from "next/navigation";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarNav } from "@/components/layout/AppSidebarNav";
 
export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "The Global Agricultural Supply Chain Platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}
 
export default async function LocaleLayout({
  children,
  params: {locale},
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  let messages;
  try {
    // The `default` is important here because of how JSON files are imported
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    // This will trigger a 404 if the message file for a valid locale is not found
    // This prevents a server crash if a file is missing.
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <SidebarProvider>
                <Sidebar>
                    <AppSidebarNav />
                </Sidebar>
                <SidebarInset>
                    <div className="flex flex-col min-h-screen">
                        <AppHeader />
                        <main className="flex-grow container mx-auto max-w-screen-2xl px-4 py-6 md:px-6 lg:px-8 print:p-0">
                            {children}
                        </main>
                        <div className="md:hidden h-16" />
                        <MobileBottomNavigation />
                        <OfflineIndicator />
                        <AppFooter />
                        <Toaster />
                    </div>
                </SidebarInset>
            </SidebarProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
