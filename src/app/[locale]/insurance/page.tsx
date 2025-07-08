
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { InsuranceProduct } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export default function InsuranceHubPage() {
    const t = useTranslations('InsurancePage');
    const { user } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState<InsuranceProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getProductsCallable = useMemo(() => httpsCallable(functions, 'getAvailableInsuranceProducts'), []);
    
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const result = await getProductsCallable();
                setProducts((result.data as any)?.products || []);
            } catch (error: any) {
                toast({ variant: 'destructive', title: t('toast.errorTitle'), description: error.message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [getProductsCallable, toast, t]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><Shield className="h-6 w-6 text-primary"/>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                        </Card>
                    ))
                ) : products.length > 0 ? (
                    products.map(product => (
                        <Card key={product.id} className="flex flex-col">
                            <CardHeader>
                                <Badge variant="secondary" className="w-fit mb-2">{product.type}</Badge>
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription className="line-clamp-3 h-[60px]">{product.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-2xl font-bold">${product.premium.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ {t('perTerm')}</span></p>
                            </CardContent>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href={`/insurance/${product.id}`}>{t('viewDetailsButton')} <ArrowRight className="h-4 w-4 ml-2"/></Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="col-span-full text-center text-muted-foreground py-10">{t('noProducts')}</p>
                )}
            </div>
        </div>
    );
}
