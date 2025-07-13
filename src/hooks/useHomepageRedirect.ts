
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/navigation';
import { useHomepagePreference } from './useHomepagePreference';

export function useHomepageRedirect() {
    const router = useRouter();
    const pathname = usePathname();
    const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

    useEffect(() => {
        if (isPreferenceLoading) {
            return;
        }

        // The pathname from the locale-aware hook already strips the locale
        const effectivePath = pathname || '/';
        
        // Redirect from root ('/') to the preference if it exists and is not the root itself.
        if (homepagePreference && homepagePreference !== '/' && effectivePath === '/') {
            router.replace(homepagePreference);
        }
    }, [homepagePreference, isPreferenceLoading, pathname, router]);

    return { homepagePreference, isPreferenceLoading };
}
