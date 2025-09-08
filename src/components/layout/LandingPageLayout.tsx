
"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";

export function LandingPageLayout({ children }: { children: React.ReactNode }) {
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
