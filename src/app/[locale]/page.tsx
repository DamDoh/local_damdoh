
"use client";

import { useAuth } from '@/lib/auth-utils';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { LandingPageLayout } from '@/components/layout/LandingPageLayout';
import { PageSkeleton } from '@/components/Skeletons';
import { HomePage } from '@/components/landing/HomePage';

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
                    <HomePage />
                </LandingPageLayout>
            )}
        </>
    );
}
