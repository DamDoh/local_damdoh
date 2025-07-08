
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from '@/navigation';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function AdminDashboardPage() {
    const t = useTranslations('admin.dashboard');
  return (
    <div>
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{t('content')}</p>
                <div className="mt-4 flex gap-4">
                    <Button asChild>
                        <Link href="/admin/content">{t('contentManagementButton')}</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
