
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, MessageSquare, Bell, Search, Grid2X2, Settings, ShoppingCart, Newspaper, ClipboardList } from "lucide-react"; // Added ClipboardList
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      "flex flex-col items-center px-2 py-1 text-xs text-muted-foreground hover:text-primary",
      isActive && "text-primary border-b-2 border-primary"
    )}>
      <Icon className="h-5 w-5 mb-0.5" />
      <span>{label}</span>
    </Link>
  );
};


export function AppHeader() {
  const pathname = usePathname();

  // Dummy user data for UserAvatar - should come from auth context in a real app
  const demoUser = {
    name: "Raj Patel",
    email: "raj.patel@agrisupply.com",
    imageUrl: "https://placehold.co/40x40.png",
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo iconSize={32} textSize="text-2xl" />
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stakeholders, products, forums..."
              className="h-9 w-full rounded-md bg-muted pl-10 md:w-[250px] lg:w-[300px]"
            />
          </div>
        </div>

        <nav className="flex items-center space-x-1 md:space-x-2">
          <NavLink href="/" icon={Home} label="Home" pathname={pathname} />
          <NavLink href="/network" icon={Users} label="Network" pathname={pathname} />
          <NavLink href="/talent-exchange" icon={ClipboardList} label="Services & Skills" pathname={pathname} />
          <NavLink href="/marketplace" icon={ShoppingCart} label="Market" pathname={pathname} />
          <NavLink href="/messaging" icon={MessageSquare} label="Messaging" pathname={pathname} /> {/* Placeholder page */}


          <div className="hidden md:block">
             <UserAvatar name={demoUser.name} email={demoUser.email} imageUrl={demoUser.imageUrl} />
          </div>

           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex-col items-center px-2 py-1 text-xs text-muted-foreground hover:text-primary h-auto">
                <Grid2X2 className="h-5 w-5 mb-0.5" />
                <span>More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56"> {/* Increased width */}
              <DropdownMenuItem asChild><Link href="/notifications" className="flex items-center gap-2"><Bell className="h-4 w-4"/>Notifications</Link></DropdownMenuItem> {/* Placeholder page */}
              <DropdownMenuItem asChild><Link href="/forums" className="flex items-center gap-2"><Newspaper className="h-4 w-4"/>Forums</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/profiles" className="flex items-center gap-2"><Users className="h-4 w-4"/>Profiles</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4"/>Settings</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="pl-2 border-l border-border hidden md:block">
             <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
