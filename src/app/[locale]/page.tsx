
"use client";

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/Skeletons';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/auth-utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomepage, MobileHomepageSkeleton } from '@/components/dashboard/MobileHomepage';
import { useHomepageRedirect } from '@/hooks/useHomepageRedirect';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Toaster } from '@/components/ui/toaster';
import { LoggedInLayout } from '@/components/layout/LoggedInLayout';
import { LandingPageLayout } from '@/components/layout/LandingPageLayout';

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

  // If user is not logged in, show the landing page with its own simple layout.
  if (!user) {
    return (
        <LandingPageLayout>
            <LandingPage />
        </LandingPageLayout>
    );
  }
  
  // If user is logged in, show the main dashboard within the full sidebar layout.
  return (
    <LoggedInLayout>
        {isMobile ? <MobileHomepage /> : <MainDashboard />}
    </LoggedInLayout>
  );
}

export default function RootPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
        <HomePageContent />
    </Suspense>
  );
}
