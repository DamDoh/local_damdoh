
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Sparkles, Save, Briefcase, Star, MapPin, ImageUp } from "lucide-react";
import { useRouter, useSearchParams, Link } from '@/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMarketplaceItemSchema, type CreateMarketplaceItemValues } from '@/lib/form-schemas';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UNIFIED_MARKETPLACE_FORM_CATEGORIES } from '@/lib/constants';
import { getListingTypeFormOptions } from '@/lib/i18n-constants';
import { useAuth } from '@/lib/auth-utils';
import { Switch } from '@/components/ui/switch';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useLocale } from 'next-intl';
import { uploadFileAndGetURL } from '@/lib/storage-utils'
import { suggestMarketPrice as suggestMarketPriceAction } from '@/lib/server-actions';
import { getVtiTraceabilityHistory } from '@/lib/server-actions/traceability';

export default function CreateListingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const t = useTranslations('Marketplace.createListing');
    const tConstants = useTranslations('constants');
    const { user } = useAuth();
    const locale = useLocale();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
    const [suggestedPrice, setSuggestedPrice] = useState<string | null>(null);
    
    const functions = getFunctions(firebaseApp);
    const createListingCallable = httpsCallable(functions, 'createMarketplaceListing');

    const form = useForm<CreateMarketplaceItemValues>({
      resolver: zodResolver(createMarketplaceItemSchema),
      defaultValues: {
        name: "",
        listingType: searchParams.get('listingType') === 'Service' ? 'Service' : 'Product',
        description: "",
        price: undefined,
        perUnit: "",
        category: undefined,
        location: { lat: 11.5564, lng: 104.9282, address: "Phnom Penh, Cambodia" }, // Default location
        isSustainable: false,
        imageFile: undefined,
        skillsRequired: "",
        experienceLevel: "",
        compensation: "",
        relatedTraceabilityId: ""
      },
    });
    
    useEffect(() => {
        const vtiId = searchParams.get('vtiId');
        const productName = searchParams.get('productName');
        
        const fetchVtiData = async (id: string) => {
            try {
                const data = await getVtiTraceabilityHistory(id);
                const harvestEvent = data.events.find(e => e.eventType === 'HARVESTED');
                if (harvestEvent && harvestEvent.payload) {
                    form.setValue('price', harvestEvent.payload.pricePerUnit);
                    form.setValue('perUnit', harvestEvent.payload.unit);
                }
            } catch (error) {
                console.warn("Could not pre-fill price from VTI:", error);
            }
        };

        if (vtiId) {
            form.setValue('relatedTraceabilityId', vtiId);
            fetchVtiData(vtiId);
        }
        if (productName) {
            form.setValue('name', productName);
            form.setValue('listingType', 'Product');
        }
    }, [searchParams, form]);


    const listingType = form.watch('listingType');

    const handleSuggestPrice = async () => {
      const { name, description, category, location } = form.getValues();
      if (!name || !description) {
        toast({
          variant: "destructive",
          title: t('errors.priceSuggestion.missingInfo.title'),
          description: t('errors.priceSuggestion.missingInfo.description'),
        });
        return;
      }
      setIsSuggestingPrice(true);
      setSuggestedPrice(null);
      try {
        const result = await suggestMarketPriceAction({ productName: name, description, category, location: location.address, language: locale });
        const price = result.price;
        setSuggestedPrice(price.toFixed(2));
      } catch (error: any) {
        console.error("Error suggesting price:", error);
        toast({
          variant: "destructive",
          title: t('errors.priceSuggestion.failed.title'),
          description: t('errors.priceSuggestion.failed.description'),
        });
      } finally {
        setIsSuggestingPrice(false);
      }
    };
    
    const handleSetLocation = () => {
        const locations = [
            { lat: 11.5564, lng: 104.9282, address: "Phnom Penh, Cambodia" },
            { lat: 13.363, lng: 103.844, address: "Siem Reap, Cambodia" },
            { lat: 10.6333, lng: 104.1833, address: "Sihanoukville, Cambodia" }
        ];
        const currentLocation = form.getValues('location');
        const currentIndex = locations.findIndex(l => l.lat === currentLocation.lat);
        const nextIndex = (currentIndex + 1) % locations.length;
        form.setValue('location', locations[nextIndex]);
         toast({ title: "Location Updated", description: `Set to ${locations[nextIndex].address}`})
    }

    const handleSubmit = async (data: CreateMarketplaceItemValues) => {
        if (!user) {
          toast({ variant: "destructive", 
          title: t('errors.authentication.title'),
          description: t('errors.authentication.description'),
        });
        return;
      }

        setIsSubmitting(true);
        try {
            let imageUrl: string | undefined = undefined;
            if (data.imageFile) {
                toast({ title: "Uploading Image", description: "Please wait while your image is uploaded..." });
                imageUrl = await uploadFileAndGetURL(data.imageFile, 'marketplace-listings');
            }

            const payload = { ...data, imageUrl, imageFile: undefined }; // Don't send file to backend
            
            await createListingCallable(payload);
            toast({ title: t('success.title'), description: t('success.description') });
            router.push('/marketplace');
        } catch (error: any) {
            console.error("Error creating listing:", error);
            toast({
                variant: "destructive",
                title: t('errors.creation.title'),
                description: error.message || t('errors.creation.description'),
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
                                    <div className="flex items-center gap-4">
                                        <MapPin className="h-8 w-8 text-muted-foreground" />
                                        <div className="flex-grow">
                                            <p className="font-semibold">{field.value.address}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Lat: {field.value.lat.toFixed(4)}, Lng: {field.value.lng.toFixed(4)}
                                            </p>
                                        </div>
                                        <Button type="button" variant="outline" onClick={handleSetLocation}>{t('form.changeLocationButton')}</Button>
                                    </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                             <FormField
                              control={form.control}
                              name="relatedTraceabilityId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('form.relatedVtiLabel')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t('form.relatedVtiPlaceholder')} {...field} disabled={!!searchParams.get('vtiId')} />
                                  </FormControl>
                                  <FormDescription>{t('form.relatedVtiDescription')}</FormDescription>
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
                                        {isSuggestingPrice ? t('aiPriceSuggestion.generatingButton') : t('aiPriceSuggestion.button')}
                                        </Button>
                                        {suggestedPrice && (
                                        <div className="p-2 bg-primary/10 text-primary-foreground/90 rounded-md text-sm flex items-center gap-2">
                                            <span>{t('aiPriceSuggestion.suggestionLabel')} <strong>${suggestedPrice}</strong></span>
                                            <Button type="button" size="sm" className="h-auto px-2 py-1 text-xs" onClick={() => {form.setValue('price', parseFloat(suggestedPrice)); setSuggestedPrice(null);}}>{t('aiPriceSuggestion.usePriceButton')}</Button>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            )}

                             <FormField
                                control={form.control}
                                name="imageFile"
                                render={({ field: { onChange, value, ...rest } }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4 text-muted-foreground" />{t('form.imageFile')}</FormLabel>
                                    <FormControl>
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => onChange(e.target.files?.[0])}
                                        {...rest}
                                    />
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
