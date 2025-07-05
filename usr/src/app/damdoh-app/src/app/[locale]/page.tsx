
"use client";

import { useEffect, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainDashboard } from '@/components/dashboard/page';
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/lib/auth-utils';
import { LandingPage } from '@/components/landing/LandingPage';

function PageSkeleton() {
    return (
        <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3 lg:col-span-2">
                 <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="md:col-span-6 lg:col-span-7 space-y-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
            <div className="hidden lg:block md:col-span-3">
                 <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );
}

function HomePageContent() {
    const { user, loading: authLoading } = useAuth();
  
    if (authLoading) {
      return <PageSkeleton />;
    }
  
    if (!user) {
      return <LandingPage />;
    }
  
    return <MainDashboard />;
}

export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

  useEffect(() => {
      if (!isPreferenceLoading && homepagePreference && homepagePreference !== pathname && pathname === '/') {
        router.replace(homepagePreference);
      }
  }, [homepagePreference, isPreferenceLoading, pathname, router]);

  if (isPreferenceLoading || (homepagePreference && homepagePreference !== "/" && pathname === "/")) {
      return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
