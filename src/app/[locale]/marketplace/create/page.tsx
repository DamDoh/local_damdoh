
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Sparkles, Save, Briefcase, Star } from "lucide-react";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMarketplaceItemSchema, type CreateMarketplaceItemValues } from '@/lib/form-schemas';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UNIFIED_MARKETPLACE_FORM_CATEGORIES, getListingTypeFormOptions } from '@/lib/constants';
import { useAuth } from '@/lib/auth-utils';
import { Switch } from '@/components/ui/switch';
import { suggestMarketPrice } from '@/ai/flows/suggest-market-price-flow';


export default function CreateListingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const t = useTranslations('Marketplace.create');
    const tConstants = useTranslations('constants');
    const { user } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
    const [suggestedPrice, setSuggestedPrice] = useState<string | null>(null);
    
    const createListingCallable = httpsCallable(functions, 'createMarketplaceListing');

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
        skillsRequired: "",
        experienceLevel: "",
        compensation: "",
        relatedTraceabilityId: ""
      },
    });
    
    useEffect(() => {
        const vtiId = searchParams.get('vtiId');
        const productName = searchParams.get('productName');
        if (vtiId) {
            form.setValue('relatedTraceabilityId', vtiId);
        }
        if (productName) {
            form.setValue('name', `Fresh Harvested ${productName}`);
            form.setValue('listingType', 'Product');
        }
    }, [searchParams, form]);


    const listingType = form.watch('listingType');

    const handleSuggestPrice = async () => {
      const { name, description, category, location } = form.getValues();
      if (!name || !description) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please enter a name and description before suggesting a price.",
        });
        return;
      }
      setIsSuggestingPrice(true);
      setSuggestedPrice(null);
      try {
        const result = await suggestMarketPrice({ productName: name, description, category, location });
        const price = result.price;
        setSuggestedPrice(price.toFixed(2));
      } catch (error: any) {
        console.error("Error suggesting price:", error);
        toast({
          variant: "destructive",
          title: "Price Suggestion Failed",
          description: "Could not get an AI price suggestion. Please try again or enter a price manually.",
        });
      } finally {
        setIsSuggestingPrice(false);
      }
    };

    const handleSubmit = async (data: CreateMarketplaceItemValues) => {
        if (!user) {
          toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a listing." });
          return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...data };
            await createListingCallable(payload);
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
                              name="relatedTraceabilityId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Related VTI / Batch ID (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter the VTI if this listing is for a specific batch" {...field} />
                                  </FormControl>
                                  <FormDescription>Linking a VTI increases buyer trust.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />


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

                            {listingType === 'Service' ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="compensation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" />{t('form.compensationLabel')}</FormLabel>
                                                <FormControl><Input placeholder={t('form.compensationPlaceholder')} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="experienceLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2"><Star className="h-4 w-4 text-muted-foreground" />{t('form.experienceLabel')}</FormLabel>
                                                <FormControl><Input placeholder={t('form.experiencePlaceholder')} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="skillsRequired"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('form.skillsLabel')}</FormLabel>
                                                <FormControl><Textarea placeholder={t('form.skillsPlaceholder')} {...field} /></FormControl>
                                                <FormDescription>{t('form.skillsDescription')}</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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
                                    <div className="mt-2 flex flex-col items-start gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={handleSuggestPrice} disabled={isSuggestingPrice}>
                                        {isSuggestingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                        Suggest Price with AI
                                        </Button>
                                        {suggestedPrice && (
                                        <div className="p-2 bg-primary/10 text-primary-foreground/90 rounded-md text-sm flex items-center gap-2">
                                            <span>AI Suggestion: <strong>${suggestedPrice}</strong></span>
                                            <Button type="button" size="sm" className="h-auto px-2 py-1 text-xs" onClick={() => {form.setValue('price', parseFloat(suggestedPrice)); setSuggestedPrice(null);}}>Use this price</Button>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            )}

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
