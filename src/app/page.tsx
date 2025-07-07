
import { redirect } from '@/navigation';
import { locales } from '@/i18n-config';

// This page only redirects to the default locale.
export default function RootPage() {
  redirect(`/${locales[0]}`);
}
