
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, notFound, useSearchParams } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import type { AgriEvent, UserProfile } from '@/lib/types';
import QRCode from 'qrcode.react';
import { useTranslations, useFormatter } from 'next-intl';
import { useRouter, Link } from '@/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import Image from "next/image";
import { ArrowLeft, UserCircle, ShoppingCart, DollarSign, MapPin, Share2, Edit, Calendar as CalendarIcon, Clock, Users, Link as LinkIcon, QrCode, Ticket, CheckCircle, AlertCircle, Loader2, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';


function EventPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-24 w-full" />
                    <div className="flex items-center gap-4 pt-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EventPageContent() {
    const t = useTranslations('AgriEvents.detailPage');
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    const { user } = useAuth();
    const { toast } = useToast();
    const format = useFormatter();
  
    const [event, setEvent] = useState<AgriEvent | null>(null);
    const [organizer, setOrganizer] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const getEventDetailsCallable = useMemo(() => httpsCallable(functions, 'getEventDetails'), [functions]);
    const registerForEventCallable = useMemo(() => httpsCallable(functions, 'registerForEvent'), [functions]);

    useEffect(() => {
        if (!eventId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const eventResult = await getEventDetailsCallable({ eventId });
                const eventData = eventResult.data as AgriEvent | null;
                if (!eventData) throw new Error(t('notFound'));
                setEvent(eventData);

                const organizerProfile = (await httpsCallable(functions, 'getProfileByIdFromDB')({ uid: eventData.organizerId })).data as UserProfile;
                setOrganizer(organizerProfile);

            } catch (err: any) {
                console.error("Error fetching event details:", err);
                setError(err.message || t('error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId, getEventDetailsCallable, t, functions]);
    
    const handleRegistration = async () => {
        if (!user || !event) return;
        setIsRegistering(true);
        try {
            await registerForEventCallable({ eventId: event.id });
            toast({
                title: t('toast.registrationSuccess.title'),
                description: t('toast.registrationSuccess.description'),
            });
            // Refetch event data to update registration status
            const updatedEventResult = await getEventDetailsCallable({ eventId });
            setEvent(updatedEventResult.data as AgriEvent);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('toast.registrationFail.title'),
                description: error.message
            });
        } finally {
            setIsRegistering(false);
        }
    };
    
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: t('toast.linkCopied') });
    };

    if (isLoading) return <EventPageSkeleton />;
    if (error) return <div className="text-center py-10"><p className="text-destructive">{error}</p><Button variant="outline" asChild className="mt-4"><Link href="/agri-events"><ArrowLeft className="mr-2 h-4 w-4" />{t('backLink')}</Link></Button></div>;
    if (!event) return notFound();

    const isOwner = user?.uid === event.organizerId;
    const isFull = event.attendeeLimit && event.registeredAttendeesCount >= event.attendeeLimit;
    const checkinQrCodeValue = `damdoh:checkin?eventId=${event.id}&userId=${user?.uid}`;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <Link href="/agri-events" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
            </Link>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start">
                <div className="w-full">
                    <Card className="overflow-hidden sticky top-24">
                        <div className="relative w-full aspect-[4/3] bg-muted">
                             <Image
                                src={event.imageUrl || 'https://placehold.co/600x450.png'}
                                alt={event.title}
                                fill={true}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                                priority
                                data-ai-hint={event.dataAiHint || "event agriculture"}
                            />
                        </div>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <Badge variant="secondary">{event.eventType}</Badge>
                        <h1 className="text-3xl font-bold mt-2">{event.title}</h1>
                    </div>
                    
                    <div className="text-sm space-y-2 text-muted-foreground">
                        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary"/><span>{format.dateTime(new Date(event.eventDate), { dateStyle: 'long' })}</span></div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/><span>{event.eventTime || t('timeTba')}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/><span>{event.location}</span></div>
                    </div>

                    <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
                    
                    {organizer && (
                        <Card>
                            <CardHeader className="p-3">
                                <CardTitle className="text-sm font-semibold">{t('organizerTitle')}</CardTitle>
                                <div className="flex items-center gap-3 pt-2">
                                <Avatar className="h-10 w-10">
                                        <AvatarImage src={organizer.avatarUrl} alt={organizer.displayName} data-ai-hint="organizer profile" />
                                        <AvatarFallback>{organizer.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{organizer.displayName}</p>
                                        <p className="text-xs text-muted-foreground">{organizer.primaryRole}</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('registration.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {event.registrationEnabled ? (
                         <>
                            <div className="flex justify-between items-center text-sm">
                                <span>{t('registration.price')}</span>
                                <span className="font-bold text-lg">{event.price ? format.number(event.price, {style: 'currency', currency: 'USD'}) : t('registration.free')}</span>
                            </div>
                             <div className="flex justify-between items-center text-sm">
                                <span>{t('registration.attendees')}</span>
                                <span className="font-bold">{event.registeredAttendeesCount} / {event.attendeeLimit || t('registration.unlimited')}</span>
                            </div>
                            {isOwner ? (
                                <div className="flex gap-2">
                                <Button asChild className="w-full"><Link href={`/agri-events/${event.id}/manage`}>{t('manageEventButton')}</Link></Button>
                                <Button variant="secondary" className="w-full">{t('viewAttendeesButton')}</Button>
                                </div>
                            ) : (event as any).isRegistered ? (
                                 <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full" variant="secondary"><QrCode className="mr-2 h-4 w-4"/> {t('viewTicketButton')}</Button>
                                    </DialogTrigger>
                                     <DialogContent className="sm:max-w-xs">
                                        <DialogHeader>
                                            <DialogTitle className="text-center">{t('ticketModal.title')}</DialogTitle>
                                            <DialogDescription className="text-center">{t('ticketModal.description', { eventName: event.title })}</DialogDescription>
                                        </DialogHeader>
                                        <div className="p-4 flex flex-col items-center justify-center gap-4">
                                            <div className="p-4 bg-white rounded-lg border shadow-md">
                                                <QRCode value={checkinQrCodeValue} size={200} />
                                            </div>
                                            <p className="text-sm text-center text-muted-foreground">{t('ticketModal.scan')}</p>
                                        </div>
                                    </DialogContent>
                                 </Dialog>
                            ) : isFull ? (
                                <Button disabled className="w-full">{t('registration.full')}</Button>
                            ) : (
                                <Button onClick={handleRegistration} disabled={isRegistering} className="w-full">
                                    {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    {t('registerButton')}
                                </Button>
                            )}
                         </>
                     ) : (
                        <p className="text-muted-foreground text-center">{t('registration.closed')}</p>
                     )}
                </CardContent>
                 <CardFooter className="pt-4 border-t">
                     <Button variant="outline" className="w-full" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" />{t('copyLinkButton')}</Button>
                </CardFooter>
            </Card>
        </div>
    );
}


export default function EventDetailPageWrapper() {
  return (
    <Suspense fallback={<EventPageSkeleton />}>
      <EventPageContent />
    </Suspense>
  );
}

