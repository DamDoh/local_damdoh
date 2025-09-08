
"use client";

import { useAuth } from '@/lib/auth-utils';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { LandingPageLayout } from '@/components/layout/LandingPageLayout';
import { LandingPage } from '@/components/landing/LandingPage';
import { PageSkeleton } from '@/components/Skeletons';

export default function Home() {
    const { user, loading } = useAuth();

    if (loading) {
        return <PageSkeleton />; 
    }
    
    return (
        <>
            {user ? (
                <MainDashboard />
            ) : (
                <LandingPageLayout>
                    <LandingPage />
                </LandingPageLayout>
            )}
        </>
    );
}
