
"use client";

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/Skeletons';
import { MainDashboard } from '@/components/dashboard/page';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/auth-utils';
import { useHomepageRedirect } from '@/hooks/useHomepageRedirect';

function HomePageContent() {
  const { user, loading: authLoading } = useAuth();
  
  // Custom hook to handle redirection if a different homepage is set
  useHomepageRedirect();

  if (authLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return <LandingPage />;
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
