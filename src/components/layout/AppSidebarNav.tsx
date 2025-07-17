
"use client";

import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/navigation';
import { Home, Users, Bell, MessageSquare, Briefcase, Fingerprint, ShoppingCart, Leaf, Sprout, Wallet, Settings, HelpCircle, LogOut, PanelLeft } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger } from '../ui/sidebar';
import { useAuth, logOut } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';

interface AppSidebarNavProps {
    isMobile?: boolean;
    onLinkClick?: () => void;
}

export const AppSidebarNav = ({ isMobile = false, onLinkClick }: AppSidebarNavProps) => {
  const t = useTranslations('AppHeader');
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const mainNavItems = [
    { href: "/", icon: Home, label: t('home') },
    { href: "/network", icon: Users, label: t('network') },
    { href: "/farm-management", icon: Sprout, label: t('farmMgmt') },
    { href: "/marketplace", icon: ShoppingCart, label: t('marketplace') },
    { href: "/talent-exchange", icon: Briefcase, label: t('talentExchange') },
    { href: "/traceability", icon: Fingerprint, label: t('traceability') },
    { href: "/forums", icon: MessageSquare, label: t('forums') },
    { href: "/sustainability", icon: Leaf, label: t('sustainability') },
  ];

  const userNavItems = user ? [
    { href: "/notifications", icon: Bell, label: t('notifications') },
    { href: "/messages", icon: MessageSquare, label: t('messages') },
    { href: "/wallet", icon: Wallet, label: t('wallet') },
  ] : [];
  
   const secondaryNavItems = [
    { href: "/settings", icon: Settings, label: t('settings')},
    { href: "/help-center", icon: HelpCircle, label: t('helpCenter')},
  ];

  const handleLogout = async () => {
    await logOut();
    onLinkClick?.();
    router.push('/auth/signin');
  };

  return (
    <>
      <SidebarHeader className="flex justify-between items-center p-2">
          {/* Empty div for spacing, aligns trigger to the right */}
          <div className="w-7 h-7"></div>
          <SidebarTrigger />
      </SidebarHeader>
      <SidebarMenu>
        {mainNavItems.map(item => (
          <SidebarMenuItem key={`main-${item.label}`}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
                onClick={onLinkClick}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
        {user && userNavItems.length > 0 && (
          <>
              <hr className="my-2"/>
              {userNavItems.map(item => (
                  <SidebarMenuItem key={`user-${item.label}`}>
                  <Link href={item.href}>
                      <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label }}
                      onClick={onLinkClick}
                      >
                      <item.icon />
                      <span>{item.label}</span>
                      </SidebarMenuButton>
                  </Link>
                  </SidebarMenuItem>
              ))}
          </>
        )}
        {isMobile && (
          <>
              <hr className="my-2"/>
              {secondaryNavItems.map(item => (
                  <SidebarMenuItem key={`secondary-${item.label}`}>
                  <Link href={item.href}>
                      <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label }}
                      onClick={onLinkClick}
                      >
                      <item.icon />
                      <span>{item.label}</span>
                      </SidebarMenuButton>
                  </Link>
                  </SidebarMenuItem>
              ))}
          </>
        )}
      </SidebarMenu>
    </>
  );
};
