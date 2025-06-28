
"use client";

<<<<<<< HEAD
import { useEffect, useState, useMemo } from 'react';
=======
import React, { useEffect, useState, useMemo } from 'react';
>>>>>>> Market-Place-Traceability
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Sprout, Droplets, Eye, Weight, HardHat, Fingerprint, MapPin, Calendar, Clock, User, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import type { TraceabilityEvent } from '@/lib/types';

const functions = getFunctions(firebaseApp);

const getEventIcon = (eventType: string) => {
    const iconProps = { className: "h-6 w-6 text-primary" };
    switch (eventType) {
        case 'PLANTED': return <Sprout {...iconProps} />;
        case 'INPUT_APPLIED': return <Droplets {...iconProps} />;
        case 'OBSERVED': return <Eye {...iconProps} />;
        case 'HARVESTED': return <Weight {...iconProps} />;
        default: return <HardHat {...iconProps} />;
    }
};

function TraceabilityTimelineSkeleton() {
    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-8 space-y-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <Skeleton className="h-16 w-0.5" />
                        </div>
                        <div className="flex-1 space-y-2 pb-8">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

=======
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, GitBranch, Sprout, Eye, Droplets, Weight, HardHat, Package, CheckCircle, UserCircle, Clock, MapPin, AlertCircle, Info } from 'lucide-react';

// Define types for the data we expect from the backend
interface TraceabilityEvent {
  id: string;
  eventType: string;
  timestamp: string; // ISO string
  payload: any;
  actor: {
    name: string;
    role: string;
  };
  geoLocation?: { lat: number; lng: number } | null;
}

interface VtiData {
  id: string;
  type: string;
  metadata?: {
    cropType?: string;
    initialYieldKg?: number;
    initialQualityGrade?: string;
  };
  creationTime: string; // ISO string
}

interface TraceabilityData {
  vti: VtiData;
  events: TraceabilityEvent[];
}

const getEventIcon = (eventType: string) => {
    const iconProps = { className: "h-5 w-5" };
    switch (eventType) {
        case 'PLANTED': return <Sprout {...iconProps} />;
        case 'OBSERVED': return <Eye {...iconProps} />;
        case 'INPUT_APPLIED': return <Droplets {...iconProps} />;
        case 'HARVESTED': return <Weight {...iconProps} />;
        case 'PACKAGED': return <Package {...iconProps} />;
        case 'VERIFIED': return <CheckCircle {...iconProps} />;
        default: return <HardHat {...iconProps} />;
    }
};

const TraceabilitySkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Card>
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    </div>
);
>>>>>>> Market-Place-Traceability

export default function TraceabilityBatchDetailPage() {
  const params = useParams();
  const batchId = params.batchId as string;
<<<<<<< HEAD

  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEventsCallable = useMemo(() => httpsCallable(functions, 'getTraceabilityEventsForVti'), [functions]);

  useEffect(() => {
      if (!batchId) return;
      setIsLoading(true);
      setError(null);
      
      getEventsCallable({ vtiId: batchId })
          .then((result) => {
              const fetchedEvents = (result.data as any).events || [];
              setEvents(fetchedEvents);
          })
          .catch((err) => {
              console.error("Error fetching traceability events:", err);
              setError(err.message || "Could not find traceability data for this ID.");
          })
          .finally(() => {
              setIsLoading(false);
          });
  }, [batchId, getEventsCallable]);

  if (isLoading) {
    return <TraceabilityTimelineSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/traceability" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4"/> Back to Traceability Search
        </Link>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Fingerprint className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Traceability Report</CardTitle>
                        <CardDescription className="font-mono text-xs break-all">VTI: {batchId}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="text-center py-10 text-destructive">{error}</div>
                ) : events.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">No traceability events found for this ID.</div>
                ) : (
                    <div className="relative pl-4">
                         {/* Timeline vertical line */}
                        <div className="absolute left-10 top-0 h-full w-0.5 bg-border -z-10"></div>

                        {events.map((event, index) => (
                            <div key={event.id || index} className="relative flex items-start gap-6 pb-8">
                                <div className="absolute left-0 top-0 flex flex-col items-center">
                                    <div className="bg-background p-2 rounded-full border-2 border-primary shadow-sm z-10">
                                        {getEventIcon(event.eventType)}
                                    </div>
                                </div>

                                <div className="flex-1 pl-16">
                                    <h3 className="font-semibold text-lg">{event.eventType}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3"/><span>{new Date(event.timestamp._seconds * 1000).toLocaleDateString()}</span></div>
                                        <div className="flex items-center gap-1.5"><Clock className="h-3 w-3"/><span>{new Date(event.timestamp._seconds * 1000).toLocaleTimeString()}</span></div>
                                        {event.actorRef && <div className="flex items-center gap-1.5"><User className="h-3 w-3"/><span>By: {event.actorRef.substring(0,8)}...</span></div>}
                                    </div>

                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm space-y-2">
                                        <h4 className="font-semibold text-xs uppercase text-muted-foreground">Event Data</h4>
                                        <pre className="whitespace-pre-wrap break-words font-sans text-xs">{JSON.stringify(event.payload, null, 2)}</pre>
                                    </div>
                                    {event.payload?.mediaUrls?.[0] && (
                                        <div className="mt-2">
                                            <a href={event.payload.mediaUrls[0]} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline flex items-center gap-1.5">
                                                <ImageIcon className="h-4 w-4"/> View Attached Photo
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
=======
  
  const [data, setData] = useState<TraceabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions(firebaseApp);
  const getVtiHistoryCallable = useMemo(() => httpsCallable(functions, 'getVtiTraceabilityHistory'), [functions]);

  useEffect(() => {
    if (!batchId) {
        setError("Invalid Batch ID.");
        setIsLoading(false);
        return;
    };

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getVtiHistoryCallable({ vtiId: batchId });
        setData(result.data as TraceabilityData);
      } catch (err: any) {
        console.error("Error fetching traceability data:", err);
        setError(err.message || "Could not load traceability history for this batch.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [batchId, getVtiHistoryCallable]);


  if (isLoading) {
    return <TraceabilitySkeleton />;
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button asChild variant="secondary" className="mt-4">
                <Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Back to Marketplace</Link>
            </Button>
        </Alert>
    );
  }

  if (!data) {
     return (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>The traceability history for this batch could not be found.</AlertDescription>
        </Alert>
     );
  }

  const { vti, events } = data;

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/marketplace">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Traceability Report</CardTitle>
              <CardDescription>
                VTI Batch ID: <span className="font-mono bg-muted p-1 rounded-sm">{vti.id}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 border rounded-lg">
                    <p className="text-muted-foreground text-xs">Product</p>
                    <p className="font-semibold">{vti.metadata?.cropType || 'N/A'}</p>
                </div>
                <div className="p-3 border rounded-lg">
                    <p className="text-muted-foreground text-xs">Batch Type</p>
                    <p className="font-semibold capitalize">{vti.type.replace('_', ' ')}</p>
                </div>
                <div className="p-3 border rounded-lg">
                    <p className="text-muted-foreground text-xs">Created On</p>
                    <p className="font-semibold">{new Date(vti.creationTime).toLocaleString()}</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
            <CardDescription>A chronological history of events for this batch.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative pl-6 space-y-8">
                 <div className="absolute left-3 top-0 h-full w-0.5 bg-border -z-10"></div>
                 {events.map(event => (
                    <div key={event.id} className="relative flex items-start gap-4">
                        <div className="absolute left-0 top-0 -translate-x-1/2 h-full flex items-center">
                            <span className="bg-background p-1.5 rounded-full border-2 border-primary flex items-center justify-center text-primary">
                                {getEventIcon(event.eventType)}
                            </span>
                        </div>
                        <div className="pl-6 w-full">
                           <Card className="shadow-sm">
                                <CardHeader className="p-4 flex-row justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{event.eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                                        <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                                            <Clock className="h-3 w-3"/>
                                            {new Date(event.timestamp).toLocaleString()}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-end"><UserCircle className="h-3 w-3"/>{event.actor.name}</p>
                                       <Badge variant="secondary" className="mt-1">{event.actor.role}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-sm">
                                    <ul className="space-y-1 text-muted-foreground">
                                        {Object.entries(event.payload).map(([key, value]) => (
                                             <li key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</li>
                                        ))}
                                        {event.geoLocation && (
                                            <li className="flex items-center gap-1"><MapPin className="h-4 w-4"/> Geo: {event.geoLocation.lat.toFixed(4)}, {event.geoLocation.lng.toFixed(4)}</li>
                                        )}
                                    </ul>
                                </CardContent>
                           </Card>
                        </div>
                    </div>
                 ))}
            </div>
        </CardContent>
      </Card>
>>>>>>> Market-Place-Traceability
    </div>
  );
}
