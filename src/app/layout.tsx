// This is the root layout. It's required by Next.js but is kept simple.
// The main internationalized layout is now in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The lang attribute will be added by the [locale] layout
    <html>
      <body>{children}</body>
    </html>
  );
}
