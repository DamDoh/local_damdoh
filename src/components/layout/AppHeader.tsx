
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Users, Bell, Menu, Search as SearchIconLucide, ClipboardList, Wallet as WalletIcon, Sprout, HelpCircle, LogOut, User as UserIcon, Settings as SettingsIcon, MessageSquare, Brain } from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dummyUsersData } from "@/lib/dummy-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
  className?: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, pathname, className }) => {
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1);
  return (
    <Link
      href={href}
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
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1 && isSheetLink);
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
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const demoUser = {
    name: dummyUsersData['rajPatel']?.name || "Raj Patel",
    email: "raj.patel@agrisupply.com",
    imageUrl: dummyUsersData['rajPatel']?.avatarUrl || "https://placehold.co/40x40.png",
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      if (isMobileSheetOpen) setIsMobileSheetOpen(false);
    }
  };

  const desktopNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/network", icon: Users, label: "Network" },
    { href: "/farm-management", icon: Sprout, label: "Farm Mgmt" },
    { href: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
    { href: "/forums", icon: MessageSquare, label: "Forums"},
    { href: "/wallet", icon: WalletIcon, label: "Wallet" },
    { href: "/ai-assistant", icon: Brain, label: "AI Assistant" },
    { href: "/notifications", icon: Bell, label: "Notifications"},
  ];

  const mobileSheetNavItems = [
    { href: "/profiles/me", icon: UserIcon, label: "My Profile", isSheetLink: true },
    { href: "/settings", icon: SettingsIcon, label: "Settings", isSheetLink: true },
    { href: "/help-center", icon: HelpCircle, label: "Help Center", isSheetLink: true },
  ];

  const mainMobileNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/network", icon: Users, label: "Network" },
    { href: "/farm-management", icon: Sprout, label: "Farm Mgmt" },
    { href: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
    { href: "/forums", icon: MessageSquare, label: "Forums"},
    { href: "/wallet", icon: WalletIcon, label: "Wallet" },
    { href: "/ai-assistant", icon: Brain, label: "AI Assistant" },
    { href: "/notifications", icon: Bell, label: "Notifications"},
  ];


  const getSectionTitle = () => {
    if (pathname === "/") return "Home";
    if (pathname.startsWith("/network")) return "Network";
    if (pathname.startsWith("/farm-management")) return "Farm Management";
    if (pathname.startsWith("/marketplace")) return "Marketplace";
    if (pathname.startsWith("/wallet")) return "Wallet";
    if (pathname.startsWith("/ai-assistant")) return "AI Assistant";
    if (pathname.startsWith("/notifications")) return "Notifications";
    if (pathname.startsWith("/forums")) return "Forums";
    if (pathname.startsWith("/agri-events")) return "Agri-Events";
    if (pathname.startsWith("/profiles/me")) return "My Profile";
    if (pathname.startsWith("/profiles")) return "Profiles";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/search")) return "Search Results";
    if (pathname.startsWith("/help-center")) return "Help Center";
    return APP_NAME;
  };

  const sectionTitle = getSectionTitle();

  return (
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
              placeholder="Search products, services, stakeholders..."
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
          <div className="pl-2 border-l border-white/20 ml-1 flex items-center h-full">
            <UserAvatar name={demoUser.name} email={demoUser.email} imageUrl={demoUser.imageUrl} />
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
            <SheetHeader className="p-4 border-b bg-muted/30">
                <Logo iconSize={28} textSize="text-xl" className="text-primary" />
            </SheetHeader>
            <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
              {mainMobileNavItems.map((item) => (
                <MobileSheetNavLink
                  key={`sheet-main-${item.href}`}
                  {...item}
                  pathname={pathname}
                  onClick={() => setIsMobileSheetOpen(false)}
                  isSheetLink={true}
                />
              ))}
              <Separator />
              {mobileSheetNavItems.map((item) => (
                <MobileSheetNavLink
                  key={`sheet-extra-${item.href}`}
                  {...item}
                  pathname={pathname}
                  onClick={() => setIsMobileSheetOpen(false)}
                  isSheetLink={true}
                />
              ))}
            </nav>
            <Separator />
             <div className="p-4 space-y-3 border-t">
              <Button variant="outline" className="w-full" onClick={() => { alert('Logout action placeholder'); setIsMobileSheetOpen(false); }}>
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="text-lg font-semibold text-white truncate">
          {sectionTitle}
        </div>

        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => { setIsMobileSheetOpen(false); router.push('/search'); }}>
            <SearchIconLucide className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
