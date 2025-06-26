"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
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


export default function TraceabilityBatchDetailPage() {
  const params = useParams();
  const batchId = params.batchId as string;

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
    </div>
  );
}
