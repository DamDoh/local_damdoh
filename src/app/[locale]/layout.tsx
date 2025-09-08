
import type { Metadata } from "next";
import '../globals.css';
import { APP_NAME } from "@/lib/constants";
import { Providers } from "@/components/Providers";
import {NextIntlClientProvider} from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
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
  const { locale } = params;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  // This function is necessary to enable static rendering of locales.
  unstable_setRequestLocale(locale);
 
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
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
