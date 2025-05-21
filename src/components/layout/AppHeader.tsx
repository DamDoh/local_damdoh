
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Users, MessageSquare, Search, Settings, ShoppingCart, ClipboardList, Sprout, Wallet as WalletIcon } from "lucide-react";
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
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, pathname }) => {
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1);
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center px-2 py-1 text-xs text-white/80 hover:text-white",
      isActive && "text-white border-b-2 border-white"
    )}>
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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-[#6ec33f] backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo iconSize={32} textSize="text-2xl" className="text-white" />
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
            <Input
              type="search"
              placeholder="Search stakeholders, products, forums..."
              className="h-9 w-full rounded-md bg-white/20 text-white placeholder:text-white/70 focus:bg-white/30 pl-10 md:w-[250px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <nav className="flex items-center space-x-1 md:space-x-2">
          <NavLink href="/" icon={Home} label="Home" pathname={pathname} />
          <NavLink href="/network" icon={Users} label="Network" pathname={pathname} />
          <NavLink href="/farm-management" icon={Sprout} label="Farm Mgmt" pathname={pathname} />
          <NavLink href="/talent-exchange" icon={ClipboardList} label="Services & Skills" pathname={pathname} />
          <NavLink href="/marketplace" icon={ShoppingCart} label="Market" pathname={pathname} />
          <NavLink href="/wallet" icon={WalletIcon} label="Wallet" pathname={pathname} />
          <NavLink href="/messaging" icon={MessageSquare} label="Messaging" pathname={pathname} />
          
          <div className="hidden md:block pl-2">
             <UserAvatar name={demoUser.name} email={demoUser.email} imageUrl={demoUser.imageUrl} />
          </div>

          <div className="pl-2 border-l border-white/20 hidden md:block">
             <HeaderThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
