
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { InsuranceProduct } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export default function InsuranceProductsPage() {
    const t = useTranslations('InsuranceProductsPage');
    const { user } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState<InsuranceProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getProductsCallable = useMemo(() => httpsCallable(functions, 'getInsuranceProducts'), [functions]);
    
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getProductsCallable();
            setProducts((result.data as any)?.products || []);
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('toast.errorTitle'), description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [getProductsCallable, toast, t]);
    
    useEffect(() => {
        if (user) {
            fetchProducts();
        } else {
            setIsLoading(false);
        }
    }, [user, fetchProducts]);

    if (!user && !isLoading) {
        return <p>Please log in to manage insurance products.</p>;
    }

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/insurance/products/create"><PlusCircle className="mr-2 h-4 w-4" />{t('createButton')}</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-40 w-full" />
                    ) : products.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table.productName')}</TableHead>
                                    <TableHead>{t('table.type')}</TableHead>
                                    <TableHead>{t('table.status')}</TableHead>
                                    <TableHead className="text-right">{t('table.premium')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell><Badge variant="secondary">{product.type}</Badge></TableCell>
                                        <TableCell><Badge>{product.status}</Badge></TableCell>
                                        <TableCell className="text-right">${product.premium.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">{t('noProducts')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
