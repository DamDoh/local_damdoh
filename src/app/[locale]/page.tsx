
"use client";

import { useAuth } from '@/lib/auth-utils';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { LandingPage } from '@/components/landing/HomePage';
import { PageSkeleton } from '@/components/Skeletons';
import { useEffect, useState } from 'react';

export default function Home() {
    const { user, loading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (loading || !mounted) {
        return <PageSkeleton />;
    }

    return user ? <MainDashboard /> : <LandingPage />;
}
