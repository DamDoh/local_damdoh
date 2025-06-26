
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Users, PlusCircle, Pin, PinOff, Tag, Filter, Search, Frown } from "lucide-react";
import type { AgriEvent, AgriEventType } from "@/lib/types";
import { AGRI_EVENT_FILTER_OPTIONS, type AgriEventTypeConstant } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect, useMemo as useMemoHook } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";

const getEventTypeIcon = (eventType: AgriEventType) => {
  const iconProps = { className: "h-4 w-4 mr-1.5 text-primary" };
  switch (eventType) {
    case 'Conference': return <Users {...iconProps} />;
    case 'Webinar': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconProps.className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>; // Laptop icon
    case 'Workshop': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconProps.className}><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>; // Edit3 icon
    case 'Trade Show': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconProps.className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>; // Package icon
    case 'Field Day': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconProps.className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><line x1="12" y1="17" x2="12" y2="10"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>; // Tractor or similar - using a placeholder
    case 'Networking Event': return <Users {...iconProps} />; // Users icon
    default: return <CalendarDays {...iconProps} />;
  }
};

const EventCardSkeleton = () => (
    <Card className="flex flex-col overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="flex-grow space-y-2 text-sm">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);


export default function AgriEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<AgriEventTypeConstant | 'All'>("All");
  const [events, setEvents] = useState<AgriEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const functions = getFunctions(firebaseApp);
  const getAgriEventsCallable = useMemoHook(() => httpsCallable(functions, 'getAgriEvents'), [functions]);

  const pathname = usePathname();
  const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const result = await getAgriEventsCallable();
            const fetchedEvents = result.data as AgriEvent[];
            // Ensure dates are parsed correctly
            const formattedEvents = fetchedEvents.map(e => ({...e, eventDate: new Date(e.eventDate).toISOString()}));
            setEvents(formattedEvents);
        } catch(error) {
            console.error("Failed to fetch events:", error);
            toast({
                title: "Error loading events",
                description: "Could not fetch the list of events. Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchEvents();
  }, [getAgriEventsCallable, toast]);


  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = event.title.toLowerCase().includes(searchLower);
      const descriptionMatch = event.description.toLowerCase().includes(searchLower);
      const locationMatch = event.location.toLowerCase().includes(searchLower);
      const typeMatch = eventTypeFilter === 'All' || event.eventType === eventTypeFilter;
      
      return (titleMatch || descriptionMatch || locationMatch) && typeMatch;
    });
  }, [searchTerm, eventTypeFilter, events]);

  const isCurrentHomepage = homepagePreference === pathname;

  const handleSetHomepage = () => {
    if (isCurrentHomepage) {
      clearHomepagePreference();
      toast({
        title: "Homepage Unpinned!",
        description: "The Dashboard is now your default homepage.",
      });
    } else {
      setHomepagePreference(pathname);
      toast({
        title: "Agri-Events Pinned!",
        description: "Agri-Business Events are now your default homepage.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-7 w-7 text-primary" />
                <CardTitle className="text-2xl">Agri-Business Events</CardTitle>
              </div>
              <CardDescription>Discover conferences, workshops, webinars, and trade shows in the agricultural sector.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild>
                <Link href="/agri-events/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSetHomepage}>
                {isCurrentHomepage ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                {isCurrentHomepage ? "Unpin Homepage" : "Pin as Homepage"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="relative lg:col-span-2">
              <Label htmlFor="search-events" className="sr-only">Search Events</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-events"
                placeholder="Search events by title, description, or location..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={eventTypeFilter} onValueChange={(value) => setEventTypeFilter(value as AgriEventTypeConstant | 'All')}>
              <SelectTrigger id="event-type-filter">
                <SelectValue placeholder="Filter by event type" />
              </SelectTrigger>
              <SelectContent>
                {AGRI_EVENT_FILTER_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  {event.imageUrl && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{objectFit: 'cover'}}
                        data-ai-hint={event.dataAiHint || "event agriculture"}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                        {getEventTypeIcon(event.eventType)}
                        <Badge variant="secondary">{event.eventType}</Badge>
                    </div>
                    <Link href={event.websiteLink || '#'} target="_blank" rel="noopener noreferrer" className="block">
                        <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2">{event.title}</CardTitle>
                    </Link>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2 text-sm">
                    <p className="text-muted-foreground line-clamp-3 h-16">{event.description}</p>
                    <div className="flex items-center text-muted-foreground">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {new Date(event.eventDate).toLocaleDateString()} {event.eventTime && `at ${event.eventTime}`}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    {event.organizer && (
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        Organized by: {event.organizer}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full" variant="outline">
                      <Link href={event.websiteLink || '#'} target="_blank" rel="noopener noreferrer">
                        Visit Event Page
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
              <Frown className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Events Found</h3>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your search or filters. Or, be the first to <Link href="/agri-events/create" className="text-primary hover:underline">add an event</Link>!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
