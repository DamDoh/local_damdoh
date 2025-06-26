
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import QRCode from 'qrcode.react';

import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import type { AgriEvent, EventAttendee } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, Ticket, QrCode, CheckCircle, Loader2, Edit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<AgriEventWithAttendees | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

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
        toast({ variant: "destructive", title: "Error", description: "Could not load event details." });
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, getEventDetails, toast, user]); // Re-fetch if user changes

  const handleRegistration = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Please sign in", description: "You must be logged in to register for events." });
        router.push('/auth/signin');
        return;
    }
    setIsRegistering(true);
    try {
        // This is where a real payment gateway would be called if event.price > 0
        // Our backend function `registerForEvent` now conceptually handles this.
        await registerForEvent({ eventId });
        setEvent(prev => prev ? { ...prev, isRegistered: true, registeredAttendeesCount: (prev.registeredAttendeesCount || 0) + 1 } : null);
        toast({ title: "Registration Successful!", description: "You are now registered for this event."});
    } catch (error: any) {
        console.error("Registration failed:", error);
        toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
        setIsRegistering(false);
    }
  };
  
  const isOrganizer = user && event && user.uid === event.organizerId;

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-muted-foreground">The event you are looking for does not exist or may have been removed.</p>
        <Button asChild className="mt-4"><Link href="/agri-events">Back to Events</Link></Button>
      </div>
    );
  }
  
  const isEventFull = event.attendeeLimit ? (event.registeredAttendeesCount || 0) >= event.attendeeLimit : false;
  const qrCodeValue = `damdoh:checkin:eventId=${event.id}:userId=${user?.uid}`;

  const registrationButtonText = () => {
    if (isRegistering) return 'Registering...';
    if (event.price && event.price > 0) {
        return `Register & Pay ${event.currency || 'USD'} ${event.price.toFixed(2)}`;
    }
    return 'Register for Free';
  };

  return (
    <div className="space-y-6">
       <Link href="/agri-events" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> Back to All Events
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
                    {event.organizer && <CardDescription className="text-base">Organized by: {event.organizer}</CardDescription>}
                </div>
                {isOrganizer && (
                    <Button asChild variant="secondary" size="sm">
                        <Link href={`/agri-events/${event.id}/manage`}>
                            <Edit className="mr-2 h-4 w-4" /> Manage Event
                        </Link>
                    </Button>
                )}
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
                            {event.registeredAttendeesCount || 0} / {event.attendeeLimit || 'Unlimited'} Attendees
                        </span>
                    </div>
                )}
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
                <p>{event.description}</p>
            </div>
        </CardContent>
        <CardFooter>
          {event.registrationEnabled ? (
            event.isRegistered ? (
               <Dialog>
                 <DialogTrigger asChild>
                    <Button className="w-full md:w-auto" variant="secondary">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        You are Registered - View Ticket
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle className="text-center">Your Event Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-white rounded-lg">
                            <QRCode value={qrCodeValue} size={200} />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">Show this QR code at the event entrance for check-in.</p>
                        <p className="text-xs text-center font-mono break-all">{qrCodeValue}</p>
                    </div>
                 </DialogContent>
               </Dialog>
            ) : isEventFull ? (
                <Button className="w-full md:w-auto" disabled>Event Full</Button>
            ) : (
                <Button className="w-full md:w-auto" onClick={handleRegistration} disabled={isRegistering}>
                    {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Ticket className="mr-2 h-4 w-4"/>}
                    {registrationButtonText()}
                </Button>
            )
          ) : event.websiteLink ? (
             <Button asChild className="w-full md:w-auto">
                <a href={event.websiteLink} target="_blank" rel="noopener noreferrer">Visit Event Website</a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Registration for this event is not handled through DamDoh.</p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
