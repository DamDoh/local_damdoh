
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { ArrowLeft, Users, UserCheck, CheckCircle, Search, Ticket, Loader2, Star, Percent, CalendarIcon, Hash, Copy, Share2, ClipboardCopy, Edit } from 'lucide-react';
import type { AgriEvent, EventAttendee, EventCoupon } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createEventCouponSchema, type CreateEventCouponValues } from "@/lib/form-schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';


interface AgriEventWithAttendees extends AgriEvent {
  isRegistered?: boolean;
  attendees: EventAttendee[];
}

function PromotionsTab({ eventId, eventTitle }: { eventId: string; eventTitle: string; }) {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<EventCoupon[]>([]);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
    const functions = getFunctions(firebaseApp);
    const createCouponCallable = useMemo(() => httpsCallable(functions, 'createEventCoupon'), [functions]);
    const getCouponsCallable = useMemo(() => httpsCallable(functions, 'getEventCoupons'), [functions]);

    const form = useForm<CreateEventCouponValues>({
        resolver: zodResolver(createEventCouponSchema),
        defaultValues: {
            code: "",
            discountType: undefined,
            discountValue: undefined,
            expiresAt: undefined,
            usageLimit: undefined,
        },
    });
    
    const fetchCoupons = useCallback(async () => {
        setIsLoadingCoupons(true);
        try {
            const result = await getCouponsCallable({ eventId });
            setCoupons((result.data as any).coupons || []);
        } catch (error) {
            toast({ variant: "destructive", title: t('agriEvents.manage.promoTab.errorFetchCouponsTitle'), description: t('agriEvents.manage.promoTab.errorFetchCouponsDescription') });
        } finally {
            setIsLoadingCoupons(false);
        }
    }, [eventId, getCouponsCallable, toast, t]);
    
    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    async function onCouponSubmit(data: CreateEventCouponValues) {
        try {
            await createCouponCallable({ eventId, ...data, expiresAt: data.expiresAt?.toISOString() });
            toast({ title: t('agriEvents.manage.promoTab.createSuccessTitle'), description: t('agriEvents.manage.promoTab.createSuccessDescription', { code: data.code }) });
            form.reset();
            fetchCoupons();
        } catch (error: any) {
            console.error("Error creating coupon:", error);
            toast({ variant: "destructive", title: t('agriEvents.manage.promoTab.createFailTitle'), description: error.message || t('agriEvents.manage.promoTab.createFailDescription') });
        }
    }

    const handleShare = (coupon: EventCoupon) => {
        const url = `${window.location.origin}/agri-events/${eventId}?coupon=${coupon.code}`;
        navigator.clipboard.writeText(url);
        toast({ title: t('agriEvents.manage.promoTab.linkCopiedTitle'), description: t('agriEvents.manage.promoTab.linkCopiedDescription') });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('agriEvents.manage.promoTab.title')}</CardTitle>
                <CardDescription>{t('agriEvents.manage.promoTab.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">{t('agriEvents.manage.promoTab.createTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <Form {...form}>
                            <form onSubmit={form.handleSubmit(onCouponSubmit)} className="space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('agriEvents.manage.promoTab.form.codeLabel')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('agriEvents.manage.promoTab.form.codePlaceholder')} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="discountType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('agriEvents.manage.promoTab.form.typeLabel')}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder={t('agriEvents.manage.promoTab.form.typePlaceholder')} /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="percentage">{t('agriEvents.manage.promoTab.form.typePercentage')}</SelectItem>
                                                        <SelectItem value="fixed">{t('agriEvents.manage.promoTab.form.typeFixed')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="discountValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('agriEvents.manage.promoTab.form.valueLabel')}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 10 or 15.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="usageLimit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('agriEvents.manage.promoTab.form.usageLimitLabel')}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                               </div>
                                <FormField
                                    control={form.control}
                                    name="expiresAt"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>{t('agriEvents.manage.promoTab.form.expirationLabel')}</FormLabel>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <FormControl>
                                              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>{t('agriEvents.manage.promoTab.form.datePlaceholder')}</span>}
                                              </Button>
                                            </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                                          </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    {t('agriEvents.manage.promoTab.form.createButton')}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div>
                    <h3 className="text-lg font-semibold mb-2">{t('agriEvents.manage.promoTab.existingTitle')}</h3>
                    {isLoadingCoupons ? <Skeleton className="h-20 w-full" /> : 
                     coupons.length > 0 ? (
                        <div className="space-y-2">
                            {coupons.map(coupon => (
                                <div key={coupon.id} className="flex flex-wrap justify-between items-center gap-2 p-3 border rounded-lg">
                                    <div className="font-mono text-primary bg-primary/10 px-2 py-1 rounded-md text-sm">{coupon.code}</div>
                                    <div className="text-sm">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue.toFixed(2)} off`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {t('agriEvents.manage.promoTab.usedLabel')}: {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{t('agriEvents.manage.promoTab.expiresLabel')}: {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'PPP') : 'Never'}</div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> {t('agriEvents.manage.promoTab.shareButton')}</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{t('agriEvents.manage.promoTab.shareModalTitle')}</DialogTitle>
                                                <DialogDescription>{t('agriEvents.manage.promoTab.shareModalDescription')}</DialogDescription>
                                            </DialogHeader>
                                            <div className="flex items-center space-x-2">
                                                <div className="grid flex-1 gap-2">
                                                    <Label htmlFor="link" className="sr-only">Link</Label>
                                                    <Input id="link" defaultValue={`${window.location.origin}/agri-events/${eventId}?coupon=${coupon.code}`} readOnly />
                                                </div>
                                                <Button type="button" size="sm" className="px-3" onClick={() => handleShare(coupon)}>
                                                    <span className="sr-only">{t('agriEvents.detail.copyButton')}</span>
                                                    <ClipboardCopy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button type="button" variant="secondary">{t('agriEvents.detail.closeButton')}</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            ))}
                        </div>
                     ) : <p className="text-sm text-muted-foreground text-center py-4">{t('agriEvents.manage.promoTab.noCoupons')}</p>
                    }
                </div>
            </CardContent>
        </Card>
    );
}

function ManageEventSkeleton() {
    const { t } = useTranslation('common');
    return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-48" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function ManageEventPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<AgriEventWithAttendees | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const functions = getFunctions(firebaseApp);
  const getEventDetails = useMemo(() => httpsCallable(functions, 'getEventDetails'), [functions]);
  const checkInAttendeeCallable = useMemo(() => httpsCallable(functions, 'checkInAttendee'), [functions]);

  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getEventDetails({ eventId, includeAttendees: true });
      const eventData = result.data as AgriEventWithAttendees;

      if (eventData.organizerId !== user?.uid) {
          toast({ variant: "destructive", title: t('agriEvents.manage.unauthorizedTitle'), description: t('agriEvents.manage.unauthorizedDescription') });
          router.push(`/agri-events/${eventId}`);
          return;
      }

      setEvent(eventData);
      setAttendees(eventData.attendees || []);
    } catch (error) {
      console.error("Error fetching event details for management:", error);
      toast({ variant: "destructive", title: t('agriEvents.manage.errorLoadingTitle'), description: t('agriEvents.manage.errorLoadingDescription') });
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, getEventDetails, toast, user, router, t]);
  
  useEffect(() => {
    if (!eventId || !user) return;
    fetchEvent();
  }, [eventId, user, fetchEvent]);
  
  const handleCheckIn = async (attendeeId: string) => {
    try {
        await checkInAttendeeCallable({ eventId, attendeeId });
        setAttendees(prev => prev.map(att => att.id === attendeeId ? {...att, checkedIn: true, checkedInAt: new Date().toISOString()} : att));
        toast({ title: t('agriEvents.manage.checkInSuccessTitle'), description: t('agriEvents.manage.checkInSuccessDescription') });
    } catch (error: any) {
        toast({ variant: "destructive", title: t('agriEvents.manage.checkInFailTitle'), description: error.message || t('agriEvents.manage.checkInFailDescription')});
    }
  };

  const filteredAttendees = useMemo(() => {
      if (!searchTerm) return attendees;
      const lowercasedFilter = searchTerm.toLowerCase();
      return attendees.filter(attendee => 
          attendee.displayName.toLowerCase().includes(lowercasedFilter) ||
          attendee.email.toLowerCase().includes(lowercasedFilter)
      );
  }, [attendees, searchTerm]);

  if (isLoading) {
    return <ManageEventSkeleton />;
  }

  if (!event) {
    return (
        <Card>
            <CardHeader><CardTitle>{t('agriEvents.manage.notFoundTitle')}</CardTitle></CardHeader>
            <CardContent><Button asChild variant="outline"><Link href="/agri-events">{t('agriEvents.detail.backToEventsButton')}</Link></Button></CardContent>
        </Card>
    );
  }

  const checkedInCount = attendees.filter(a => a.checkedIn).length;
  
  const handleShareEvent = () => {
    navigator.clipboard.writeText(`${window.location.origin}/agri-events/${eventId}`);
    toast({ title: t('agriEvents.detail.linkCopiedTitle'), description: t('agriEvents.detail.linkCopiedDescription') });
  };


  return (
    <div className="space-y-6">
      <Link href={`/agri-events/${eventId}`} className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('agriEvents.manage.backLink')}
      </Link>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <CardTitle className="text-2xl mb-2 sm:mb-0">{t('agriEvents.manage.title', { title: event.title })}</CardTitle>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4"/> {t('agriEvents.manage.shareButton')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('agriEvents.manage.shareModalTitle')}</DialogTitle>
                            <DialogDescription>{t('agriEvents.manage.shareModalDescription')}</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="event-link" className="sr-only">Link</Label>
                                <Input id="event-link" defaultValue={`${window.location.origin}/agri-events/${eventId}`} readOnly />
                            </div>
                            <Button type="button" size="sm" className="px-3" onClick={handleShareEvent}>
                                <span className="sr-only">{t('agriEvents.detail.copyButton')}</span>
                                <ClipboardCopy className="h-4 w-4" />
                            </Button>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">{t('agriEvents.detail.closeButton')}</Button></DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <CardDescription>{t('agriEvents.manage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="attendees" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="attendees">{t('agriEvents.manage.attendeesTabTitle', { count: attendees.length })}</TabsTrigger>
                    <TabsTrigger value="promotions">{t('agriEvents.manage.promotionsTabTitle')}</TabsTrigger>
                </TabsList>

                <TabsContent value="attendees" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('agriEvents.manage.totalRegistered')}</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{attendees.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('agriEvents.manage.checkedIn')}</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{checkedInCount}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('agriEvents.manage.remainingCapacity')}</CardTitle>
                                <Ticket className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{event.attendeeLimit ? (event.attendeeLimit - attendees.length) : t('agriEvents.detail.unlimited')}</div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder={t('agriEvents.manage.searchPlaceholder')}
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('agriEvents.manage.table.attendee')}</TableHead>
                                <TableHead>{t('agriEvents.manage.table.email')}</TableHead>
                                <TableHead>{t('agriEvents.manage.table.registeredAt')}</TableHead>
                                <TableHead>{t('agriEvents.manage.table.status')}</TableHead>
                                <TableHead className="text-right">{t('agriEvents.manage.table.action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttendees.map(attendee => (
                                <TableRow key={attendee.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={attendee.avatarUrl} alt={attendee.displayName} />
                                                <AvatarFallback>{attendee.displayName.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            {attendee.displayName}
                                        </div>
                                    </TableCell>
                                    <TableCell>{attendee.email}</TableCell>
                                    <TableCell>{new Date(attendee.registeredAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {attendee.checkedIn ? (
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="mr-1 h-3 w-3"/> {t('agriEvents.manage.statusCheckedIn')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">{t('agriEvents.manage.statusRegistered')}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!attendee.checkedIn && (
                                            <Button size="sm" onClick={() => handleCheckIn(attendee.id)}>{t('agriEvents.manage.checkInButton')}</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {filteredAttendees.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">{t('agriEvents.manage.noAttendees')}</p>}
                </TabsContent>
                <TabsContent value="promotions" className="mt-4">
                    <PromotionsTab eventId={eventId} eventTitle={event.title} />
                </TabsContent>
             </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
