
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, MessageSquare, User, Briefcase } from "lucide-react"; // Added Briefcase for Talent/Services
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/", label: "Explore", icon: Home },
  { href: "/marketplace", label: "Market", icon: ShoppingCart },
  { href: "/talent-exchange", label: "Services", icon: Briefcase },
  { href: "/forums", label: "Forums", icon: MessageSquare },
  { href: "/profiles/me", label: "Profile", icon: User },
];

export function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border shadow-top z-40 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center text-[11px] h-full w-1/5 pt-1 pb-0.5", // Adjusted padding and text size
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-primary" : "")} />
            <span className="truncate w-full text-center">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

    