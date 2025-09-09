
"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, Sidebar } from "@/components/ui/sidebar";
import { AppSidebarNav } from "./AppSidebarNav";

export function LandingPageLayout({ children }: { children: React.ReactNode }) {
    return (
      <SidebarProvider>
            <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-grow">
                    {children}
                </main>
                <AppFooter />
                <Toaster />
            </div>
      </SidebarProvider>
    );
}
