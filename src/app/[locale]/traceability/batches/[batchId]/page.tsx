
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, GitBranch, Sprout, Eye, Droplets, Weight, HardHat, Package, CheckCircle, UserCircle, Clock, MapPin, AlertCircle, Info, CalendarDays, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useTranslations } from "next-intl";
import { StakeholderIcon } from '@/components/icons/StakeholderIcon';

// Define types for the data we expect from the backend
interface TraceabilityEvent {
  id: string;
  eventType: string;
  timestamp: string; // ISO string
  payload: any;
  actor: {
    name: string;
    role: string;
    avatarUrl?: string;
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
  events?: TraceabilityEvent[]; // Events are optional
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
    <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-9 w-48" />
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                     <Skeleton className="h-8 w-3/4" />
                     <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    </div>
);

export default function TraceabilityBatchDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const batchId = params.batchId as string;
  
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
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button asChild variant="secondary" className="mt-4">
                <Link href="/traceability"><ArrowLeft className="mr-2 h-4 w-4" />{t('traceabilityDetailPage.backLink')}</Link>
            </Button>
        </Alert>
    );
  }

  if (!data || !data.vti) {
     return (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{t('traceabilityDetailPage.notFoundTitle')}</AlertTitle>
            <AlertDescription>{t('traceabilityDetailPage.notFoundDescription')}</AlertDescription>
        </Alert>
     );
  }

  // Safely destructure events, providing an empty array as a fallback to prevent crashes
  const { vti, events = [] } = data;
  const producerEvent = events.find(e => e.eventType === 'HARVESTED' || e.eventType === 'PLANTED');
  const harvestEvent = events.find(e => e.eventType === 'HARVESTED');
  
  const producer = producerEvent?.actor;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/traceability">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('traceabilityDetailPage.backLink')}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-3">
              <GitBranch className="h-10 w-10 text-primary mt-1" />
              <div>
                <CardTitle className="text-2xl">{vti.metadata?.cropType || t('traceabilityDetailPage.traceableProduct')}</CardTitle>
                <CardDescription>
                  {t('traceabilityDetailPage.batchIdLabel')}: <span className="font-mono bg-muted p-1 rounded-sm text-xs">{vti.id}</span>
                </CardDescription>
              </div>
            </div>
            {producer && (
              <div className="flex items-center gap-2 p-2 border rounded-lg bg-background w-full sm:w-auto">
                <Avatar>
                    <AvatarImage src={producer.avatarUrl} alt={producer.name} data-ai-hint="farmer profile"/>
                    <AvatarFallback>{producer.name.substring(0,1)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xs text-muted-foreground">{t('traceabilityDetailPage.producerLabel')}</p>
                    <p className="font-semibold text-sm">{producer.name}</p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="border-t pt-6">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs flex items-center gap-1.5"><CalendarDays className="h-4 w-4"/> {t('traceabilityDetailPage.harvestDateLabel')}</p>
                    <p className="font-semibold text-lg">{harvestEvent ? format(new Date(harvestEvent.timestamp), 'PPP') : 'N/A'}</p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs flex items-center gap-1.5"><Weight className="h-4 w-4"/> {t('traceabilityDetailPage.yieldLabel')}</p>
                    <p className="font-semibold text-lg">{vti.metadata?.initialYieldKg ? `${vti.metadata.initialYieldKg} kg` : 'N/A'}</p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs flex items-center gap-1.5"><Award className="h-4 w-4"/> {t('traceabilityDetailPage.qualityLabel')}</p>
                    <p className="font-semibold text-lg">{vti.metadata?.initialQualityGrade || 'Not Specified'}</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>{t('traceabilityDetailPage.journeyTitle')}</CardTitle>
            <CardDescription>{t('traceabilityDetailPage.journeyDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            {events.length > 0 ? (
                <div className="relative pl-6">
                    <div className="absolute left-8 top-0 h-full w-0.5 bg-border -z-10"></div>
                    {events.map(event => {
                        return (
                            <div key={event.id} className="relative flex items-start gap-4 pb-8">
                                <div className="absolute left-0 top-0 h-full flex flex-col items-center">
                                    <span className="bg-background p-1.5 rounded-full border-2 border-primary flex items-center justify-center text-primary z-10">
                                        {getEventIcon(event.eventType)}
                                    </span>
                                </div>
                                <div className="pl-14 w-full">
                                <Card className="shadow-sm bg-background/80">
                                        <CardHeader className="p-4 flex-row justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base">{event.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                                                <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                                                    <Clock className="h-3 w-3"/>
                                                    {format(new Date(event.timestamp), 'PPpp')}
                                                </CardDescription>
                                            </div>
                                            <div className="text-right">
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-end"><UserCircle className="h-3 w-3"/>{event.actor.name}</p>
                                            <Badge variant="secondary" className="mt-1 flex items-center gap-1">
                                                <StakeholderIcon role={event.actor.role} className="h-3 w-3" />
                                                {event.actor.role}
                                            </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm">
                                            <ul className="space-y-1 text-muted-foreground text-xs">
                                                {event.payload && typeof event.payload === 'object' && Object.entries(event.payload).map(([key, value]) => {
                                                    if (typeof value === 'object' && value !== null) return null; // Skip object payloads for this simple view
                                                    return <li key={key} className="truncate"><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {String(value)}</li>
                                                })}
                                                {event.geoLocation && (
                                                    <li className="flex items-center gap-1 pt-1"><MapPin className="h-3 w-3"/>{t('traceabilityDetailPage.geoLocationLabel')}: {event.geoLocation.lat.toFixed(4)}, {event.geoLocation.lng.toFixed(4)}</li>
                                                )}
                                            </ul>
                                        </CardContent>
                                </Card>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-10 text-muted-foreground">No traceability events found.</div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
