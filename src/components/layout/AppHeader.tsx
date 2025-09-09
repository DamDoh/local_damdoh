
"use client";

import { Link, usePathname } from '@/navigation';
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Menu,
  Search as SearchIconLucide,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UniversalSearchModal } from './UniversalSearchModal';
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AppSidebarNav } from './AppSidebarNav';
import { HeaderThemeToggle } from '../HeaderThemeToggle';
import { Input } from '../ui/input';

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-sm print:hidden">
      {/* Desktop Skeleton */}
      <div className="hidden md:flex container mx-auto h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32 bg-muted" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48 bg-muted" />
          <Skeleton className="h-9 w-9 rounded-full bg-muted" />
        </div>
      </div>
      {/* Mobile Skeleton */}
      <div className="md:hidden container mx-auto flex h-14 items-center justify-between px-4">
        <Skeleton className="h-8 w-8 bg-muted" />
        <Skeleton className="h-6 w-32 bg-muted" />
        <Skeleton className="h-8 w-8 bg-muted" />
      </div>
    </header>
  );
}


export function AppHeader() {
  const t = useTranslations('AppHeader');
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth(); 

  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [initialModalQuery, setInitialModalQuery] = useState("");

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery.trim()) {
      setInitialModalQuery(searchQuery.trim());
      setIsSearchModalOpen(true);
    }
  };


  if (!isMounted) {
    return <HeaderSkeleton />;
  }

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-primary text-primary-foreground print:hidden">
        {/* Desktop Header */}
        <div className="container mx-auto hidden h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center gap-6">
             <Logo iconSize={32} textSize="text-2xl" className="text-white" />
          </div>

           {user && (
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
                    <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/70" />
                    <Input name="search" placeholder={t('searchPlaceholder')} className="pl-9 bg-white/20 border-none placeholder:text-primary-foreground/70 focus-visible:ring-primary-foreground text-primary-foreground"/>
                </form>
             )}

          <nav className="flex items-center space-x-1 h-full">
            <div className="h-2/3 w-px bg-white/20 mx-3"></div>
            <LanguageSwitcher />
            <HeaderThemeToggle />
              {authLoading ? (
                <div className="h-9 w-9 bg-white/20 rounded-full animate-pulse ml-2"></div>
              ) : user ? (
                 <UserAvatar name={user.displayName || user.email} email={user.email} imageUrl={user.photoURL} />
              ) : (
                 <div className="flex items-center gap-1 pl-2">
                    <Button variant="ghost" asChild className="hover:bg-white/10"><Link href="/auth/signin">{t('signIn')}</Link></Button>
                    <Button asChild variant="secondary" className="bg-white/90 text-primary hover:bg-white"><Link href="/auth/signup">{t('signUp')}</Link></Button>
                 </div>
              )}
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden container mx-auto flex h-14 items-center justify-between px-4">
             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                 <SheetTrigger asChild>
                     <Button variant="ghost" size="icon"><Menu /></Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="p-0 w-64">
                     <AppSidebarNav isMobile={true} onLinkClick={() => setIsMobileMenuOpen(false)}/>
                 </SheetContent>
             </Sheet>
             <Logo iconSize={24} textSize="text-xl" className="text-white"/>
             <Button variant="ghost" size="icon" onClick={() => setIsSearchModalOpen(true)}>
                <SearchIconLucide/>
             </Button>
        </div>
      </header>
      <UniversalSearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)}
        initialQuery={initialModalQuery}
      />
    </>
  );
}
