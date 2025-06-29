
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode.react';

import { functions, app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import type { AgriEvent, EventAttendee } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, Ticket, QrCode, CheckCircle, Loader2, Edit, Share2, ClipboardCopy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface AgriEventWithAttendees extends AgriEvent {
  isRegistered?: boolean;
  attendees?: EventAttendee[];
}

function EventDetailSkeleton() {
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
  const { t } = useTranslation('common');
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

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
        toast({ variant: "destructive", title: t('agriEvents.detail.errorLoadingTitle'), description: t('agriEvents.detail.errorLoadingDescription') });
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
            title: t('agriEvents.detail.couponAppliedTitle'),
            description: t('agriEvents.detail.couponAppliedDescription', { coupon: couponFromUrl })
        });
    }
  }, [searchParams, toast, t]);

  const handleRegistration = async () => {
    if (!user) {
        toast({ variant: "destructive", title: t('agriEvents.detail.signInRequiredTitle'), description: t('agriEvents.detail.signInRequiredDescription') });
        router.push('/auth/signin');
        return;
    }
    setIsRegistering(true);
    try {
        const result = await registerForEvent({ eventId, couponCode });
        const data = result.data as { success: boolean; message: string; finalPrice?: number; discountApplied?: number };

        setEvent(prev => prev ? { ...prev, isRegistered: true, registeredAttendeesCount: (prev.registeredAttendeesCount || 0) + 1 } : null);
        
        let toastDescription = t('agriEvents.detail.registrationSuccessDescription');
        if (data.discountApplied && data.discountApplied > 0) {
            toastDescription += ` ${t('agriEvents.detail.discountAppliedToast', { discount: data.discountApplied.toFixed(2), currency: event?.currency || 'USD', price: data.finalPrice?.toFixed(2) })}`;
        }

        toast({ title: t('agriEvents.detail.registrationSuccessTitle'), description: toastDescription});
    } catch (error: any) {
        console.error("Registration failed:", error);
        toast({ variant: "destructive", title: t('agriEvents.detail.registrationFailTitle'), description: error.message });
    } finally {
        setIsRegistering(false);
    }
  };
  
  const handleShareEvent = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: t('agriEvents.detail.linkCopiedTitle'), description: t('agriEvents.detail.linkCopiedDescription') });
  };
  
  const isOrganizer = user && event && user.uid === event.organizerId;

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">{t('agriEvents.detail.notFoundTitle')}</h2>
        <p className="text-muted-foreground">{t('agriEvents.detail.notFoundDescription')}</p>
        <Button asChild className="mt-4"><Link href="/agri-events">{t('agriEvents.detail.backToEventsButton')}</Link></Button>
      </div>
    );
  }
  
  const isEventFull = event.attendeeLimit ? (event.registeredAttendeesCount || 0) >= event.attendeeLimit : false;
  const qrCodeValue = `damdoh:checkin:eventId=${event.id}:userId=${user?.uid}`;

  const registrationButtonText = () => {
    if (isRegistering) return t('agriEvents.detail.registeringButton');
    if (event.price && event.price > 0) {
        return t('agriEvents.detail.registerAndPayButton', { currency: event.currency || 'USD', price: event.price.toFixed(2) });
    }
    return t('agriEvents.detail.registerFreeButton');
  };

  return (
    <div className="space-y-6">
       <Link href="/agri-events" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('agriEvents.detail.backLink')}
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
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                    <Badge variant="secondary" className="w-fit mb-2">{t(`agriEvents.types.${event.eventType}`, event.eventType)}</Badge>
                    <CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
                    {event.organizer && <CardDescription className="text-base">{t('agriEvents.organizedBy')}: {event.organizer}</CardDescription>}
                </div>
                 <div className="flex gap-2">
                    {isOrganizer && (
                        <Button asChild variant="secondary" size="sm">
                            <Link href={`/agri-events/${event.id}/manage`}>
                                <Edit className="mr-2 h-4 w-4" /> {t('agriEvents.detail.manageButton')}
                            </Link>
                        </Button>
                    )}
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4"/>{t('agriEvents.detail.shareButton')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('agriEvents.detail.shareModalTitle')}</DialogTitle>
                                <DialogDescription>{t('agriEvents.detail.shareModalDescription')}</DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="event-link" className="sr-only">Link</Label>
                                    <Input id="event-link" defaultValue={window.location.href} readOnly />
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
                            {event.registeredAttendeesCount || 0} / {event.attendeeLimit || t('agriEvents.detail.unlimited')} {t('agriEvents.detail.attendees')}
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
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        {t('agriEvents.detail.registeredButton')}
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle className="text-center">{t('agriEvents.detail.ticketTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-white rounded-lg">
                            <QRCode value={qrCodeValue} size={200} />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">{t('agriEvents.detail.ticketDescription')}</p>
                        <p className="text-xs text-center font-mono break-all">{qrCodeValue}</p>
                    </div>
                 </DialogContent>
               </Dialog>
            ) : isEventFull ? (
                <Button className="w-full md:w-auto" disabled>{t('agriEvents.detail.fullButton')}</Button>
            ) : (
                <div className="w-full">
                    {event.price && event.price > 0 && (
                        <div className="mb-4 space-y-2">
                            <Label htmlFor="coupon">{t('agriEvents.detail.couponLabel')}</Label>
                            <Input 
                                id="coupon" 
                                placeholder={t('agriEvents.detail.couponPlaceholder')}
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="max-w-xs"
                                disabled={isRegistering}
                            />
                             <p className="text-xs text-muted-foreground">{t('agriEvents.detail.couponNote')}</p>
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
                <a href={event.websiteLink} target="_blank" rel="noopener noreferrer">{t('agriEvents.detail.visitWebsiteButton')}</a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">{t('agriEvents.detail.noRegNote')}</p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
