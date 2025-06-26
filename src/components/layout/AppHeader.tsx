
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  Brain,
  ShoppingCart,
  ClipboardList,
  Package,
  Briefcase,
  LogIn, 
  UserPlus,
  X, // Added X icon import
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
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";
import { HeaderThemeToggle } from "@/components/HeaderThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { UniversalSearchModal } from './UniversalSearchModal';
import { useTranslations } from 'next-intl';

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


export function AppHeader() {
  const t = useTranslations('AppHeader');
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); 

  const desktopNavItems = [
    { href: "/", icon: Home, label: t('home') },
    { href: "/network", icon: Users, label: t('network') },
    { href: "/farm-management", icon: Sprout, label: t('farmMgmt') },
    { href: "/marketplace", icon: ShoppingCart, label: t('marketplace') },
    { href: "/traceability", icon: Fingerprint, label: t('traceability') },
    { href: "/forums", icon: MessageSquare, label: t('forums')},
  ];
  
  const mobileSheetSecondaryNavItems = [
    { href: "/pinboard", icon: ClipboardList, label: "My Pinboard", isSheetLink: true },
    { href: "/settings", icon: UserIcon, label: t('settings'), isSheetLink: true },
    { href: "/help-center", icon: HelpCircle, label: "Help Center", isSheetLink: true },
  ];

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
    if (pathname.endsWith("/")) return "Home";
    const activeDesktopItem = desktopNavItems.find(item => pathname.includes(item.href) && item.href !== "/");
    if (activeDesktopItem) return activeDesktopItem.label;
    
    if (pathname.includes("/profiles/me/edit")) return "Edit Profile";
    if (pathname.includes("/profiles/me")) return "My Profile";
    if (pathname.includes("/profiles/")) return "Profile Details";
    if (pathname.includes("/marketplace/create")) return "Create Listing";
    if (pathname.includes("/agri-events/create")) return "Create Event";
    if (pathname.includes("/agri-events")) return "Agri-Events";
    if (pathname.includes("/forums/create")) return "New Discussion";
    if (pathname.includes("/forums/")) return "Forum Topic";
    if (pathname.includes("/search")) return "Search Results";
    if (pathname.includes("/traceability")) return "Traceability";
    if (pathname.includes("/help-center")) return "Help Center";
    if (pathname.includes("/about")) return "About Us";
    if (pathname.includes("/contact")) return "Contact";
    if (pathname.includes("/careers")) return "Careers";
    if (pathname.includes("/blog")) return "Agri-Insights Blog";
    if (pathname.includes("/community-guidelines")) return "Community Guidelines";
    if (pathname.includes("/cookie-policy")) return "Cookie Policy";
    if (pathname.includes("/privacy")) return "Privacy Policy";
    if (pathname.includes("/terms")) return "Terms of Service";
    if (pathname.includes("/pinboard")) return "My Pinboard";
    if (pathname.includes("/wallet")) return "Digital Wallet";
    if (pathname.includes("/ai-assistant")) return "AI Farming Assistant";
    if (pathname.includes("/auth/signin")) return t('signIn');
    if (pathname.includes("/auth/signup")) return t('signUp');
    if (pathname.includes("/auth/forgot-password")) return "Reset Password";


    return APP_NAME; 
  };

  const sectionTitle = getSectionTitle();

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
              <NavLink key={item.href} {...item} pathname={pathname} />
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
                <HeaderThemeToggle />
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
