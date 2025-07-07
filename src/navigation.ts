
import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';
import {locales} from './i18n-config';

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    // No path-specific translations for now
    pathnames: {},
  });
