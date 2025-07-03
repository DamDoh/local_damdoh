
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Sparkles, Save } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMarketplaceItemSchema, type CreateMarketplaceItemValues } from '@/lib/form-schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UNIFIED_MARKETPLACE_FORM_CATEGORIES, getListingTypeFormOptions } from '@/lib/constants';
import { useAuth } from '@/lib/auth-utils';
import { Switch } from '@/components/ui/switch';


export default function CreateListingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const t = useTranslations('Marketplace.create');
    const tConstants = useTranslations('constants');
    const { user } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const createListingCallable = useMemo(() => httpsCallable(functions, 'createMarketplaceListing'), [functions]);

    const form = useForm<CreateMarketplaceItemValues>({
      resolver: zodResolver(createMarketplaceItemSchema),
      defaultValues: {
        name: "",
        listingType: undefined,
        description: "",
        price: undefined,
        perUnit: "",
        category: undefined,
        location: "",
        isSustainable: false,
        imageUrl: "",
      },
    });

    const handleSubmit = async (data: CreateMarketplaceItemValues) => {
        if (!user) {
          toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a listing." });
          return;
        }

        setIsSubmitting(true);
        try {
            await createListingCallable(data);
            toast({ title: "Success!", description: "Your listing has been created." });
            router.push('/marketplace');
        } catch (error: any) {
            console.error("Error creating listing:", error);
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: error.message || "Could not create the listing. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const listingTypeOptions = getListingTypeFormOptions(tConstants);

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Link href="/marketplace" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>
            
             <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('title')}</CardTitle>
                            <CardDescription>{t('description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                              name="listingType"
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
                                      {listingTypeOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </SelectItem>
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
                                    <Textarea placeholder={t('form.descriptionPlaceholder')} className="min-h-[100px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                               <FormField
                                  control={form.control}
                                  name="price"
                                  render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                      <FormLabel>{t('form.priceLabel')}</FormLabel>
                                      <FormControl>
                                        <Input type="number" step="0.01" placeholder={t('form.pricePlaceholder')} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                 <FormField
                                  control={form.control}
                                  name="perUnit"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t('form.unitLabel')}</FormLabel>
                                      <FormControl>
                                        <Input placeholder={t('form.unitPlaceholder')} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                            </div>

                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('form.categoryLabel')}</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('form.categoryPlaceholder')} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {UNIFIED_MARKETPLACE_FORM_CATEGORIES.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('form.locationLabel')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t('form.locationPlaceholder')} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <FormField
                              control={form.control}
                              name="imageUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('form.imageUrlLabel')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://placehold.co/400x300.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                             <FormField
                                control={form.control}
                                name="isSustainable"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                    <FormLabel className="text-base">{t('form.sustainableLabel')}</FormLabel>
                                    <FormDescription>{t('form.sustainableDescription')}</FormDescription>
                                    </div>
                                    <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    </FormControl>
                                </FormItem>
                                )}
                            />

                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('form.submittingButton')}</> : <><Save className="mr-2 h-4 w-4" />{t('form.submitButton')}</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
