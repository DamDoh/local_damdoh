
"use client";

import React from 'react';
import { useAuth } from '@/lib/auth-utils';
import { AppHeader } from "@/components/layout/AppHeader";
import { Toaster } from "@/components/ui/toaster";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import { PageSkeleton } from '../Skeletons';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { LandingPageLayout } from './LandingPageLayout';
import { DashboardLeftSidebar } from '../dashboard/DashboardLeftSidebar';
import { DashboardRightSidebar } from '../dashboard/DashboardRightSidebar';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebarNav } from './AppSidebarNav';

export function LoggedInLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const isMobile = useIsMobile();

    if (loading) {
        return <PageSkeleton />;
    }

    if (!user) {
        // If not logged in, render the public-facing layout
        return (
            <LandingPageLayout>
                {children}
            </LandingPageLayout>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex flex-col min-h-screen bg-background">
                <AppHeader />
                <div className="flex-grow container mx-auto max-w-screen-2xl px-4 py-6 md:px-6 lg:px-8 print:p-0">
                    <div className="grid md:grid-cols-12 gap-6 items-start">
                        <aside className="hidden md:block md:col-span-3 lg:col-span-2 sticky top-20">
                           <DashboardLeftSidebar />
                        </aside>
                        <main className="md:col-span-9 lg:col-span-7 space-y-6">
                            {children}
                        </main>
                        <aside className="hidden lg:block lg:col-span-3 sticky top-20">
                            <DashboardRightSidebar />
                        </aside>
                    </div>
                </div>
                <OfflineIndicator />
                <Toaster />
                {isMobile && <MobileBottomNavigation />}
            </div>
        </SidebarProvider>
    );
}
