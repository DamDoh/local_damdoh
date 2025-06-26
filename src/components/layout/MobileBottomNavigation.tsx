
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation('common');

  const navItems: NavItem[] = [
    { href: "/", label: t('mobileNav.home'), icon: Home },
    { href: "/marketplace", label: t('mobileNav.market'), icon: ShoppingCart },
    { href: "/search", label: t('mobileNav.search'), icon: Search },
    { href: "/forums", label: t('mobileNav.forums'), icon: MessageSquare },
    { href: "/profiles/me", label: t('mobileNav.profile'), icon: User },
  ];


  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border shadow-lg z-40 flex justify-around items-center print:hidden">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" || pathname.startsWith('/en') || pathname.startsWith('/es') : pathname.startsWith(item.href) || pathname.startsWith(`/en${item.href}`) || pathname.startsWith(`/es${item.href}`);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center text-[10px] h-full w-1/5 pt-1.5 pb-1", 
              isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            <item.icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-primary" : "")} />
            <span className="truncate w-full text-center leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
