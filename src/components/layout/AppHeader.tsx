
"use client";

import { Link, usePathname, useRouter, getPathname } from '@/navigation';
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Menu,
  Search as SearchIconLucide,
  X,
  LogIn,
  UserPlus
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, logOut } from "@/lib/auth-utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { HeaderThemeToggle } from "@/components/HeaderThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { UniversalSearchModal } from './UniversalSearchModal';
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SidebarTrigger } from '../ui/sidebar';
import { AppSidebarNav } from './AppSidebarNav';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { APP_NAME } from '@/lib/constants';


function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-background/95 backdrop-blur-sm print:hidden">
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
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); 

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [initialModalQuery, setInitialModalQuery] = useState("");

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      setInitialModalQuery(searchQuery.trim());
      setIsSearchModalOpen(true);
      setSearchQuery("");
      if (isMobileSheetOpen) setIsMobileSheetOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: t('toast.logOut.title'),
        description: t('toast.logOut.description'),
      });
      setIsMobileSheetOpen(false); 
      router.push('/auth/signin'); 
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('toast.logOut.failTitle'),
        description: t('toast.logOut.failDescription'),
      });
    }
  };


  if (!isMounted) {
    return <HeaderSkeleton />;
  }

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-sm print:hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex container mx-auto h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
             <SidebarTrigger />
             <Logo iconSize={32} textSize="text-2xl" className="text-foreground" />
          </div>

          <div className="flex-1 flex justify-center px-12 lg:px-16">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <SearchIconLucide className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input 
                type="search" 
                placeholder={t('searchPlaceholder')}
                className="h-9 w-full rounded-md bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background pl-10" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <nav className="flex items-center space-x-2 h-full">
            <div className="flex items-center h-full">
             <LanguageSwitcher />
             <HeaderThemeToggle />
              {authLoading ? (
                <div className="h-9 w-9 bg-muted rounded-full animate-pulse ml-2"></div>
              ) : user ? (
                <UserAvatar name={user.displayName || user.email} email={user.email} imageUrl={user.photoURL} />
              ) : (
                 <div className="flex items-center gap-1">
                    <Button asChild variant="ghost"><Link href="/auth/signin">{t('signIn')}</Link></Button>
                    <Button asChild><Link href="/auth/signup">{t('signUp')}</Link></Button>
                 </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden container mx-auto flex h-14 items-center justify-between px-4">
           <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-background">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left">
                  <Logo iconSize={24} textSize="text-xl" className="text-foreground" />
                </SheetTitle>
                 <VisuallyHidden>
                  <SheetDescription>
                    {t('mobileMenu.description')}
                  </SheetDescription>
                </VisuallyHidden>
              </SheetHeader>
              <div className="flex-grow overflow-y-auto">
                 <AppSidebarNav isMobile={true} onLinkClick={() => setIsMobileSheetOpen(false)}/>
              </div>
              <Separator />
               <div className="p-4 space-y-3 border-t">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> {t('logOut')}
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline"><Link href="/auth/signin" onClick={() => setIsMobileSheetOpen(false)}><LogIn className="mr-2 h-4 w-4"/> {t('signIn')}</Link></Button>
                    <Button asChild><Link href="/auth/signup" onClick={() => setIsMobileSheetOpen(false)}><UserPlus className="mr-2 h-4 w-4"/> {t('signUp')}</Link></Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-lg font-semibold truncate text-center flex-grow mx-4">
            {APP_NAME}
          </Link>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/search"><SearchIconLucide className="h-5 w-5" /></Link>
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
