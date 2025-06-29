
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHomepagePreference } from '@/hooks/useHomepagePreference';
import { useTranslation } from 'react-i18next';

// This page now acts as a dynamic entry point.
// It checks for a user-defined homepage preference and redirects.
// If no preference is set, it defaults to the main dashboard.
export default function RootPage() {
    const router = useRouter();
    const { t } = useTranslation('common');
    const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

    useEffect(() => {
        if (!isPreferenceLoading) {
            if (homepagePreference && homepagePreference !== '/') {
                router.replace(homepagePreference);
            } else {
                // Default to the dashboard if no preference is set or if preference is '/'
                router.replace('/dashboard');
            }
        }
    }, [homepagePreference, isPreferenceLoading, router]);

    // Render a simple loading state to avoid flash of content
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>{t('loading')}</p>
        </div>
    );
}
