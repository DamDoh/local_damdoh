
import type { Metadata } from "next";
import '../globals.css';
import { APP_NAME } from "@/lib/constants";
import { Providers } from "@/components/Providers-new";
import {NextIntlClientProvider} from 'next-intl';
import { getLocale, getMessages, getRequestConfig } from 'next-intl/server';
import { locales } from '@/i18n-config';
import { notFound } from "next/navigation";
 
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
  params,
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Await params before using them
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  // Use the new API
  const messages = await getMessages();
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
