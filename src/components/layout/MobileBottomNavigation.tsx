
"use client";

import { Link, usePathname, getPathname } from '@/navigation';
import { Home, Search, ShoppingCart, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const t = useTranslations('MobileBottomNav');

  const navItems: NavItem[] = [
    { href: "/", label: t('home'), icon: Home },
    { href: "/marketplace", label: t('market'), icon: ShoppingCart },
    { href: "/search", label: t('search'), icon: Search },
    { href: "/messages", label: t('messages'), icon: MessageSquare },
    { href: "/profiles/me", label: t('profile'), icon: User },
  ];


  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border shadow-lg z-40 flex justify-around items-center print:hidden">
      {navItems.map((item) => {
        const pathWithoutLocale = getPathname({href: pathname, locale: 'en'});
        const isActive = item.href === "/" ? pathWithoutLocale === "/" : pathWithoutLocale.startsWith(item.href);
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
