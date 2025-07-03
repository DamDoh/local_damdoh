
import type { Metadata } from "next";
import '../globals.css';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { APP_NAME } from "@/lib/constants";
import { Providers } from "@/components/Providers";
import {NextIntlClientProvider} from 'next-intl';
import { notFound } from "next/navigation";
 
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
  params,
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const { locale } = params;
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
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
