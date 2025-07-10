
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useTranslations } from 'next-intl';

import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { createInsuranceApplicationSchema, type CreateInsuranceApplicationValues } from '@/lib/form-schemas';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, DollarSign, Home, ShieldCheck, CheckCircle, RefreshCw } from 'lucide-react';
import type { InsuranceProduct } from '@/lib/types';

interface Farm {
  id: string;
  name: string;
}

export default function ApplyForInsurancePage() {
    const t = useTranslations('InsuranceApplyPage');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [farms, setFarms] = useState<Farm[]>([]);
    const [product, setProduct] = useState<InsuranceProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const getUserFarmsCallable = useMemo(() => httpsCallable(functions, 'getUserFarms'), []);
    const getProductDetailsCallable = useMemo(() => httpsCallable(functions, 'getInsuranceProductDetails'), []);
    const submitApplicationCallable = useMemo(() => httpsCallable(functions, 'submitInsuranceApplication'), []);
    
    const productId = searchParams.get('productId');

    const form = useForm<CreateInsuranceApplicationValues>({
        resolver: zodResolver(createInsuranceApplicationSchema),
        defaultValues: {
            productId: productId || undefined,
            farmId: undefined,
            coverageValue: undefined,
        },
    });
    
    const fetchData = useCallback(async () => {
        if (!user || !productId) return;
        setIsLoading(true);
        try {
            const [farmsResult, productResult] = await Promise.all([
                getUserFarmsCallable(),
                getProductDetailsCallable({ productId })
            ]);
            setFarms((farmsResult.data as any)?.farms || []);
            setProduct((productResult.data as any)?.product || null);
        } catch(error: any) {
            toast({ variant: 'destructive', title: t('toast.error'), description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [user, productId, getUserFarmsCallable, getProductDetailsCallable, toast, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const onSubmit = async (data: CreateInsuranceApplicationValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await submitApplicationCallable(data);
            toast({ title: t('toast.successTitle'), description: t('toast.successDescription') });
            setIsSuccess(true);
        } catch(error: any) {
            toast({ variant: 'destructive', title: t('toast.error'), description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return <Skeleton className="h-96 w-full max-w-2xl mx-auto" />;
    }

    if (isSuccess) {
        return (
            <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900/30 rounded-full h-16 w-16 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl pt-4">{t('success.title')}</CardTitle>
                    <CardDescription>{t('success.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button asChild className="w-full">
                        <Link href="/">{t('success.backToDashboardButton')}</Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => router.back()}>
                        <RefreshCw className="mr-2 h-4 w-4" /> {t('success.applyForAnotherButton')}
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-6">
            <Button asChild variant="outline">
                <Link href="/insurance"><ArrowLeft className="h-4 w-4 mr-2" />{t('backLink')}</Link>
            </Button>
            
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('title')}</CardTitle>
                    <CardDescription>{t('description', { productName: product?.name || 'the selected product' })}</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="farmId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><Home className="h-4 w-4"/>{t('form.farmLabel')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={farms.length === 0}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder={farms.length > 0 ? t('form.farmPlaceholder') : t('form.noFarms')} /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {farms.map(farm => <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <FormField control={form.control} name="coverageValue" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4"/>{t('form.coverageValueLabel')}</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder={t('form.coverageValuePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormDescription>{t('form.coverageValueDescription')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                             <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <ShieldCheck className="mr-2 h-4 w-4"/> {t('form.submitButton')}
                            </Button>
                        </CardContent>
                    </form>
                </Form>
            </Card>
        </div>
    );
}

      