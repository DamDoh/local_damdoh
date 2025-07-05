
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHomepagePreference } from './useHomepagePreference';

export function useHomepageRedirect() {
    const router = useRouter();
    const pathname = usePathname();
    const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

    useEffect(() => {
        if (isPreferenceLoading) {
            return;
        }

        const pathWithoutLocale = pathname.substring(3); // Assumes /en, /fr etc.
        const effectivePath = pathWithoutLocale || '/';

        // Redirect from root to preference if it exists and is not the root itself
        if (homepagePreference && homepagePreference !== '/' && effectivePath === '/') {
            router.replace(homepagePreference);
        }
    }, [homepagePreference, isPreferenceLoading, pathname, router]);
}
