import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle'; // Added import

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DamDoh - Agricultural Network',
  description: 'Connecting the agricultural supply chain.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon" variant="sidebar" className="border-r">
            <SidebarHeader className="p-4 flex flex-col gap-4 items-start">
              <div className="flex justify-between items-center w-full">
                <Logo />
                <SidebarTrigger className="md:hidden" />
              </div>
            </SidebarHeader>
            <SidebarContent>
              <AppSidebar />
            </SidebarContent>
            <SidebarFooter className="p-4">
              <UserAvatar name="Demo User" email="user@damdoh.com" imageUrl="https://placehold.co/100x100.png" />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <div className="flex-1">
                {/* Global Search Bar Placeholder */}
                <form className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search..." className="w-full max-w-xs pl-10 h-9 bg-muted" />
                </form>
              </div>
              <ThemeToggle /> {/* Added ThemeToggle component */}
              {/* Placeholder for notifications, messages, etc. */}
              {/* <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button> */}
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
