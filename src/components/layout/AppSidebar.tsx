
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
  AlertTriangle,
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
  // Talent Exchange merged into Marketplace
  // { title: "Talent Exchange", href: "/talent-exchange", icon: Briefcase, description: "Find jobs & services" },
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
    <div className="p-4 text-sm text-muted-foreground flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border border-destructive/50 bg-destructive/10 rounded-md">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div>
            <p className="font-semibold text-destructive">Sidebar Deprecated</p>
            <p className="text-xs">This sidebar component is no longer in active use for main navigation. Navigation has moved to the top header and mobile bottom bar.</p>
        </div>
      </div>
      
      <div className="mt-4 opacity-50 pointer-events-none"> {/* Visually mute and disable interaction */}
        <SidebarGroup>
          <SidebarGroupLabel>Old Menu (Inactive)</SidebarGroupLabel>
          {/* <SidebarMenu>{renderNavItems(mainNavItems)}</SidebarMenu> */}
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto"> 
          {/* <SidebarMenu>{renderNavItems(secondaryNavItems)}</SidebarMenu> */}
        </SidebarGroup>
      </div>
    </div>
  );
}
