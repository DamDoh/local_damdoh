
"use client";

import { Suspense, useEffect } from 'react';
import { PageSkeleton } from '@/components/Skeletons';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/auth-utils';
import { useHomepageRedirect } from '@/hooks/useHomepageRedirect';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomepage, MobileHomepageSkeleton } from '@/components/dashboard/MobileHomepage';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';


function HomePageContent() {
  const { user, loading: authLoading } = useAuth();
  const { isPreferenceLoading } = useHomepageRedirect();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  
  // This hook now also returns the loading state.
  const { homepagePreference } = useHomepagePreference();

  useEffect(() => {
    // This effect ensures redirection happens after preferences are loaded.
    if (!isPreferenceLoading && homepagePreference && homepagePreference !== pathname && pathname === '/') {
      router.replace(homepagePreference);
    }
  }, [homepagePreference, isPreferenceLoading, pathname, router]);

  
  if (authLoading || isPreferenceLoading || isMobile === undefined) {
    // If we know it's going to be mobile, show the mobile-specific skeleton
    if(isMobile) {
      return <MobileHomepageSkeleton />;
    }
    return <PageSkeleton />;
  }

  if (!user) {
    return <LandingPage />;
  }
  
  // On mobile devices, show a different, more app-like homepage
  if (isMobile) {
    return <MobileHomepage />;
  }

  // If a homepage preference is set and we're not on it, don't render MainDashboard to avoid a flash of content.
  if (homepagePreference && homepagePreference !== pathname) {
      return <PageSkeleton />;
  }

  return <MainDashboard />;
}

export default function RootPage() {
  const t = useTranslations('LandingPage'); // Or any other namespace
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
