
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import './globals.css';

// This is the root layout. It's minimal.
// The main layout with providers, header, and footer is in [locale]/layout.tsx
// This structure is required for next-intl to work correctly with the App Router.

export const metadata: Metadata = {
  title: "DamDoh",
  description: "The Global Agricultural Supply Chain Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The lang property will be set in the nested [locale]/layout.tsx
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
