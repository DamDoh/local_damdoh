// This file is part of an obsolete directory structure and can be safely deleted.
// The active logic for this page is in /src/app/[locale]/page.tsx.
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useHomepagePreference } from "@/hooks/useHomepagePreference";

export default function DeprecatedRootPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

  useEffect(() => {
    if (!isPreferenceLoading) {
      if (homepagePreference && homepagePreference !== pathname && pathname === '/') {
        router.replace(homepagePreference);
      } else {
        // Fallback to the new locale-based root if no preference is set
        router.replace('/en');
      }
    }
  }, [homepagePreference, isPreferenceLoading, pathname, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}
