
"use client";

import { Link, usePathname } from '@/navigation';
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Menu,
  Search as SearchIconLucide,
  LogIn,
  UserPlus,
  ShoppingCart,
  DollarSign,
  Bell,
  MessageSquare
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
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { APP_NAME } from '@/lib/constants';
import { HeaderThemeToggle } from '../HeaderThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInModal } from '@/components/auth/SignInModal';
import { SignUpModal } from '@/components/auth/SignUpModal';


function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-sm print:hidden">
      {/* Desktop Skeleton */}
      <div className="hidden md:flex container mx-auto h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32 bg-muted" />
        <Skeleton className="h-9 w-96 bg-muted" />
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
  const { user, loading: authLoading } = useAuth(); 

  const [isMounted, setIsMounted] = useState(false);

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
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-sm print:hidden">
        {/* Desktop Header */}
        <div className="container mx-auto h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center gap-6">
             <Logo iconSize={32} textSize="text-2xl" className="text-foreground" />
             <div className="h-full w-px bg-border"></div>
             {user && (
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
                    <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input name="search" placeholder={t('searchPlaceholder')} className="pl-9 bg-muted border-none focus-visible:ring-primary"/>
                </form>
             )}
          </div>

          <nav className="flex items-center space-x-1 h-full">
            <LanguageSwitcher />
            <HeaderThemeToggle />
              {authLoading ? (
                <div className="h-9 w-9 bg-muted rounded-full animate-pulse ml-2"></div>
              ) : user ? (
                 <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild><Link href="/notifications"><Bell className="h-5 w-5" /></Link></Button>
                    <Button variant="ghost" size="icon" asChild><Link href="/messages"><MessageSquare className="h-5 w-5" /></Link></Button>
                    <UserAvatar name={user.displayName || user.email} email={user.email} imageUrl={user.photoURL} />
                 </div>
              ) : (
                 <div className="flex items-center gap-1 pl-2">
                    <Button variant="ghost" asChild><Link href="/auth/signin"><LogIn className="mr-2 h-4 w-4" />{t('signIn')}</Link></Button>
                    <Button asChild><Link href="/auth/signup"><UserPlus className="mr-2 h-4 w-4" />{t('signUp')}</Link></Button>
                 </div>
              )}
          </nav>
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
