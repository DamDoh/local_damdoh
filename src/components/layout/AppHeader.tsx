
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Users, MessageSquare, Search, Settings, ShoppingCart, ClipboardList, Sprout, Wallet as WalletIcon, Bell, Brain } from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeaderThemeToggle } from "@/components/HeaderThemeToggle";
import { cn } from "@/lib/utils";
import { dummyUsersData } from "@/lib/dummy-data";

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
  className?: string;
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

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const demoUser = {
    name: dummyUsersData['rajPatel']?.name || "Raj Patel",
    email: "raj.patel@agrisupply.com",
    imageUrl: dummyUsersData['rajPatel']?.avatarUrl || "https://placehold.co/40x40.png",
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/network", icon: Users, label: "Network" },
    { href: "/farm-management", icon: Sprout, label: "Farm Mgmt" },
    { href: "/talent-exchange", icon: ClipboardList, label: "Services & Skills" },
    { href: "/marketplace", icon: ShoppingCart, label: "Market" },
    { href: "/wallet", icon: WalletIcon, label: "Wallet" },
    // Messaging and Notifications are now in bottom nav for mobile, or user avatar for desktop
  ];
  
  const secondaryNavItems = [
    { href: "/ai-assistant", icon: Brain, label: "AI Assistant" },
    { href: "/notifications", icon: Bell, label: "Notifications"},
  ];


  return (
    // Header is hidden on mobile (md:hidden replaced by md:flex)
    <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-[#6ec33f] backdrop-blur-sm hidden md:flex">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo iconSize={32} textSize="text-2xl" className="text-white" />
          <form onSubmit={handleSearchSubmit} className="relative">
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
        <nav className="flex items-center space-x-1 md:space-x-2 h-full">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
           {secondaryNavItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
          <div className="pl-2 border-l border-white/20 ml-2 flex items-center h-full">
             <UserAvatar name={demoUser.name} email={demoUser.email} imageUrl={demoUser.imageUrl} />
          </div>
          <div className="pl-2 border-l border-white/20 flex items-center h-full">
             <HeaderThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
