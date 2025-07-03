
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, BookOpen, LayoutGrid } from "lucide-react";

const adminNavItems = [
  { href: "/admin/content", label: "Content Management", icon: BookOpen },
  // { href: "/admin/categories", label: "Marketplace Categories", icon: LayoutGrid }, // This page doesn't exist yet
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid md:grid-cols-12 gap-6 items-start">
      <aside className="md:col-span-3 lg:col-span-2">
        <Card>
            <CardContent className="p-2">
                <nav className="space-y-1">
                {adminNavItems.map(item => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                    <Button
                        key={item.href}
                        asChild
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Link>
                    </Button>
                    );
                })}
                </nav>
            </CardContent>
        </Card>
      </aside>
      <main className="md:col-span-9 lg:col-span-10">
        <div className="flex items-center gap-2 border-l-4 border-primary bg-muted/50 p-3 rounded-r-lg mb-6">
            <Shield className="h-5 w-5 text-primary" />
            <div>
                <h3 className="font-semibold">Admin Area</h3>
                <p className="text-xs text-muted-foreground">Changes made here affect the entire platform. Please proceed with caution.</p>
            </div>
        </div>
        {children}
      </main>
    </div>
  );
}
