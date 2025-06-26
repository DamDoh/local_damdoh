
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { ArrowLeft, Users, UserCheck, CheckCircle, Search, Ticket } from 'lucide-react';
import type { AgriEvent, EventAttendee } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';


interface AgriEventWithAttendees extends AgriEvent {
  isRegistered?: boolean;
  attendees: EventAttendee[];
}

function ManageEventSkeleton() {
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
  const checkInAttendee = useMemo(() => httpsCallable(functions, 'checkInAttendee'), [functions]);

  useEffect(() => {
    if (!eventId || !user) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const result = await getEventDetails({ eventId, includeAttendees: true });
        const eventData = result.data as AgriEventWithAttendees;

        if (eventData.organizerId !== user.uid) {
            toast({ variant: "destructive", title: "Unauthorized", description: "You are not the organizer of this event." });
            router.push(`/agri-events/${eventId}`);
            return;
        }

        setEvent(eventData);
        setAttendees(eventData.attendees || []);
      } catch (error) {
        console.error("Error fetching event details for management:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load event management data." });
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, getEventDetails, toast, user, router]);
  
  const handleCheckIn = async (attendeeId: string) => {
    try {
        await checkInAttendee({ eventId, attendeeId });
        setAttendees(prev => prev.map(att => att.id === attendeeId ? {...att, checkedIn: true, checkedInAt: new Date().toISOString()} : att));
        toast({ title: "Check-in Successful", description: "Attendee has been checked in." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Check-in Failed", description: error.message || "Could not check in attendee."});
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
            <CardHeader><CardTitle>Event not found.</CardTitle></CardHeader>
            <CardContent><Button asChild variant="outline"><Link href="/agri-events">Back to Events</Link></Button></CardContent>
        </Card>
    );
  }

  const checkedInCount = attendees.filter(a => a.checkedIn).length;

  return (
    <div className="space-y-6">
      <Link href={`/agri-events/${eventId}`} className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> Back to Event Page
      </Link>

      <Card>
        <CardHeader>
            <CardTitle className="text-2xl">Manage Event: {event.title}</CardTitle>
            <CardDescription>Oversee registrations and manage attendee check-ins.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendees.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Checked In</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{checkedInCount}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining Capacity</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{event.attendeeLimit ? (event.attendeeLimit - attendees.length) : 'Unlimited'}</div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search attendees by name or email..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registered At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
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
                                        <CheckCircle className="mr-1 h-3 w-3"/> Checked In
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Registered</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {!attendee.checkedIn && (
                                    <Button size="sm" onClick={() => handleCheckIn(attendee.id)}>Check In</Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {filteredAttendees.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">No attendees found.</p>}

        </CardContent>
      </Card>
    </div>
  );
}
