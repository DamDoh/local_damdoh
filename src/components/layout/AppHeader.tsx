
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Users, MessageSquare, Search, Settings, ShoppingCart, ClipboardList, Sprout, Wallet as WalletIcon, Bell, Menu, X, Brain } from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeaderThemeToggle } from "@/components/HeaderThemeToggle";
import { cn } from "@/lib/utils";
import { dummyUsersData } from "@/lib/dummy-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger, // Added missing import
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
  className?: string;
  onClick?: () => void; // For closing sheet on mobile nav
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, pathname, className, onClick }) => {
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center px-2 py-1 text-xs text-white/80 hover:text-white",
        isActive && "text-white border-b-2 border-white",
        className
      )}
    >
      <Icon className="h-5 w-5 mb-0.5" />
      <span>{label}</span>
    </Link>
  );
};

const MobileNavLink: React.FC<Omit<NavLinkProps, 'pathname' | 'className'>> = ({ href, icon: Icon, label, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-md text-sm font-medium hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground" : "text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
      <span>{label}</span>
    </Link>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const demoUser = {
    name: dummyUsersData['rajPatel']?.name || "Raj Patel",
    email: "raj.patel@agrisupply.com",
    imageUrl: dummyUsersData['rajPatel']?.avatarUrl || "https://placehold.co/40x40.png",
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false); // Close mobile menu on search
    }
  };

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/network", icon: Users, label: "Network" },
    { href: "/farm-management", icon: Sprout, label: "Farm Mgmt" },
    { href: "/talent-exchange", icon: ClipboardList, label: "Services & Skills" },
    { href: "/marketplace", icon: ShoppingCart, label: "Market" },
    { href: "/wallet", icon: WalletIcon, label: "Wallet" },
    { href: "/messaging", icon: MessageSquare, label: "Messaging" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/ai-assistant", icon: Brain, label: "AI Assistant"},
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-[#6ec33f] backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo iconSize={32} textSize="text-2xl" className="text-white" />
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
            <Input
              type="search"
              placeholder="Search DamDoh..."
              className="h-9 w-full rounded-md bg-white/20 text-white placeholder:text-white/70 focus:bg-white/30 pl-10 md:w-[200px] lg:w-[280px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 md:space-x-2">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
          <div className="pl-2 border-l border-white/20 ml-2">
             <UserAvatar name={demoUser.name} email={demoUser.email} imageUrl={demoUser.imageUrl} />
          </div>
          <div className="pl-2 border-l border-white/20">
             <HeaderThemeToggle />
          </div>
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden flex items-center gap-2">
          {/* <HeaderThemeToggle /> Show theme toggle directly on mobile header */}
          {/* <UserAvatar name={demoUser.name} email={demoUser.email} imageUrl={demoUser.imageUrl} /> Show avatar on mobile header */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:w-80 bg-background p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center justify-between">
                  <Logo iconSize={28} textSize="text-xl" />
                  {/* SheetContent provides its own close button. No need for an additional one here. */}
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col justify-between h-[calc(100%-4.5rem)]"> {/* Adjust height if SheetTitle changes */}
                <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                   <form onSubmit={handleSearchSubmit} className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search DamDoh..."
                      className="h-9 w-full rounded-md bg-muted pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  {navItems.map((item) => (
                    <MobileNavLink 
                      key={item.href} 
                      href={item.href} 
                      icon={item.icon} 
                      label={item.label} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
                <Separator />
                <div className="p-4 space-y-4 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Theme</span>
                        <HeaderThemeToggle /> 
                    </div>
                    <UserAvatar name={demoUser.name} email={demoUser.email} imageUrl={demoUser.imageUrl} />
                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-md text-sm font-medium hover:bg-accent text-foreground">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <span>Settings</span>
                    </Link>
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
