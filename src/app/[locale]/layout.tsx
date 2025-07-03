import type { Metadata } from "next";
import '../globals.css';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { APP_NAME } from "@/lib/constants";
import { Providers } from "@/components/Providers";
import {NextIntlClientProvider} from 'next-intl';

// Helper function to load messages directly, bypassing getMessages()
async function getMessagesForLocale(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}. Falling back to 'en'.`, error);
    // Fallback to English if the locale file is missing or corrupt
    return (await import(`../../messages/en.json`)).default;
  }
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
  const messages = await getMessagesForLocale(locale);
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <AppHeader />
              <main className="flex-grow container mx-auto max-w-screen-2xl px-4 py-6 md:px-6 lg:px-8 print:p-0">
                {children}
              </main>
              <div className="md:hidden h-16" />
              <MobileBottomNavigation />
              <AppFooter />
              <Toaster />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
