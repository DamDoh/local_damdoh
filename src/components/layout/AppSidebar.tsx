
// This file is no longer used for the main app navigation.
// The main navigation has been moved to AppHeader.tsx and specific dashboard sidebars.
// This file can be deleted or repurposed if a different type of sidebar is needed elsewhere.

"use client";

// Keeping the imports in case this structure is reused, but it's not actively used.
import type { NavItem } from "@/lib/types";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Contact,
  MessagesSquare,
  ShoppingCart,
  Briefcase,
  Settings as SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Network", href: "/network", icon: Users, description: "Discover connections" },
  { title: "Profiles", href: "/profiles", icon: Contact, description: "Browse stakeholders" },
  { title: "Forums", href: "/forums", icon: MessagesSquare, description: "Join discussions" },
  { title: "Marketplace", href: "/marketplace", icon: ShoppingCart, description: "Buy & sell goods" },
  { title: "Talent Exchange", href: "/talent-exchange", icon: Briefcase, description: "Find jobs & services" },
];

const secondaryNavItems: NavItem[] = [
   { title: "Settings", href: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <Link href={item.href} passHref legacyBehavior>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
            tooltip={item.title}
            className={cn(
              (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : ""
            )}
          >
            <a>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    ));
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menu (Old - Deprecated)</SidebarGroupLabel>
        {/* <SidebarMenu>{renderNavItems(mainNavItems)}</SidebarMenu> */}
      </SidebarGroup>
      
      <SidebarGroup className="mt-auto"> 
        {/* <SidebarMenu>{renderNavItems(secondaryNavItems)}</SidebarMenu> */}
      </SidebarGroup>
      <div className="p-4 text-center text-xs text-muted-foreground">
        This sidebar is no longer in active use for main navigation.
      </div>
    </>
  );
}
