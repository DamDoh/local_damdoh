
"use client";

import React from 'react';
import { useAuth } from '@/lib/auth-utils';
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarNav } from "@/components/layout/AppSidebarNav";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";

export function LoggedInLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        // You might want a full-page skeleton here
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
        // For unauthenticated users (e.g., on the landing page), render children directly without the sidebar layout.
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

    // For authenticated users, render the full dashboard layout with the sidebar.
    return (
        <SidebarProvider>
            <Sidebar>
                <AppSidebarNav />
            </Sidebar>
            <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <AppHeader />
                    <main className="flex-grow container mx-auto max-w-screen-2xl px-4 py-6 md:px-6 lg:px-8 print:p-0">
                        {children}
                    </main>
                    <div className="md:hidden h-16" />
                    <MobileBottomNavigation />
                    <OfflineIndicator />
                    <AppFooter />
                    <Toaster />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
