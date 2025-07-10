
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ArrowLeft, FileText, CheckCircle } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { InsuranceProduct } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';

function ProductDetailPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
                 <CardContent>
                    <Skeleton className="h-10 w-40" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function InsuranceProductDetailPage() {
    const t = useTranslations('InsuranceDetailPage');
    const { user } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const productId = params.productId as string;

    const [product, setProduct] = useState<InsuranceProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getProductDetailsCallable = useMemo(() => httpsCallable(functions, 'getInsuranceProductDetails'), []);

    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const result = await getProductDetailsCallable({ productId });
                setProduct((result.data as any)?.product || null);
            } catch (error: any) {
                toast({ variant: 'destructive', title: t('toast.errorTitle'), description: error.message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productId, getProductDetailsCallable, toast, t]);

    if (isLoading) {
        return <ProductDetailPageSkeleton />;
    }

    if (!product) {
        return <p>{t('notFound')}</p>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Link href="/insurance" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" />{t('backLink')}
            </Link>
            <Card>
                <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">{product.type}</Badge>
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/>{t('coverageTitle')}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{product.coverageDetails}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4"/>{t('premiumTitle')}</h3>
                        <p className="text-3xl font-bold text-primary">${product.premium.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">/ {t('perTerm')}</span></p>
                    </div>
                    {product.provider && (
                        <div>
                            <h3 className="font-semibold text-base mb-2">{t('providerTitle')}</h3>
                             <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                                <Avatar>
                                    <AvatarImage src={product.provider.avatarUrl} alt={product.provider.displayName} />
                                    <AvatarFallback>{product.provider.displayName?.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{product.provider.displayName}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href={`/insurance/apply?productId=${product.id}`}>{t('applyButton')}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

      