
"use client";

import { Suspense, useEffect } from 'react';
import { PageSkeleton } from '@/components/Skeletons';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/auth-utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomepage, MobileHomepageSkeleton } from '@/components/dashboard/MobileHomepage';
import { useHomepageRedirect } from '@/hooks/useHomepageRedirect';

function HomePageContent() {
  const { user, loading: authLoading } = useAuth();
  const { isPreferenceLoading } = useHomepageRedirect();
  const isMobile = useIsMobile();
  
  if (authLoading || isPreferenceLoading || isMobile === undefined) {
    if(isMobile) {
      return <MobileHomepageSkeleton />;
    }
    return <PageSkeleton />;
  }

  if (!user) {
    return <LandingPage />;
  }
  
  if (isMobile) {
    return <MobileHomepage />;
  }

  return <MainDashboard />;
}

export default function RootPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
