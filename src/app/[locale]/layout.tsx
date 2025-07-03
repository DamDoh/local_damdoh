import type { Metadata } from "next";
import '../globals.css';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { APP_NAME } from "@/lib/constants";
import { Providers } from "@/components/Providers";
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
 
export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "The Global Agricultural Supply Chain Platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// All locales are listed here to validate the parameter
const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];
 
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  let messages;
  try {
    // Load the messages for the current locale directly, bypassing getMessages()
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    // If a translation file is missing, you can either log the error
    // and use a fallback (like English) or show a 404 page.
    console.error(`Could not load messages for locale: ${locale}`, error);
    notFound();
  }
 
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
