
"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from '@/navigation';
import { ShoppingCart, Leaf, GitBranch } from 'lucide-react';

export const ConsumerDashboard = () => {
    const t = useTranslations('ConsumerDashboard');

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t('welcomeTitle')}</CardTitle>
                    <CardDescription>{t('welcomeDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><ShoppingCart className="h-5 w-5 text-primary"/>{t('browseMarketplace.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{t('browseMarketplace.description')}</p>
                            <Button asChild className="w-full"><Link href="/marketplace">{t('browseMarketplace.button')}</Link></Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><GitBranch className="h-5 w-5 text-primary"/>{t('traceProducts.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{t('traceProducts.description')}</p>
                            <Button asChild className="w-full"><Link href="/traceability">{t('traceProducts.button')}</Link></Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><Leaf className="h-5 w-5 text-primary"/>{t('learnMore.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{t('learnMore.description')}</p>
                            <Button asChild className="w-full"><Link href="/knowledge-hub">{t('learnMore.button')}</Link></Button>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
};
