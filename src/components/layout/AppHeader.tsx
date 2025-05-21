
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Users, MessageSquare, Bell, Search, Grid2X2, Settings, ShoppingCart, Newspaper, ClipboardList, Sprout, Pin, Wallet as WalletIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeaderThemeToggle } from "@/components/HeaderThemeToggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      "flex flex-col items-center px-2 py-1 text-xs text-white/80 hover:text-white", // Updated colors
      isActive && "text-white border-b-2 border-white" // Updated active colors
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
    <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-[#6ec33f] backdrop-blur-sm"> {/* Updated background and border */}
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo iconSize={32} textSize="text-2xl" className="text-white" /> {/* Set Logo text to white */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" /> {/* Updated icon color */}
            <Input
              type="search"
              placeholder="Search stakeholders, products, forums..."
              className="h-9 w-full rounded-md bg-white/20 text-white placeholder:text-white/70 focus:bg-white/30 pl-10 md:w-[250px] lg:w-[300px]" // Adjusted input style for contrast
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

           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex-col items-center px-2 py-1 text-xs text-white/80 hover:text-white h-auto"> {/* Updated colors */}
                <Grid2X2 className="h-5 w-5 mb-0.5" />
                <span>More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild><Link href="/notifications" className="flex items-center gap-2"><Bell className="h-4 w-4"/>Notifications</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/forums" className="flex items-center gap-2"><Newspaper className="h-4 w-4"/>Forums</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/profiles" className="flex items-center gap-2"><Users className="h-4 w-4"/>Profiles</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem> 
                <Pin className="mr-2 h-4 w-4" />
                <span>Set Current as Homepage</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4"/>Settings</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="hidden md:block pl-2">
             <UserAvatar name={demoUser.name} email={demoUser.email} imageUrl={demoUser.imageUrl} />
          </div>

          <div className="pl-2 border-l border-white/20 hidden md:block"> {/* Adjusted border color */}
             <HeaderThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
