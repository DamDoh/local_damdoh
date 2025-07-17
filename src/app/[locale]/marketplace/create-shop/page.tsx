"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createShopSchema, type CreateShopValues } from '@/lib/form-schemas';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Building, Save } from 'lucide-react';
import { STAKEHOLDER_ROLES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';

/**
 * Frontend component for stakeholders to create their Digital Shopfront.
 * This UI calls the `createShop` backend function.
 */
export default function CreateShopPage() {
 the t = useTranslations('Marketplace.createShop');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  const router = useRouter();
  const createShopCallable = useMemo(() => httpsCallable(functions, 'createShop'), [functions]);

  const form = useForm<CreateShopValues>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: "",
      description: "",
      stakeholderType: undefined,
    },
  });

  const handleSubmit = async (data: CreateShopValues) => {
    if (!user) {
 return; // Should not happen if auth guard works, but good practice
    }
    setIsSubmitting(true);
    try {
 await createShopCallable(data);

 toast({
        title: t('toast.successTitle'),
        description: t('toast.successDescription', { shopName: data.name }),
 });

 router.push('/profiles/me'); // Redirect to profile page after successful creation

    } catch (error: any) {
      console.error("Error creating shopfront:", error);
      toast({
        variant: "destructive",
        title: t('toast.failTitle'),
        description: error.message || t('toast.failDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
 return (
 <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4 text-center">
 <Card>
 <CardHeader>
 <CardTitle>{t('authRequired.title')}</CardTitle>
 </CardHeader>
 <CardContent>
 <CardDescription>{t('authRequired.description')}</CardDescription>
 <Button asChild className="mt-4">
 <Link href={`/signin?callbackUrl=${encodeURIComponent('/marketplace/create-shop')}`}>
              {t('authRequired.signInButton')}
 </Link>
 </Button>
 </CardContent>
 </Card>
 </div>
 );
  }

  return (
 <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4">
 <Button asChild variant="outline">
          <Link href="/marketplace"><ArrowLeft className="h-4 w-4 mr-2" />{t('backLink')}</Link>
 </Button>
 <Card>
 <CardHeader>
 <div className="flex items-center gap-2">
 <Building className="h-6 w-6 text-primary"/>
 <CardTitle className="text-2xl">{t('title')}</CardTitle>
 </div>
 <CardDescription>{t('description')}</CardDescription>
 </CardHeader>
 <CardContent>
 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
 {/* Form Fields for Shop Name, Type, Description */}
 {/* ... (Input, Select, Textarea fields as in the original code) ... */}

 {/* Submit Button */}
              <Button type="submit" className="w-full !mt-8" size="lg" disabled={isSubmitting}>
 {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>{t('submittingButton')}</>) : (<><Save className="mr-2 h-4 w-4" />{t('submitButton')}</>)}
 </Button>
 </form>
 </Form>
 </CardContent>
 </Card>
 </div>
  );
}

"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createShopSchema, type CreateShopValues } from '@/lib/form-schemas';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Building, Save } from 'lucide-react';
import { STAKEHOLDER_ROLES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';

/**
 * Frontend component for stakeholders to create their Digital Shopfront.
 * This UI calls the `createShop` backend function.
 */
export default function CreateShopPage() {
  const t = useTranslations('Marketplace.createShop');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  const router = useRouter();
  const createShopCallable = useMemo(() => httpsCallable(functions, 'createShop'), [functions]);

  const form = useForm<CreateShopValues>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: "",
      description: "",
      stakeholderType: undefined,
    },
  });

  const handleSubmit = async (data: CreateShopValues) => {
    if (!user) {
        toast({ title: t('authErrorTitle'), description: t('authErrorDescription'), variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
      await createShopCallable(data);

      toast({
        title: t('toast.successTitle'),
        description: t('toast.successDescription', { shopName: data.name }),
      });

      router.push('/profiles/me');

    } catch (error: any) {
      console.error("Error creating shopfront:", error);
      toast({
        variant: "destructive",
        title: t('toast.failTitle'),
        description: error.message || t('toast.failDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4">
      <Button asChild variant="outline">
          <Link href="/marketplace"><ArrowLeft className="h-4 w-4 mr-2" />{t('backLink')}</Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary"/>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
          </div>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                  control={form.control}
                  name="stakeholderType"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>{t('form.typeLabel')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder={t('form.typePlaceholder')} />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  {STAKEHOLDER_ROLES.map((role) => (
                                      <SelectItem key={role} value={role}>{role}</SelectItem>
                                  ))}
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
                    <FormLabel>{t('form.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('form.descriptionPlaceholder')} className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full !mt-8" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>{t('submittingButton')}
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" />{t('submitButton')}</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
