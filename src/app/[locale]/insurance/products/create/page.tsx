
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { createInsuranceProductSchema, type CreateInsuranceProductValues } from '@/lib/form-schemas';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Shield, FileText, CircleDollarSign, Banknote } from 'lucide-react';

export default function CreateInsuranceProductPage() {
  const t = useTranslations('InsuranceProductCreatePage');
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const functions = getFunctions(firebaseApp);
  const createProductCallable = useMemo(() => httpsCallable(functions, 'createInsuranceProduct'), [functions]);

  const form = useForm<CreateInsuranceProductValues>({
    resolver: zodResolver(createInsuranceProductSchema),
    defaultValues: {
      name: '',
      type: undefined,
      description: '',
      coverageDetails: '',
      premium: undefined,
      currency: 'USD',
    },
  });

  const onSubmit = async (data: CreateInsuranceProductValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: t('toast.notAuthenticated') });
      return;
    }
    setIsSubmitting(true);
    try {
      await createProductCallable(data);
      toast({ title: t('toast.successTitle'), description: t('toast.successDescription', { name: data.name }) });
      router.push('/insurance/products');
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('toast.errorTitle'), description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/insurance/products"><ArrowLeft className="h-4 w-4 mr-2" />{t('backLink')}</Link>
      </Button>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Shield className="h-4 w-4"/>{t('form.nameLabel')}</FormLabel>
                    <FormControl><Input placeholder={t('form.namePlaceholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/>{t('form.typeLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('form.typePlaceholder')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Crop">{t('form.crop')}</SelectItem>
                          <SelectItem value="Livestock">{t('form.livestock')}</SelectItem>
                          <SelectItem value="Asset">{t('form.asset')}</SelectItem>
                          <SelectItem value="Weather">{t('form.weather')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/>{t('form.descriptionLabel')}</FormLabel>
                    <FormControl><Textarea placeholder={t('form.descriptionPlaceholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="coverageDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/>{t('form.coverageLabel')}</FormLabel>
                    <FormControl><Textarea placeholder={t('form.coveragePlaceholder')} {...field} className="min-h-[120px]"/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="premium"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4"/>{t('form.premiumLabel')}</FormLabel>
                        <FormControl><Input type="number" placeholder={t('form.premiumPlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2"><Banknote className="h-4 w-4"/>{t('form.currencyLabel')}</FormLabel>
                        <FormControl><Input placeholder="USD" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4"/>{t('form.submitButton')}
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
