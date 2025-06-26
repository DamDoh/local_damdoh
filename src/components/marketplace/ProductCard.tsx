"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { ArrowLeft, Loader2, Share2, ClipboardCopy, Ticket, Home } from 'lucide-react';
import type { MarketplaceCoupon } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMarketplaceCouponSchema, type CreateMarketplaceCouponValues } from "@/lib/form-schemas";
import { CalendarIcon } from 'lucide-react';


export default function MarketplacePromotionsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<MarketplaceCoupon[]>([]);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
    const functions = getFunctions(firebaseApp);
    const createCouponCallable = useMemo(() => httpsCallable(functions, 'createMarketplaceCoupon'), [functions]);
    const getCouponsCallable = useMemo(() => httpsCallable(functions, 'getSellerCoupons'), [functions]);

    const form = useForm<CreateMarketplaceCouponValues>({
        resolver: zodResolver(createMarketplaceCouponSchema),
        defaultValues: { code: "", discountType: undefined, discountValue: undefined, expiresAt: undefined, usageLimit: undefined },
    });
    
    const fetchCoupons = useCallback(async () => {
        if (!user) { setIsLoadingCoupons(false); return; }
        setIsLoadingCoupons(true);
        try {
            const result = await getCouponsCallable();
            setCoupons((result.data as any).coupons || []);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch your existing coupons." });
        } finally {
            setIsLoadingCoupons(false);
        }
    }, [user, getCouponsCallable, toast]);
    
    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    async function onCouponSubmit(data: CreateMarketplaceCouponValues) {
        try {
            await createCouponCallable({ ...data, expiresAt: data.expiresAt?.toISOString() });
            toast({ title: "Success", description: `Coupon "${data.code}" created successfully.` });
            form.reset();
            fetchCoupons();
        } catch (error: any) {
            console.error("Error creating coupon:", error);
            toast({ variant: "destructive", title: "Creation Failed", description: error.message || "Could not create the coupon." });
        }
    }

    const handleShare = (coupon: MarketplaceCoupon) => {
        const url = `${window.location.origin}/marketplace?coupon=${coupon.code}`;
        navigator.clipboard.writeText(url);
        toast({ title: "Link Copied!", description: `A shareable link with the coupon "${coupon.code}" has been copied.` });
    };

    if (!user) {
        return <Card><CardContent className="pt-6">Please sign in to manage promotions.</CardContent></Card>
    }

    return (
        <div className="space-y-6">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/"><Home className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Ticket className="h-7 w-7 text-primary" />
                        <CardTitle className="text-2xl">Marketplace Promotions</CardTitle>
                    </div>
                    <CardDescription>Create and manage discount coupons for your products and services to attract more buyers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg">Create New Coupon</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Form {...form}>
                                <form onSubmit={form.handleSubmit(onCouponSubmit)} className="space-y-4">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="code" render={({ field }) => ( <FormItem> <FormLabel>Coupon Code</FormLabel> <FormControl> <Input placeholder="e.g., HARVEST2024" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                                        <FormField control={form.control} name="discountType" render={({ field }) => ( <FormItem> <FormLabel>Discount Type</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger> </FormControl> <SelectContent> <SelectItem value="percentage">Percentage (%)</SelectItem> <SelectItem value="fixed">Fixed Amount</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="discountValue" render={({ field }) => ( <FormItem> <FormLabel>Discount Value</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 10 or 15.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /> </FormControl> <FormMessage /> </FormItem> )} />
                                        <FormField control={form.control} name="usageLimit" render={({ field }) => ( <FormItem> <FormLabel>Usage Limit (Optional)</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/> </FormControl> <FormMessage /> </FormItem> )} />
                                   </div>
                                    <FormField control={form.control} name="expiresAt" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Expiration Date (Optional)</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}> {field.value ? format(field.value, "PPP") : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                                    <Button type="submit" disabled={form.formState.isSubmitting}> {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Create Coupon </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">My Coupons</h3>
                        {isLoadingCoupons ? <Skeleton className="h-20 w-full" /> : 
                         coupons.length > 0 ? (
                            <div className="space-y-2">
                                {coupons.map(coupon => (
                                    <div key={coupon.id} className="flex flex-wrap justify-between items-center gap-2 p-3 border rounded-lg">
                                        <div className="font-mono text-primary bg-primary/10 px-2 py-1 rounded-md text-sm">{coupon.code}</div>
                                        <div className="text-sm"> {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue.toFixed(2)} off`} </div>
                                        <div className="text-xs text-muted-foreground"> Used: {coupon.usageCount} / {coupon.usageLimit || '∞'} </div>
                                        <div className="text-xs text-muted-foreground"> Expires: {coupon.expiresAt ? format(new Date((coupon.expiresAt as any)._seconds * 1000), "PPP") : 'Never'} </div>
                                        <Dialog> <DialogTrigger asChild> <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button> </DialogTrigger> <DialogContent> <DialogHeader> <DialogTitle>Share Coupon</DialogTitle> <DialogDescription> Share this code with your customers. You can also send them the link below to have it auto-apply. </DialogDescription> </DialogHeader> <div className="flex items-center space-x-2"> <div className="grid flex-1 gap-2"> <Label htmlFor="link" className="sr-only">Link</Label> <Input id="link" defaultValue={`${window.location.origin}/marketplace?coupon=${coupon.code}`} readOnly /> </div> <Button type="button" size="sm" className="px-3" onClick={() => handleShare(coupon)}> <span className="sr-only">Copy</span> <ClipboardCopy className="h-4 w-4" /> </Button> </div> <DialogFooter> <DialogClose asChild> <Button type="button" variant="secondary">Close</Button> </DialogClose> </DialogFooter> </DialogContent> </Dialog>
                                    </div>
                                ))}
                            </div>
                         ) : <p className="text-sm text-muted-foreground text-center py-4">No coupons created yet.</p>
                        }
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}