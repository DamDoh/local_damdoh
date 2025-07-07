
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode.react';
import { useTranslations } from 'next-intl';

import { functions, app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import type { AgriEvent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, Ticket, QrCode, CheckCircle, Loader2, Edit, Share2, ClipboardCopy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AgriEventWithAttendees extends AgriEvent {
  isRegistered?: boolean;
}

function EventDetailSkeleton() {
  const t = useTranslations('AgriEvents.detail');
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card className="max-w-4xl mx-auto overflow-hidden">
        <Skeleton className="w-full aspect-video" />
        <CardHeader className="space-y-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-12 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AgriEventDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('AgriEvents.detail');

  const [event, setEvent] = useState<AgriEventWithAttendees | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const functions = getFunctions(firebaseApp);
  const getEventDetails = useMemo(() => httpsCallable(functions, 'getEventDetails'), [functions]);
  const registerForEvent = useMemo(() => httpsCallable(functions, 'registerForEvent'), [functions]);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const result = await getEventDetails({ eventId });
        setEvent(result.data as AgriEventWithAttendees);
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast({ variant: "destructive", title: t('errors.loadTitle'), description: t('errors.loadDescription') });
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, getEventDetails, toast, user, t]);

  useEffect(() => {
    const couponFromUrl = searchParams.get('coupon');
    if (couponFromUrl) {
        setCouponCode(couponFromUrl);
        toast({
            title: t('coupon.toastTitle'),
            description: t('coupon.toastDescription', { couponCode: couponFromUrl })
        });
    }
  }, [searchParams, toast, t]);

  const handleRegistration = async () => {
    if (!user) {
        toast({ variant: "destructive", title: t('errors.signInTitle'), description: t('errors.signInDescription') });
        router.push('/auth/signin');
        return;
    }
    setIsRegistering(true);
    try {
        const result = await registerForEvent({ eventId, couponCode });
        const data = result.data as { success: boolean; message: string; finalPrice?: number; discountApplied?: number };

        setEvent(prev => prev ? { ...prev, isRegistered: true, registeredAttendeesCount: (prev.registeredAttendeesCount || 0) + 1 } : null);
        
        let toastDescription = t('registration.successDescription');
        if (data.discountApplied && data.discountApplied > 0) {
            toastDescription += ` ${t('registration.discountApplied', {
                amount: data.discountApplied.toFixed(2),
                currency: event?.currency || 'USD'
            })} ${t('registration.finalPrice', {
                price: data.finalPrice?.toFixed(2),
                currency: event?.currency || 'USD'
            })}`;
        }

        toast({ title: t('registration.successTitle'), description: toastDescription});
    } catch (error: any) {
        console.error("Registration failed:", error);
        toast({ variant: "destructive", title: t('registration.failTitle'), description: error.message });
    } finally {
        setIsRegistering(false);
    }
  };
  
  const handleShareEvent = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: t('share.toastTitle'), description: t('share.toastDescription') });
  };
  
  const isOrganizer = user && event && user.uid === event.organizerId;

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">{t('notFound.title')}</h2>
        <p className="text-muted-foreground">{t('notFound.description')}</p>
        <Button asChild className="mt-4"><Link href="/agri-events">{t('notFound.backButton')}</Link></Button>
      </div>
    );
  }
  
  const isEventFull = event.attendeeLimit ? (event.registeredAttendeesCount || 0) >= event.attendeeLimit : false;
  const qrCodeValue = `damdoh:checkin?eventId=${event.id}&userId=${user?.uid}`;

  const registrationButtonText = () => {
    if (isRegistering) return t('buttons.registering');
    if (event.price && event.price > 0) {
        return t('buttons.registerAndPay', { price: event.price.toFixed(2), currency: event.currency || 'USD' });
    }
    return t('buttons.registerFree');
  };

  return (
    <div className="space-y-6">
       <Link href="/agri-events" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
      </Link>

      <Card className="max-w-4xl mx-auto overflow-hidden">
        {event.imageUrl && (
            <div className="relative w-full aspect-video bg-muted">
                <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill={true}
                    sizes="(max-width: 1024px) 100vw, 896px"
                    style={{ objectFit: 'cover' }}
                    priority
                    data-ai-hint={event.dataAiHint || "agriculture event"}
                />
            </div>
        )}
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant="secondary" className="w-fit mb-2">{event.eventType}</Badge>
                    <CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
                    {event.organizer && <CardDescription className="text-base">{t('organizedBy', { organizer: event.organizer })}</CardDescription>}
                </div>
                 <div className="flex gap-2">
                    {isOrganizer && (
                        <Button asChild variant="secondary" size="sm">
                            <Link href={`/agri-events/${event.id}/manage`}>
                                <Edit className="mr-2 h-4 w-4" /> {t('buttons.manage')}
                            </Link>
                        </Button>
                    )}
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4"/>{t('buttons.share')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('share.title')}</DialogTitle>
                                <DialogDescription>
                                    {t('share.description')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="event-link" className="sr-only">{t('share.link')}</Label>
                                    <Input id="event-link" defaultValue={window.location.href} readOnly />
                                </div>
                                <Button type="button" size="sm" className="px-3" onClick={handleShareEvent}>
                                    <span className="sr-only">{t('share.copy')}</span>
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">{t('buttons.close')}</Button></DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary"/>
                    <span>{new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {event.eventTime && (
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary"/>
                        <span>{event.eventTime}</span>
                    </div>
                )}
                 <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary"/>
                    <span>{event.location}</span>
                </div>
                {event.registrationEnabled && (
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary"/>
                        <span>
                            {t('attendees', { count: event.registeredAttendeesCount || 0, limit: event.attendeeLimit || t('unlimited') })}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
                <p>{event.description}</p>
            </div>
        </CardContent>
        <CardFooter className="flex-col items-start">
          {event.registrationEnabled ? (
            event.isRegistered ? (
               <Dialog>
                 <DialogTrigger asChild>
                    <Button className="w-full md:w-auto" variant="secondary">
                        <Ticket className="mr-2 h-4 w-4" />
                        {t('buttons.viewTicket')}
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle className="text-center">{t('ticket.title')}</DialogTitle>
                         <DialogDescription className="text-center">
                            {t('ticket.for', { eventTitle: event.title })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-white rounded-lg">
                            <QRCode value={qrCodeValue} size={200} />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">{t('ticket.scan')}</p>
                    </div>
                 </DialogContent>
               </Dialog>
            ) : isEventFull ? (
                <Button className="w-full md:w-auto" disabled>{t('buttons.full')}</Button>
            ) : (
                <div className="w-full">
                    {event.price && event.price > 0 && (
                        <div className="mb-4 space-y-2">
                            <Label htmlFor="coupon">{t('coupon.label')}</Label>
                            <Input 
                                id="coupon" 
                                placeholder={t('coupon.placeholder')}
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="max-w-xs"
                                disabled={isRegistering}
                            />
                             <p className="text-xs text-muted-foreground">{t('coupon.note')}</p>
                        </div>
                    )}
                    <Button className="w-full md:w-auto" onClick={handleRegistration} disabled={isRegistering}>
                        {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Ticket className="mr-2 h-4 w-4"/>}
                        {registrationButtonText()}
                    </Button>
                </div>
            )
          ) : event.websiteLink ? (
             <Button asChild className="w-full md:w-auto">
                <a href={event.websiteLink} target="_blank" rel="noopener noreferrer">{t('buttons.visitWebsite')}</a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">{t('registration.notAvailable')}</p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
    
