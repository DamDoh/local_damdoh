
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MapPin, Sprout, ClipboardList, PlusCircle, Droplets, Weight, NotebookPen, TrendingUp, Lightbulb, Edit, Eye, HardHat, Package, CheckCircle, GitBranch, Truck, CalendarDays, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import type { FarmingAssistantOutput } from '@/lib/types';
import { CropRotationSuggester } from '@/components/farm-management/CropRotationSuggester';

interface CropDetails {
    id: string;
    cropType: string;
    plantingDate: string;
    harvestDate?: string;
    currentStage?: string;
    notes?: string;
    farmId: string; // Add farmId
}

interface FarmDetails {
    location?: string;
}

interface TraceabilityEvent {
  id: string;
  eventType: string;
  timestamp: string;
  payload: any;
  actor: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  geoLocation?: { lat: number; lng: number } | null;
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
        case 'TRANSPORTED': return <Truck {...iconProps} />;
        default: return <HardHat {...iconProps} />;
    }
};

const EventPayload = ({ payload, t }: { payload: any, t:any }) => {
    if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
        return <p className="text-xs text-muted-foreground italic">{t('eventPayload.noDetails')}</p>;
    }
    
    if (payload.aiAnalysis) {
        const analysis = payload.aiAnalysis as FarmingAssistantOutput;
        return (
            <div className="text-sm text-muted-foreground space-y-2 mt-2 p-2 bg-background rounded-md">
                <p><strong>{t('eventPayload.observationType')}:</strong> {payload.observationType}</p>
                <p><strong>{t('eventPayload.details')}:</strong> {payload.details}</p>
                <div className="mt-2 pt-2 border-t border-dashed">
                    <h5 className="font-semibold text-foreground text-sm">{t('eventPayload.aiDiagnosis')}</h5>
                    <p className="text-sm">{analysis.summary}</p>
                </div>
            </div>
        )
    }

    return (
        <ul className="space-y-1 text-muted-foreground text-xs list-disc list-inside">
            {Object.entries(payload).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) return null;
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return <li key={key} className="truncate"><strong>{formattedKey}:</strong> {String(value)}</li>
            })}
        </ul>
    );
};

export default function CropDetailPage() {
  const t = useTranslations('farmManagement.cropDetailPage');
  const params = useParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [crop, setCrop] = useState<CropDetails | null>(null);
  const [farm, setFarm] = useState<FarmDetails | null>(null);
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const functions = getFunctions(firebaseApp);
  const getCropCallable = useMemo(() => httpsCallable(functions, 'getCrop'), [functions]);
  const getTraceabilityEventsCallable = useMemo(() => httpsCallable(functions, 'getTraceabilityEventsByFarmField'), [functions]);

  const fetchDetails = useCallback(async () => {
    if (!cropId || !farmId || !user) return;
    setIsLoading(true);
    
    try {
        const [cropResult, eventsResult] = await Promise.all([
            getCropCallable({ cropId }),
            getTraceabilityEventsCallable({ farmFieldId: cropId })
        ]);
        
        const cropData = cropResult.data as CropDetails;
        if (cropData) {
            setCrop(cropData);
        } else {
             toast({ variant: 'destructive', title: t('toast.notFound') });
        }

        setEvents((eventsResult.data as { events: TraceabilityEvent[] })?.events || []);

    } catch (error) {
        console.error("Error fetching crop details:", error);
        toast({ variant: 'destructive', title: t('toast.loadError') });
    } finally {
        setIsLoading(false);
    }
  }, [cropId, farmId, user, getCropCallable, getTraceabilityEventsCallable, toast, t]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  if (!crop) {
    return <div>{t('notFound')}</div>;
  }
  
  const cropHistoryForAI = events.map(e => e.payload?.cropType || e.payload?.inputId).filter(Boolean);
  if (cropHistoryForAI.length === 0) {
      cropHistoryForAI.push(crop.cropType);
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
       <Link href={`/farm-management/farms/${farmId}`} className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                         <div>
                            <CardTitle className="text-2xl">{crop.cropType}</CardTitle>
                            <CardDescription>{t('plantedOn', { date: format(new Date(crop.plantingDate), 'PPP') })}</CardDescription>
                        </div>
                         <div className="flex gap-2">
                             <Button asChild variant="secondary" size="sm">
                               <Link href={`/farm-management/farms/${farmId}/crops/${cropId}/edit`}>
                                <Edit className="mr-2 h-4 w-4"/>{t('editButton')}
                              </Link>
                            </Button>
                         </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 bg-muted/50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">{t('quickActionsTitle')}</h3>
                         <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/farm-management/farms/${farmId}/crops/${cropId}/log-input-application`}>
                                <Droplets className="mr-2 h-4 w-4"/>{t('logInputButton')}
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/farm-management/farms/${farmId}/crops/${cropId}/log-observation`}>
                                <NotebookPen className="mr-2 h-4 w-4"/>{t('logObservationButton')}
                                </Link>
                            </Button>
                             <Button asChild variant="default" size="sm">
                                <Link href={`/farm-management/farms/${farmId}/crops/${cropId}/log-harvest?cropType=${encodeURIComponent(crop.cropType)}`}>
                                    <Weight className="mr-2 h-4 w-4" />{t('logHarvestButton')}
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">{t('journeyTitle')}</h3>
                    <div className="relative pl-6">
                        <div className="absolute left-8 top-0 h-full w-0.5 bg-border -z-10"></div>
                        {events.length > 0 ? (
                            events.map((event, index) => (
                                <div key={event.id} className="relative flex items-start gap-4 pb-8">
                                     <div className="absolute left-0 top-0 h-full flex flex-col items-center">
                                        <span className="bg-background p-1.5 rounded-full border-2 border-primary flex items-center justify-center text-primary z-10">
                                            {getEventIcon(event.eventType)}
                                        </span>
                                    </div>
                                    <div className="pl-14 w-full">
                                        <Card className="shadow-sm">
                                            <CardHeader className="p-3">
                                                <CardTitle className="text-base">{event.eventType.replace(/_/g, ' ')}</CardTitle>
                                                <CardDescription className="text-xs">{format(new Date(event.timestamp), 'PPpp')}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-3 pt-0">
                                                <EventPayload payload={event.payload} t={t}/>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('noActivities')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            {/* Removed farm location fetch here, assuming it can be passed or fetched elsewhere if needed */}
            <CropRotationSuggester 
                // Pass location if farm details are fetched here or available otherwise
                cropHistory={cropHistoryForAI}
                location={farm?.location || 'Unknown'} // Placeholder or fetch farm details if needed
            />
        </div>
      </div>
    </div>
  );
}
