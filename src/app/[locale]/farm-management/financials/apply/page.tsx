
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useTranslations } from 'next-intl';

import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import { financialApplicationSchema, type FinancialApplicationValues } from '@/lib/form-schemas';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, FileText, Banknote, DollarSign, Building } from 'lucide-react';
import type { UserProfile } from '@/lib/types';


function ApplyForFundingSkeleton() {
  const t = useTranslations('farmManagement.financials.apply');
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}


export default function ApplyForFundingPage() {
  const t = useTranslations('farmManagement.financials.apply');
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [fis, setFis] = useState<UserProfile[]>([]);
  const [isLoadingFis, setIsLoadingFis] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const functions = getFunctions(firebaseApp);
  const getFinancialInstitutionsCallable = useMemo(() => httpsCallable(functions, 'financials-getFinancialInstitutions'), [functions]);
  const submitFinancialApplicationCallable = useMemo(() => httpsCallable(functions, 'financials-submitFinancialApplication'), [functions]);

  const form = useForm<FinancialApplicationValues>({
    resolver: zodResolver(financialApplicationSchema),
    defaultValues: {
      type: 'Loan',
      currency: 'USD',
    },
  });
  
  const fetchFis = useCallback(async () => {
      setIsLoadingFis(true);
      try {
        const result = await getFinancialInstitutionsCallable();
        setFis((result.data as any) || []);
      } catch (error) {
        toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.fetchFiError') });
      } finally {
        setIsLoadingFis(false);
      }
  }, [getFinancialInstitutionsCallable, toast, t]);
  
  useEffect(() => {
    fetchFis();
  }, [fetchFis]);

  const onSubmit = async (data: FinancialApplicationValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: t('toast.notAuthenticatedError') });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitFinancialApplicationCallable(data);
      toast({ title: t('toast.successTitle'), description: t('toast.successDescription') });
      router.push('/farm-management/financials');
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('toast.error'), description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/farm-management/financials">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backLink')}
        </Link>
      </Button>

      {isLoadingFis ? <ApplyForFundingSkeleton /> : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="fiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Building className="h-4 w-4" /> {t('form.institutionLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={fis.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={fis.length > 0 ? t('form.institutionPlaceholder') : t('form.noInstitutions')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fis.map(fi => (
                            <SelectItem key={fi.id} value={fi.id}>{fi.displayName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4" /> {t('form.typeLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Loan">{t('form.loan')}</SelectItem>
                            <SelectItem value="Grant">{t('form.grant')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> {t('form.amountLabel')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel className="flex items-center gap-2"><Banknote className="h-4 w-4" /> {t('form.currencyLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="USD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4" /> {t('form.purposeLabel')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('form.purposePlaceholder')} className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormDescription>{t('form.purposeDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('form.submitButton')}
                </Button>
              </CardContent>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
}
