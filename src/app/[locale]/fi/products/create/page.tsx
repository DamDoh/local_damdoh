
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { createFinancialProductSchema, type CreateFinancialProductValues } from '@/lib/form-schemas';
import { STAKEHOLDER_ROLES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Banknote, FileText, Loader2, Save, Percent, Users, CircleDollarSign } from 'lucide-react';


export default function CreateFinancialProductPage() {
  const t = useTranslations('FiProductCreatePage');
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const functions = getFunctions(firebaseApp);
  const createProductCallable = useMemo(() => httpsCallable(functions, 'financials-createFinancialProduct'), [functions]);

  const form = useForm<CreateFinancialProductValues>({
    resolver: zodResolver(createFinancialProductSchema),
    defaultValues: {
      name: '',
      type: 'Loan',
      description: '',
      targetRoles: [],
    },
  });
  
  const productType = form.watch('type');

  const onSubmit = async (data: CreateFinancialProductValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: t('toast.notAuthenticated') });
      return;
    }
    setIsSubmitting(true);
    try {
      await createProductCallable(data);
      toast({ title: t('toast.successTitle'), description: t('toast.successDescription', { name: data.name }) });
      router.push('/fi/products');
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('toast.errorTitle'), description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/fi/products"><ArrowLeft className="h-4 w-4 mr-2" />{t('backLink')}</Link>
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
                    <FormLabel className="flex items-center gap-2"><Banknote className="h-4 w-4"/>{t('form.nameLabel')}</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/>{t('form.descriptionLabel')}</FormLabel>
                    <FormControl><Textarea placeholder={t('form.descriptionPlaceholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {productType === 'Loan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4"/>{t('form.interestRateLabel')}</FormLabel>
                        <FormControl><Input type="number" placeholder={t('form.interestRatePlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4"/>{t('form.maxAmountLabel')}</FormLabel>
                        <FormControl><Input type="number" placeholder={t('form.maxAmountPlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
               <FormField
                control={form.control}
                name="targetRoles"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base flex items-center gap-2"><Users className="h-4 w-4"/>{t('form.targetRolesLabel')}</FormLabel>
                            <FormDescription>{t('form.targetRolesDescription')}</FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {STAKEHOLDER_ROLES.filter(role => role === 'Farmer' || role === 'Agricultural Cooperative').map((item) => (
                            <FormField
                                key={item}
                                control={form.control}
                                name="targetRoles"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={item}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...(field.value || []), item])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item
                                                )
                                            )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">{item}</FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />
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
