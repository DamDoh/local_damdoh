
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Loader2, Share2, ClipboardCopy, Ticket, Home, PlusCircle } from 'lucide-react';
import type { MarketplaceCoupon } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCreateMarketplaceCouponSchema, type CreateMarketplaceCouponValues } from "@/lib/form-schemas";
import { CalendarIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';


export default function MarketplacePromotionsPage() {
    const t = useTranslations('Marketplace.promotions');
    const tFormErrors = useTranslations('formErrors.createMarketplaceCoupon');
    const { user } = useAuth();
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<MarketplaceCoupon[]>([]);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
    const functions = getFunctions(firebaseApp);
    const createCouponCallable = useMemo(() => httpsCallable(functions, 'createMarketplaceCoupon'), []);
    const getCouponsCallable = useMemo(() => httpsCallable(functions, 'getSellerCoupons'), []);

    const createMarketplaceCouponSchema = getCreateMarketplaceCouponSchema(tFormErrors);
    
    const form = useForm<CreateMarketplaceCouponValues>({
        resolver: zodResolver(createMarketplaceCouponSchema),
        defaultValues: { code: "", discountType: undefined, discountValue: undefined, expiresAt: undefined, usageLimit: undefined },
    });
    
    const fetchCoupons = useCallback(async () => {
        if (!user) { setIsLoadingCoupons(false); return; }
        setIsLoadingCoupons(true);
        try {
            const result = await getCouponsCallable();
            setCoupons((result?.data as any)?.coupons || []);
        } catch (error) {
            toast({ variant: "destructive", title: t('toast.error'), description: t('toast.fetchError') });
        } finally {
            setIsLoadingCoupons(false);
        }
    }, [user, getCouponsCallable, toast, t]);
    
    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    async function onCouponSubmit(data: CreateMarketplaceCouponValues) {
        try {
            await createCouponCallable({ ...data, expiresAt: data.expiresAt?.toISOString() });
            toast({ title: t('toast.success'), description: t('toast.createSuccess', { code: data.code }) });
            form.reset();
            fetchCoupons();
        } catch (error: any) {
            console.error("Error creating coupon:", error);
            toast({ variant: "destructive", title: t('toast.createFail'), description: error.message || t('toast.createError') });
        }
    }

    const handleShare = (coupon: MarketplaceCoupon) => {
        const url = `${window.location.origin}/marketplace?coupon=${coupon.code}`;
        navigator.clipboard.writeText(url);
        toast({ title: t('toast.linkCopied'), description: t('toast.shareDescription', { code: coupon.code }) });
    };

    if (!user) {
        return <Card><CardContent className="pt-6">{t('signInPrompt')}</CardContent></Card>
    }

    return (
        <div className="space-y-6">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/"><Home className="mr-2 h-4 w-4" /> {t('backToDashboard')}</Link>
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Ticket className="h-7 w-7 text-primary" />
                        <CardTitle className="text-2xl">{t('title')}</CardTitle>
                    </div>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><PlusCircle className="h-5 w-5"/>{t('create.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Form {...form}>
                                <form onSubmit={form.handleSubmit(onCouponSubmit)} className="space-y-4">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="code" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.code')}</FormLabel> <FormControl> <Input placeholder={t('create.form.codePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                                        <FormField control={form.control} name="discountType" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.discountType')}</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl> <SelectTrigger><SelectValue placeholder={t('create.form.discountTypePlaceholder')} /></SelectTrigger> </FormControl> <SelectContent> <SelectItem value="percentage">{t('create.form.percentage')}</SelectItem> <SelectItem value="fixed">{t('create.form.fixed')}</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="discountValue" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.discountValue')}</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 10 or 15.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /> </FormControl> <FormMessage /> </FormItem> )} />
                                        <FormField control={form.control} name="usageLimit" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.usageLimit')}</FormLabel> <FormControl> <Input type="number" placeholder={t('create.form.usageLimitPlaceholder')} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/> </FormControl> <FormMessage /> </FormItem> )} />
                                   </div>
                                    <FormField
                                        control={form.control}
                                        name="expiresAt"
                                        render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>{t('create.form.expiryDate')}</FormLabel>
                                            <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : <span>{t('create.form.pickDate')}</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={form.formState.isSubmitting}> {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} {t('create.form.submitButton')} </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">{t('list.title')}</h3>
                        {isLoadingCoupons ? <Skeleton className="h-20 w-full" /> : 
                         (Array.isArray(coupons) && coupons.length > 0) ? (
                            <div className="space-y-2">
                                {coupons.map(coupon => (
                                    <div key={coupon.id} className="flex flex-wrap justify-between items-center gap-2 p-3 border rounded-lg">
                                        <div className="font-mono text-primary bg-primary/10 px-2 py-1 rounded-md text-sm">{coupon.code}</div>
                                        <div className="text-sm"> {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue?.toFixed(2)} off`} </div>
                                        <div className="text-xs text-muted-foreground"> {t('list.usage')}: {coupon.usageCount} / {coupon.usageLimit || '∞'} </div>
                                        <div className="text-xs text-muted-foreground"> {t('list.expires')}: {coupon.expiresAt ? format(new Date(coupon.expiresAt), "PPP") : t('list.never')} </div>
                                        <Dialog> <DialogTrigger asChild> <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> {t('list.share')}</Button> </DialogTrigger> <DialogContent> <DialogHeader> <DialogTitle>{t('list.shareModal.title')}</DialogTitle> <DialogDescription>{t('list.shareModal.description')} </DialogDescription> </DialogHeader> <div className="flex items-center space-x-2"> <div className="grid flex-1 gap-2"> <Label htmlFor="link" className="sr-only">{t('list.shareModal.link')}</Label> <Input id="link" defaultValue={`${window.location.origin}/marketplace?coupon=${coupon.code}`} readOnly /> </div> <Button type="button" size="sm" className="px-3" onClick={() => handleShare(coupon)}> <span className="sr-only">{t('list.shareModal.copy')}</span> <ClipboardCopy className="h-4 w-4" /> </Button> </div> <DialogFooter> <DialogClose asChild> <Button type="button" variant="secondary">{t('list.shareModal.close')}</Button> </DialogClose> </DialogFooter> </DialogContent> </Dialog>
                                    </div>
                                ))}
                            </div>
                         ) : <p className="text-sm text-muted-foreground text-center py-4">{t('list.noCoupons')}</p>
                        }
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
