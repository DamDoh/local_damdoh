
"use client";

import { useEffect, Suspense } from 'react';
import { usePathname, useRouter } from '@/navigation';
import { useHomepagePreference } from '@/hooks/useHomepageRedirect';
import { MainDashboard as MainContent } from '@/components/dashboard/MainDashboard'; // Correctly import the component
import { PageSkeleton } from '@/components/Skeletons';

// This component remains the entry point for the dashboard logic on the main page.
export function MainDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

  useEffect(() => {
      if (!isPreferenceLoading && homepagePreference && homepagePreference !== pathname && pathname === '/') {
        router.replace(homepagePreference);
      }
  }, [homepagePreference, isPreferenceLoading, pathname, router]);

  // If a redirect is pending, show a skeleton to avoid flashing content.
  if (isPreferenceLoading || (homepagePreference && homepagePreference !== "/" && pathname === "/")) {
      return <PageSkeleton />;
  }

  // The MainContent component handles its own internal loading states.
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MainContent />
    </Suspense>
  );
}
