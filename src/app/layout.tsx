
// This is the root layout. It's required by Next.js but is kept simple
// to allow the internationalized layout in `[locale]/layout.tsx` to
// render the main `<html>` and `<body>` tags. It now returns the children
// directly without wrapping them in `<html>` and `<body>` as this is handled
// in the locale-specific layout.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
