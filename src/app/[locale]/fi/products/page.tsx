
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/api-utils';
import type { FinancialProduct } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export default function FinancialProductsPage() {
    const t = useTranslations('FiProductsPage');
    const { user } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState<FinancialProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await apiCall<{ products: FinancialProduct[] }>('/financial/products');
            setProducts(result.products || []);
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('toast.errorTitle'), description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [toast, t]);
    
    useEffect(() => {
        if (user) {
            fetchProducts();
        } else {
            setIsLoading(false);
        }
    }, [user, fetchProducts]);

    if (!user && !isLoading) {
        return <p>Please log in to manage financial products.</p>;
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
                        <Link href="/fi/products/create"><PlusCircle className="mr-2 h-4 w-4" />{t('createButton')}</Link>
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
                                    <TableHead>{t('table.interestRate')}</TableHead>
                                    <TableHead className="text-right">{t('table.maxAmount')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell><Badge variant="secondary">{product.type}</Badge></TableCell>
                                        <TableCell><Badge>{product.status}</Badge></TableCell>
                                        <TableCell>{product.interestRate ? `${product.interestRate}%` : 'N/A'}</TableCell>
                                        <TableCell className="text-right">{product.maxAmount ? `$${product.maxAmount.toLocaleString()}` : 'N/A'}</TableCell>
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
