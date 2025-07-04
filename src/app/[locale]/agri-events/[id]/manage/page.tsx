
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Share2, PlusCircle, Loader2, CalendarIcon, ClipboardCopy, QrCode, ScanLine, UserCheck, XCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createAgriEventCouponSchema, type CreateAgriEventCouponValues } from "@/lib/form-schemas";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventCoupon } from "@/lib/types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { QrScanner } from '@/components/QrScanner';
import { Alert } from "@/components/ui/alert";

// --- Promotions Tab Components ---

const CouponCreationForm = ({ onCouponCreated }: { onCouponCreated: () => void }) => {
    const t = useTranslations('AgriEvents.promotions');
    const { toast } = useToast();
    const params = useParams();
    const eventId = params.id as string;
    const createCouponCallable = useMemo(() => httpsCallable(functions, 'createEventCoupon'), []);

    const form = useForm<CreateAgriEventCouponValues>({
        resolver: zodResolver(createAgriEventCouponSchema),
        defaultValues: {
            code: "",
            discountType: "percentage",
            usageLimit: 100,
        },
    });

    async function onSubmit(values: CreateAgriEventCouponValues) {
        try {
            await createCouponCallable({
                ...values,
                eventId,
                expiryDate: values.expiryDate?.toISOString()
            });
            toast({ title: "Coupon Created!", description: `The coupon "${values.code}" is now active.` });
            onCouponCreated();
            form.reset();
        } catch (error: any) {
            console.error("Error creating coupon:", error);
            toast({ variant: "destructive", title: "Creation Failed", description: error.message });
        }
    }

    return (
        <Card className="bg-muted/30">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <PlusCircle className="h-6 w-6"/>
                    <CardTitle className="text-lg">{t('create.title')}</CardTitle>
                </div>
                <CardDescription>{t('create.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="code" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.code')}</FormLabel> <FormControl> <Input placeholder={t('create.form.codePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                             <FormField control={form.control} name="usageLimit" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.usageLimit')}</FormLabel> <FormControl> <Input type="number" placeholder={t('create.form.usageLimitPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                             <FormField control={form.control} name="discountType" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.discountType')}</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder={t('create.form.discountTypePlaceholder')} /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="percentage">{t('create.form.percentage')}</SelectItem> <SelectItem value="fixed">{t('create.form.fixed')}</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="discountValue" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.discountValue')}</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 10 or 5" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="expiryDate" render={({ field }) => ( <FormItem className="flex flex-col pt-2"> <FormLabel className="mb-2">{t('create.form.expiryDate')}</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}> {field.value ? (format(field.value, "PPP")) : (<span>{t('create.form.pickDate')}</span>)} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                        </div>
                        <Button type="submit" disabled={form.formState.isSubmitting}> {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} {t('create.form.submitButton')} </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const ExistingCouponsList = ({ coupons, isLoading }: { coupons: EventCoupon[], isLoading: boolean }) => {
    const t = useTranslations('AgriEvents.promotions');
    const { toast } = useToast();

    const handleShare = (code: string) => {
        const eventId = window.location.pathname.split('/agri-events/')[1].split('/')[0];
        const shareLink = `${window.location.origin}/agri-events/${eventId}?coupon=${code}`;
        navigator.clipboard.writeText(shareLink);
        toast({ title: t('list.toastTitle'), description: t('list.toastDescription', { link: shareLink }), });
    };

    if (isLoading) return <Card> <CardHeader> <Skeleton className="h-6 w-1/3" /> <Skeleton className="h-4 w-2/3" /> </CardHeader> <CardContent className="space-y-4"> <Skeleton className="h-20 w-full" /> <Skeleton className="h-20 w-full" /> </CardContent> </Card>
    return (
        <Card>
            <CardHeader> <CardTitle>{t('list.title')}</CardTitle> <CardDescription>{t('list.description')}</CardDescription> </CardHeader>
            <CardContent className="space-y-4">
                {Array.isArray(coupons) && coupons.length > 0 ? ( coupons.map((coupon) => ( <Card key={coupon.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4"> <div className="mb-4 md:mb-0"> <div className="flex items-center gap-2"> <Ticket className="h-5 w-5 text-primary"/> <p className="text-lg font-bold">{coupon.code}</p> </div> <p className="text-sm text-muted-foreground"> {coupon.discountType === 'fixed' ? `$${coupon.discountValue?.toFixed(2) ?? '0.00'}` : `${coupon.discountValue ?? 0}%`} off | {t('list.expires')}: {coupon.expiresAt ? format(new Date(coupon.expiresAt), "PPP") : 'Never'} </p> <p className="text-sm"> {t('list.usage')}: {coupon.usageCount} / {coupon.usageLimit || '∞'} </p> </div> <Dialog> <DialogTrigger asChild> <Button variant="outline" size="sm"> <Share2 className="mr-2 h-4 w-4" /> {t('list.share')} </Button> </DialogTrigger> <DialogContent> <DialogHeader> <DialogTitle>Share Coupon</DialogTitle> <DialogDescription> Share this code or link with potential attendees. </DialogDescription> </DialogHeader> <div className="flex items-center space-x-2"> <div className="grid flex-1 gap-2"> <Label htmlFor="link" className="sr-only">Link</Label> <Input id="link" defaultValue={`${window.location.origin}/agri-events/${window.location.pathname.split('/agri-events/')[1].split('/')[0]}?coupon=${coupon.code}`} readOnly /> </div> <Button type="button" size="sm" className="px-3" onClick={() => handleShare(coupon.code)}> <span className="sr-only">Copy</span> <ClipboardCopy className="h-4 w-4" /> </Button> </div> <DialogFooter> <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose> </DialogFooter> </DialogContent> </Dialog> </Card> )) ) : ( <p className="text-sm text-center text-muted-foreground pt-4">{t('list.noCoupons')}</p> )}
            </CardContent>
        </Card>
    );
};

// --- Check-in Tab Components ---

const CheckInTab = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [checkInResult, setCheckInResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const params = useParams();
    const eventId = params.id as string;
    const { toast } = useToast();
    const checkInCallable = useMemo(() => httpsCallable(functions, 'checkInAttendee'), []);

    const handleScanSuccess = async (decodedText: string) => {
        setIsScanning(false);
        setIsProcessing(true);
        setCheckInResult(null);

        try {
            const url = new URL(decodedText);
            const scannedUniversalId = url.searchParams.get('id');

            if (!scannedUniversalId) {
                throw new Error("Invalid QR Code: No Universal ID found.");
            }
            
            const result = await checkInCallable({ eventId, scannedUniversalId });
            const data = result.data as { success: boolean, message: string };
            
            if (data.success) {
                setCheckInResult({ type: 'success', message: data.message });
                toast({ title: "Check-in Successful", description: data.message });
            } else {
                 throw new Error(data.message || "Check-in failed for an unknown reason.");
            }
        } catch (error: any) {
             const message = error.message.includes('permission-denied') ? "You are not authorized to check-in for this event." :
                            error.message.includes('not-found') ? "Attendee not found or not registered." :
                            error.message.includes('already-exists') ? "This attendee has already been checked in." :
                            error.message;
            setCheckInResult({ type: 'error', message: message });
            toast({ variant: "destructive", title: "Check-in Failed", description: message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleScanFailure = (error: string) => {
        setIsScanning(false);
        toast({ variant: "destructive", title: "Scan Failed", description: "Could not read the QR code. Please try again." });
    };

    return (
        <>
        {isScanning && ( <QrScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} onClose={() => setIsScanning(false)} /> )}
        <Card>
            <CardHeader>
                <CardTitle>Attendee Check-in</CardTitle>
                <CardDescription>Scan attendee Universal ID QR codes to check them into the event.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <Button size="lg" onClick={() => setIsScanning(true)} disabled={isProcessing}>
                    <ScanLine className="mr-2 h-6 w-6" />
                    Scan Attendee Ticket
                </Button>

                {isProcessing && <div className="flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Verifying...</div>}
                
                {checkInResult && (
                    <Alert variant={checkInResult.type === 'error' ? 'destructive' : 'default'} className="text-left">
                        {checkInResult.type === 'success' ? <UserCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <CardTitle className="text-base">{checkInResult.type === 'success' ? "Success" : "Error"}</CardTitle>
                        <AlertDescription>{checkInResult.message}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
        </>
    );
};


// --- Main Page Component ---
export default function ManageEventPage() {
    const t = useTranslations('AgriEvents.manage');
    const [coupons, setCoupons] = useState<EventCoupon[]>([]);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
    const params = useParams();
    const eventId = params.id as string;
    const { toast } = useToast();

    const getEventCouponsCallable = useMemo(() => httpsCallable(functions, 'getEventCoupons'), []);

    const fetchCoupons = useCallback(async () => {
        setIsLoadingCoupons(true);
        try {
            const result = await getEventCouponsCallable({ eventId });
            setCoupons((result?.data as any)?.coupons || []);
        } catch (error) {
            console.error("Error fetching event coupons:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch existing coupons." });
        } finally {
            setIsLoadingCoupons(false);
        }
    }, [eventId, getEventCouponsCallable, toast]);

    useEffect(() => { if(eventId) { fetchCoupons(); } }, [eventId, fetchCoupons]);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground mb-6">{t('subtitlePlaceholder')}</p>
            <Tabs defaultValue="check-in" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="check-in">{t('tabs.checkin')}</TabsTrigger>
                    <TabsTrigger value="dashboard">{t('tabs.dashboard')}</TabsTrigger>
                    <TabsTrigger value="attendees">{t('tabs.attendees')}</TabsTrigger>
                    <TabsTrigger value="promotions">{t('tabs.promotions')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="check-in">
                    <CheckInTab />
                </TabsContent>
                <TabsContent value="dashboard">
                    <Card><CardHeader><CardTitle>Dashboard</CardTitle></CardHeader><CardContent><p>Event dashboard will be here.</p></CardContent></Card>
                </TabsContent>
                <TabsContent value="attendees">
                    <Card><CardHeader><CardTitle>Attendees</CardTitle></CardHeader><CardContent><p>Attendee management will be here.</p></CardContent></Card>
                </TabsContent>
                <TabsContent value="promotions">
                    <div className="space-y-6">
                       <CouponCreationForm onCouponCreated={fetchCoupons} />
                       <ExistingCouponsList coupons={coupons} isLoading={isLoadingCoupons} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
