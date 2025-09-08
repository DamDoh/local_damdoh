
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
  DollarSign
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


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
  const { user, loading: authLoading } = useAuth(); 

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [initialModalQuery, setInitialModalQuery] = useState("");

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery.trim()) {
      setInitialModalQuery(searchQuery.trim());
      setIsSearchModalOpen(true);
      if (isMobileSheetOpen) setIsMobileSheetOpen(false);
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
             <Logo iconSize={32} textSize="text-2xl" className="text-foreground" />
          </div>
          
          {user && (
            <div className="flex-1 flex justify-center px-12 lg:px-16">
                <Button
                variant="outline"
                className="h-9 w-full max-w-md justify-start rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground pl-10 relative"
                onClick={() => setIsSearchModalOpen(true)}
                >
                <SearchIconLucide className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                {t('searchPlaceholder')}
                </Button>
            </div>
          )}

          <nav className="flex items-center space-x-2 h-full">
            <div className="flex items-center h-full">
             <LanguageSwitcher />
             <HeaderThemeToggle />
              {authLoading ? (
                <div className="h-9 w-9 bg-muted rounded-full animate-pulse ml-2"></div>
              ) : user ? (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                        {t('orders')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href="/marketplace/my-purchases"><ShoppingCart className="mr-2 h-4 w-4" />{t('myPurchases')}</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link href="/marketplace/my-sales"><DollarSign className="mr-2 h-4 w-4" />{t('mySales')}</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                 <div className="flex items-center gap-1">
                    <Button asChild variant="ghost"><Link href="/auth/signin"><LogIn className="mr-2 h-4 w-4" />{t('signIn')}</Link></Button>
                    <Button asChild><Link href="/auth/signup"><UserPlus className="mr-2 h-4 w-4" />{t('signUp')}</Link></Button>
                 </div>
              )}
               {user && <UserAvatar name={user.displayName || user.email} email={user.email} imageUrl={user.photoURL} />}
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
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-lg font-semibold truncate text-center flex-grow mx-4">
            {APP_NAME}
          </Link>

          <Button variant="ghost" size="icon" onClick={() => setIsSearchModalOpen(true)}>
            <SearchIconLucide className="h-5 w-5" />
            <span className="sr-only">Search</span>
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
