
"use client";

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/Skeletons';
import { MainDashboard } from '@/components/dashboard/page';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/auth-utils';
import { useHomepageRedirect } from '@/hooks/useHomepageRedirect';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomepage } from '@/components/dashboard/MobileHomepage';


function HomePageContent() {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  
  // Custom hook to handle redirection if a different homepage is set
  useHomepageRedirect();

  if (authLoading || isMobile === undefined) {
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
