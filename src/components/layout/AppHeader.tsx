
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Home,
  Users,
  Bell,
  Menu,
  Search as SearchIconLucide,
  Wallet as WalletIcon,
  Sprout,
  HelpCircle,
  LogOut,
  User as UserIcon,
  MessageSquare,
  Briefcase,
  LogIn, 
  UserPlus,
  X,
  Fingerprint
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
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";
import { HeaderThemeToggle } from "@/components/HeaderThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { UniversalSearchModal } from './UniversalSearchModal';
import { Skeleton } from "@/components/ui/skeleton";

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
  className?: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, pathname, className, onClick }) => {
  const isActive = pathname.endsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center px-2 py-1 text-xs text-white/80 hover:text-white h-full justify-center",
        isActive && "text-white border-b-2 border-white",
        className
      )}
    >
      <Icon className="h-5 w-5 mb-0.5" />
      <span>{label}</span>
    </Link>
  );
};

const MobileSheetNavLink: React.FC<NavLinkProps & {isSheetLink?: boolean}> = ({ href, icon: Icon, label, pathname, onClick, isSheetLink }) => {
  const isActive = pathname.endsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-md text-sm hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground font-medium" : "text-foreground/80"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
      <span>{label}</span>
    </Link>
  );
};

const desktopNavItems = [
    { href: "/", icon: Home, label: 'home' },
    { href: "/network", icon: Users, label: 'network' },
    { href: "/farm-management", icon: Sprout, label: 'farmMgmt' },
    { href: "/marketplace", icon: Briefcase, label: 'marketplace' },
    { href: "/talent-exchange", icon: Briefcase, label: 'talentExchange'},
    { href: "/traceability", icon: Fingerprint, label: 'traceability' },
    { href: "/forums", icon: MessageSquare, label: 'forums' },
];
  
const mobileSheetSecondaryNavItems = [
    { href: "/settings", icon: UserIcon, label: 'settings', isSheetLink: true },
    { href: "/help-center", icon: HelpCircle, label: "Help Center", isSheetLink: true },
];

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-[#6ec33f] backdrop-blur-sm print:hidden">
      {/* Desktop Skeleton */}
      <div className="hidden md:flex container mx-auto h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32 bg-white/20" />
        <Skeleton className="h-9 w-96 bg-white/20" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48 bg-white/20" />
          <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
        </div>
      </div>
      {/* Mobile Skeleton */}
      <div className="md:hidden container mx-auto flex h-14 items-center justify-between px-4">
        <Skeleton className="h-8 w-8 bg-white/20" />
        <Skeleton className="h-6 w-32 bg-white/20" />
        <Skeleton className="h-8 w-8 bg-white/20" />
      </div>
    </header>
  );
}


export function AppHeader() {
  const { t } = useTranslation('common');
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
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setIsMobileSheetOpen(false); 
      router.push('/auth/signin'); 
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };

  const getSectionTitle = () => {
    // This function can be simplified or improved based on routing patterns.
    const path = pathname.split('/')[1];
    if (!path) return t('home');
    const item = desktopNavItems.find(item => item.href.includes(path));
    return item ? t(item.label as any) : path.charAt(0).toUpperCase() + path.slice(1);
  }

  const sectionTitle = getSectionTitle();

  if (!isMounted) {
    return <HeaderSkeleton />;
  }

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-[#6ec33f] backdrop-blur-sm print:hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex container mx-auto h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Logo iconSize={32} textSize="text-2xl" className="text-white" />
          </div>

          <div className="flex-1 flex justify-center px-12 lg:px-16">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <SearchIconLucide className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80 pointer-events-none" />
              <Input 
                type="search" 
                placeholder={t('searchPlaceholder')}
                className="h-9 w-full rounded-md bg-white/20 text-white placeholder:text-white/70 focus:bg-white/30 pl-10" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <nav className="flex items-center space-x-0.5 h-full">
            {desktopNavItems.map((item) => (
              <NavLink key={item.href} {...item} label={t(item.label as any)} pathname={pathname} />
            ))}
            {user && (
              <NavLink href="/notifications" icon={Bell} label={t('notifications')} pathname={pathname} />
            )}
            {user && (
              <>
                  <NavLink href="/messages" icon={MessageSquare} label={t('messages')} pathname={pathname} />
                  <NavLink href="/wallet" icon={WalletIcon} label={t('wallet')} pathname={pathname} />
              </>
            )}
            <div className="pl-2 border-l border-white/20 ml-1 flex items-center h-full">
              {authLoading ? (
                <div className="h-9 w-9 bg-white/20 rounded-full animate-pulse"></div>
              ) : user ? (
                <UserAvatar name={user.displayName || user.email} email={user.email} imageUrl={user.photoURL} />
              ) : (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" asChild className="text-white hover:bg-white/20 hover:text-white text-xs h-auto py-1.5 px-2.5">
                    <Link href="/auth/signin">{t('signIn')}</Link>
                  </Button>
                  <Button variant="outline" asChild className="text-primary bg-white hover:bg-white/90 border-white text-xs h-auto py-1.5 px-2.5">
                    <Link href="/auth/signup">{t('signUp')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden container mx-auto flex h-14 items-center justify-between px-4">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-background">
              <SheetHeader className="p-4 border-b flex flex-row justify-between items-center">
                  <Logo iconSize={28} textSize="text-xl" className="text-primary" />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4"/></Button>
                  </SheetClose>
              </SheetHeader>
              <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
                {user && (
                  <>
                    <MobileSheetNavLink href="/profiles/me" icon={UserIcon} label={t('myProfile')} pathname={pathname} onClick={() => setIsMobileSheetOpen(false)} />
                    <Separator />
                  </>
                )}
                
                {mobileSheetSecondaryNavItems.map((item) => (
                  <MobileSheetNavLink
                    key={`sheet-extra-${item.href}`}
                    {...item}
                    label={t(item.label as any, item.label)}
                    pathname={pathname}
                    onClick={() => setIsMobileSheetOpen(false)}
                  />
                ))}

                 {!user && (
                  <>
                    <Separator />
                    <MobileSheetNavLink href="/auth/signin" icon={LogIn} label={t('signIn')} pathname={pathname} onClick={() => setIsMobileSheetOpen(false)} />
                    <MobileSheetNavLink href="/auth/signup" icon={UserPlus} label={t('signUp')} pathname={pathname} onClick={() => setIsMobileSheetOpen(false)} />
                  </>
                )}
              </nav>
              <Separator />
              <div className="p-4 space-y-3 border-t">
                {user && (
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> {t('logOut')}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="text-lg font-semibold text-white truncate text-center flex-grow mx-4">
            {sectionTitle}
          </div>

          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
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
