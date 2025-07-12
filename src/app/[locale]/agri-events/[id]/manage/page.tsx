"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Share2, PlusCircle, Loader2, CalendarIcon, ClipboardCopy, QrCode, ScanLine, UserCheck, XCircle, AlertCircle, Info, Users, UserPlus, Trash2, Search, Download, ArrowLeft } from "lucide-react";
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
import { getCreateMarketplaceCouponSchema, type CreateMarketplaceCouponValues } from "@/lib/form-schemas";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AgriEvent, UserProfile } from "@/lib/types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import dynamic from 'next/dynamic';
import Link from 'next/link';

const QrScanner = dynamic(() => import('@/components/QrScanner').then(mod => mod.QrScanner), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin"/></div>
});

interface EventCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue?: number;
  expiresAt?: string | null;
  usageCount: number;
  usageLimit?: number | null;
}
interface EventStaffMember {
  id: string;
  displayName?: string;
  avatarUrl?: string;
}
interface EventAttendee {
    id: string;
    displayName: string;
    email: string;
    registeredAt: string;
    checkedIn: boolean;
    checkedInAt?: string;
}

// --- Promotions Tab Components ---

const CouponCreationForm = ({ onCouponCreated }: { onCouponCreated: () => void }) => {
    const t = useTranslations('AgriEvents.manage.promotions');
    const tFormErrors = useTranslations('formErrors.createMarketplaceCoupon');
    const { toast } = useToast();
    const params = useParams();
    const eventId = params.id as string;
    const createCouponCallable = useMemo(() => httpsCallable(functions, 'createEventCoupon'), []);
    
    const createMarketplaceCouponSchema = getCreateMarketplaceCouponSchema(tFormErrors);

    const form = useForm<CreateMarketplaceCouponValues>({
        resolver: zodResolver(createMarketplaceCouponSchema),
        defaultValues: {
            code: "",
            discountType: "percentage",
            usageLimit: 100,
        },
    });

    async function onSubmit(values: CreateMarketplaceCouponValues) {
        try {
            await createCouponCallable({
                ...values,
                eventId,
                expiryDate: values.expiryDate?.toISOString()
            });
            toast({ title: t('create.toast.successTitle'), description: t('create.toast.successDescription', { code: values.code }) });
            onCouponCreated();
            form.reset();
        } catch (error: any) {
            console.error("Error creating coupon:", error);
            toast({ variant: "destructive", title: t('create.toast.failTitle'), description: error.message });
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
                             <FormField control={form.control} name="usageLimit" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.usageLimit')}</FormLabel> <FormControl> <Input type="number" placeholder={t('create.form.usageLimitPlaceholder')} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /> </FormControl> <FormMessage /> </FormItem> )} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                             <FormField control={form.control} name="discountType" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.discountType')}</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder={t('create.form.discountTypePlaceholder')} /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="percentage">{t('create.form.percentage')}</SelectItem> <SelectItem value="fixed">{t('create.form.fixed')}</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="discountValue" render={({ field }) => ( <FormItem> <FormLabel>{t('create.form.discountValue')}</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 10 or 5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /> </FormControl> <FormMessage /> </FormItem> )} />
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
    const t = useTranslations('AgriEvents.manage.promotions');
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
                {Array.isArray(coupons) && coupons.length > 0 ? ( coupons.map((coupon) => ( <Card key={coupon.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4"> <div className="mb-4 md:mb-0"> <div className="flex items-center gap-2"> <Ticket className="h-5 w-5 text-primary"/> <p className="text-lg font-bold">{coupon.code}</p> </div> <p className="text-sm text-muted-foreground"> {coupon.discountType === 'fixed' ? `$${coupon.discountValue?.toFixed(2) ?? '0.00'}` : `${coupon.discountValue ?? 0}%`} off | {t('list.expires')}: {coupon.expiresAt ? format(new Date(coupon.expiresAt), "PPP") : 'Never'} </p> <p className="text-sm"> {t('list.usage')}: {coupon.usageCount} / {coupon.usageLimit || '∞'} </p> </div> <Dialog> <DialogTrigger asChild> <Button variant="outline" size="sm"> <Share2 className="mr-2 h-4 w-4" /> {t('list.share')} </Button> </DialogTrigger> <DialogContent> <DialogHeader> <DialogTitle>{t('list.shareModal.title')}</DialogTitle> <DialogDescription>{t('list.shareModal.description')}</DialogDescription> </DialogHeader> <div className="flex items-center space-x-2"> <div className="grid flex-1 gap-2"> <Label htmlFor="link" className="sr-only">Link</Label> <Input id="link" defaultValue={`${window.location.origin}/agri-events/${window.location.pathname.split('/agri-events/')[1].split('/')[0]}?coupon=${coupon.code}`} readOnly /> </div> <Button type="button" size="sm" className="px-3" onClick={() => handleShare(coupon.code)}> <span className="sr-only">{t('list.shareModal.copy')}</span> <ClipboardCopy className="h-4 w-4" /> </Button> </div> <DialogFooter> <DialogClose asChild><Button type="button" variant="secondary">{t('list.shareModal.close')}</Button></DialogClose> </DialogFooter> </DialogContent> </Dialog> </Card> )) ) : ( <p className="text-sm text-center text-muted-foreground pt-4">{t('list.noCoupons')}</p> )}
            </CardContent>
        </Card>
    );
};

// --- Check-in Tab Components ---

const CheckInTab = () => {
    const t = useTranslations('AgriEvents.manage.checkin');
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
            if (!decodedText.startsWith('damdoh:checkin')) {
                throw new Error(t('error.invalidCode'));
            }
            
            const urlParams = new URLSearchParams(decodedText.split('?')[1]);
            const scannedEventId = urlParams.get('eventId');
            const attendeeUid = urlParams.get('userId');

            if (scannedEventId !== eventId) {
                throw new Error(t('error.wrongEvent'));
            }

            if (!attendeeUid) {
                throw new Error(t('error.noUserId'));
            }
            
            const result = await checkInCallable({ eventId, attendeeUid });
            const data = (result?.data as { success: boolean, message: string }) || { success: false, message: t('error.unknown') };
            
            if (data.success) {
                setCheckInResult({ type: 'success', message: data.message });
                toast({ title: t('toast.success.title'), description: data.message });
            } else {
                 throw new Error(data.message || t('error.failUnknown'));
            }
        } catch (error: any) {
             const message = error.message;
            setCheckInResult({ type: 'error', message: message });
            toast({ variant: "destructive", title: t('toast.fail.title'), description: message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleScanFailure = (error: string) => {
        setIsScanning(false);
        toast({ variant: "destructive", title: t('toast.scanFail.title'), description: t('toast.scanFail.description') });
    };

    return (
        <>
        {isScanning && ( <QrScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} onClose={() => setIsScanning(false)} /> )}
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <Button size="lg" onClick={() => setIsScanning(true)} disabled={isProcessing}>
                    <ScanLine className="mr-2 h-6 w-6" />
                    {t('scanButton')}
                </Button>

                {isProcessing && <div className="flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> {t('verifying')}</div>}
                
                {checkInResult && (
                    <Alert variant={checkInResult.type === 'error' ? 'destructive' : 'default'} className="text-left">
                        {checkInResult.type === 'success' ? <UserCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertTitle>{checkInResult.type === 'success' ? t('success') : t('errorTitle')}</AlertTitle>
                        <AlertDescription>{checkInResult.message}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
        </>
    );
};

// --- Staff Management Tab ---

const StaffManagementTab = ({ eventId, organizerId }: { eventId: string, organizerId: string | undefined }) => {
    const t = useTranslations('AgriEvents.manage.staff');
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [currentStaff, setCurrentStaff] = useState<EventStaffMember[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);

    const searchUsersCallable = useMemo(() => httpsCallable(functions, 'searchUsersForStaffing'), []);
    const addStaffCallable = useMemo(() => httpsCallable(functions, 'addEventStaff'), []);
    const getStaffCallable = useMemo(() => httpsCallable(functions, 'getEventStaff'), []);
    const removeStaffCallable = useMemo(() => httpsCallable(functions, 'removeEventStaff'), []);
    
    const fetchStaff = useCallback(async () => {
        setIsLoadingStaff(true);
        try {
            const result = await getStaffCallable({ eventId });
            setCurrentStaff((result?.data as any)?.staff || []);
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.fetchStaffError') });
        } finally {
            setIsLoadingStaff(false);
        }
    }, [eventId, getStaffCallable, toast, t]);
    
    useEffect(() => {
        if (eventId) fetchStaff();
    }, [eventId, fetchStaff]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.length < 3) {
            toast({ title: t('toast.searchLengthError') });
            return;
        }
        setIsSearching(true);
        try {
            const result = await searchUsersCallable({ query: searchQuery });
            setSearchResults((result?.data as any)?.users || []);
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('toast.searchFailed'), description: error.message });
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleAddStaff = async (staffMember: UserProfile) => {
        try {
            await addStaffCallable({ 
                eventId, 
                staffUserId: staffMember.id,
                staffDisplayName: staffMember.displayName,
                staffAvatarUrl: staffMember.avatarUrl
            });
            toast({ title: t('toast.success'), description: t('toast.addSuccess', { name: staffMember.displayName })});
            fetchStaff(); // Refresh the list
            setSearchResults([]); // Clear search results
            setSearchQuery('');
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.addFailed'), description: error.message });
        }
    };
    
    const handleRemoveStaff = async (staffMember: EventStaffMember) => {
        try {
            await removeStaffCallable({ eventId, staffUserId: staffMember.id });
            toast({ title: t('toast.success'), description: t('toast.removeSuccess', { name: staffMember.displayName })});
            fetchStaff();
        } catch(error: any) {
             toast({ variant: 'destructive', title: t('toast.removeFailed'), description: error.message });
        }
    };

    return (
        <Card>
            <CardHeader><CardTitle>{t('title')}</CardTitle><CardDescription>{t('description')}</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-2">{t('addTitle')}</h3>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <Button type="submit" disabled={isSearching}>{isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}</Button>
                    </form>
                    <div className="mt-2 space-y-2">
                        {searchResults.map(res => (
                            <div key={res.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8"><AvatarImage src={res.avatarUrl} /><AvatarFallback>{res.displayName?.substring(0,1)}</AvatarFallback></Avatar>
                                    <div><p className="text-sm font-medium">{res.displayName}</p><p className="text-xs text-muted-foreground">{res.email}</p></div>
                                </div>
                                <Button size="sm" onClick={() => handleAddStaff(res)}><UserPlus className="h-4 w-4 mr-2"/>{t('addButton')}</Button>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium mb-2">{t('currentTitle')} ({currentStaff.length})</h3>
                    {isLoadingStaff ? <Skeleton className="h-24 w-full" /> : 
                     currentStaff.length > 0 ? (
                        <div className="space-y-2">
                             {currentStaff.map(staff => (
                                <div key={staff.id} className="flex items-center justify-between p-2 border rounded-md">
                                     <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8"><AvatarImage src={staff.avatarUrl} /><AvatarFallback>{staff.displayName?.substring(0,1)}</AvatarFallback></Avatar>
                                        <p className="text-sm font-medium">{staff.displayName}</p>
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => handleRemoveStaff(staff)}><Trash2 className="h-4 w-4 mr-2"/>{t('removeButton')}</Button>
                                </div>
                             ))}
                        </div>
                     ) : <p className="text-sm text-muted-foreground text-center py-4">{t('noStaff')}</p>
                    }
                </div>
            </CardContent>
        </Card>
    );
};

// --- Attendees Tab Component ---
const AttendeesTab = ({ eventId }: { eventId: string }) => {
    const t = useTranslations('AgriEvents.manage.attendees');
    const { toast } = useToast();
    const [attendees, setAttendees] = useState<EventAttendee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getAttendeesCallable = useMemo(() => httpsCallable(functions, 'getEventAttendees'), []);

    useEffect(() => {
        if (!eventId) return;
        const fetchAttendees = async () => {
            setIsLoading(true);
            try {
                const result = await getAttendeesCallable({ eventId });
                setAttendees((result.data as any)?.attendees || []);
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Error", description: t('error') });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendees();
    }, [eventId, getAttendeesCallable, toast, t]);

    const handleDownloadCsv = () => {
        if (attendees.length === 0) {
            toast({ title: t('toast.noAttendees') });
            return;
        }

        const headers = ["displayName", "email", "registeredAt", "checkedIn", "checkedInAt"];
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + attendees.map(e => headers.map(header => `"${e[header as keyof EventAttendee] || ''}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `event_attendees_${eventId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t('title')} ({attendees.length})</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </div>
                <Button onClick={handleDownloadCsv} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    {t('downloadCsv')}
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-40 w-full" /> : 
                attendees.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('nameHeader')}</TableHead>
                                <TableHead>{t('emailHeader')}</TableHead>
                                <TableHead>{t('registeredOnHeader')}</TableHead>
                                <TableHead>{t('statusHeader')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendees.map(attendee => (
                                <TableRow key={attendee.id}>
                                    <TableCell className="font-medium">{attendee.displayName}</TableCell>
                                    <TableCell>{attendee.email}</TableCell>
                                    <TableCell>{new Date(attendee.registeredAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={attendee.checkedIn ? 'default' : 'secondary'}>
                                            {attendee.checkedIn ? t('statusCheckedIn') : t('statusRegistered')}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-center text-muted-foreground py-8">{t('noAttendees')}</p>
                )}
            </CardContent>
        </Card>
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
    const [event, setEvent] = useState<AgriEvent | null>(null);

    const getEventCouponsCallable = useMemo(() => httpsCallable(functions, 'getEventCoupons'), []);
    const getEventDetailsCallable = useMemo(() => httpsCallable(functions, 'getEventDetails'), [functions]);

    const fetchCoupons = useCallback(async () => {
        setIsLoadingCoupons(true);
        try {
            const result = await getEventCouponsCallable({ eventId });
            setCoupons((result?.data as any)?.coupons || []);
        } catch (error) {
            console.error("Error fetching event coupons:", error);
            toast({ variant: "destructive", title: t('toast.errorCoupons.title'), description: t('toast.errorCoupons.description') });
        } finally {
            setIsLoadingCoupons(false);
        }
    }, [eventId, getEventCouponsCallable, toast, t]);

    useEffect(() => { 
        if(eventId) { 
            fetchCoupons();
            getEventDetailsCallable({ eventId }).then(result => setEvent((result?.data as AgriEvent) || null)).catch(console.error);
        }
    }, [eventId, fetchCoupons, getEventDetailsCallable]);

    return (
        <div className="container mx-auto p-4 md:p-8">
             <Button asChild variant="outline" className="mb-4">
                <Link href={`/agri-events/${eventId}`}><ArrowLeft className="mr-2 h-4 w-4" />{t('backLink')}</Link>
            </Button>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground mb-6">{event?.title || 'Loading event...'}</p>
            <Tabs defaultValue="check-in" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="check-in">{t('tabs.checkin')}</TabsTrigger>
                    <TabsTrigger value="staff">{t('tabs.staff')}</TabsTrigger>
                    <TabsTrigger value="attendees">{t('tabs.attendees')}</TabsTrigger>
                    <TabsTrigger value="promotions">{t('tabs.promotions')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="check-in" className="mt-4">
                    <CheckInTab />
                </TabsContent>
                 <TabsContent value="staff" className="mt-4">
                    <StaffManagementTab eventId={eventId} organizerId={event?.organizerId} />
                </TabsContent>
                <TabsContent value="attendees" className="mt-4">
                   <AttendeesTab eventId={eventId} />
                </TabsContent>
                <TabsContent value="promotions" className="mt-4">
                    <div className="space-y-6">
                       <CouponCreationForm onCouponCreated={fetchCoupons} />
                       <ExistingCouponsList coupons={coupons} isLoading={isLoadingCoupons} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
