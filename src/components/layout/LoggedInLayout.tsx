
"use client";

import React from 'react';
import { useAuth } from '@/lib/auth-utils';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import { PageSkeleton } from '../Skeletons';
import { Sidebar, SidebarInset, SidebarProvider } from '../ui/sidebar';
import { AppSidebarNav } from './AppSidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { cn } from '@/lib/utils';

export function LoggedInLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const isMobile = useIsMobile();

    if (loading) {
        return <PageSkeleton />;
    }

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-grow">
                    {children}
                </main>
                <AppFooter />
                <Toaster />
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex flex-col min-h-screen bg-muted/40">
                <AppHeader />
                <div className="flex-grow container mx-auto max-w-screen-2xl px-4 py-6 md:px-6 lg:px-8 print:p-0">
                    {children}
                </div>
                <OfflineIndicator />
                <Toaster />
                {isMobile && <MobileBottomNavigation />}
            </div>
        </SidebarProvider>
    );
}
