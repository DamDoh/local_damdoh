
"use client";

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/Skeletons';
import { MainDashboard } from '@/components/dashboard/MainDashboard'; // Corrected import path
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/auth-utils';
import { useHomepageRedirect } from '@/hooks/useHomepageRedirect';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomepage, MobileHomepageSkeleton } from '@/components/dashboard/MobileHomepage';


function HomePageContent() {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  
  // Custom hook to handle redirection if a different homepage is set
  useHomepageRedirect();

  if (authLoading || isMobile === undefined) {
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

  return <MainDashboard />;
}

export default function RootPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
