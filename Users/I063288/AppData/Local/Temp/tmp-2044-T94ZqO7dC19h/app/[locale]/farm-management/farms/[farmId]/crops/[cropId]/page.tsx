
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Edit, Weight, Droplets, NotebookPen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TraceabilityEventCard } from '@/components/farm-management/TraceabilityEventCard';
import { CropRotationSuggester } from '@/components/farm-management/CropRotationSuggester';
import type { TraceabilityEvent } from '@/lib/types';


interface CropDetails {
    id: string;
    cropType: string;
    plantingDate: string;
    harvestDate?: string;
    currentStage?: string;
    notes?: string;
    farmId: string;
}

interface FarmDetails {
    location?: string;
}

export default function CropDetailPage() {
  const t = useTranslations('farmManagement.cropDetailPage');
  const params = useParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [crop, setCrop] = useState<CropDetails | null>(null);
  const [farm, setFarm] = useState<FarmDetails | null>(null);
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const functions = getFunctions(firebaseApp);
  const getCropCallable = useMemo(() => httpsCallable(functions, 'getCrop'), [functions]);
  const getFarmCallable = useMemo(() => httpsCallable(functions, 'getFarm'), [functions]);
  const getTraceabilityEventsCallable = useMemo(() => httpsCallable(functions, 'getTraceabilityEventsByFarmField'), [functions]);

  const fetchDetails = useCallback(async () => {
    if (!cropId || !farmId || !user) return;
    setIsLoading(true);
    
    try {
        const [cropResult, eventsResult, farmResult] = await Promise.all([
            getCropCallable({ cropId }),
            getTraceabilityEventsCallable({ farmFieldId: cropId }),
            getFarmCallable({ farmId })
        ]);
        
        const cropData = cropResult.data as CropDetails;
        if (cropData) {
            setCrop(cropData);
        } else {
             toast({ variant: 'destructive', title: t('toast.notFound') });
        }
        
        const farmData = farmResult.data as FarmDetails;
        setFarm(farmData);

        setEvents((eventsResult.data as { events: TraceabilityEvent[] })?.events || []);

    } catch (error) {
        console.error("Error fetching crop details:", error);
        toast({ variant: 'destructive', title: t('toast.loadError') });
    } finally {
        setIsLoading(false);
    }
  }, [cropId, farmId, user, getCropCallable, getFarmCallable, getTraceabilityEventsCallable, toast, t]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (isLoading) {
    return <Skeleton className="h-screen w-full" />;
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
                            events.map((event) => (
                                <TraceabilityEventCard key={event.id} event={event} />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('noActivities')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <CropRotationSuggester 
                cropHistory={cropHistoryForAI}
                location={farm?.location || 'Unknown'}
            />
        </div>
      </div>
    </div>
  );
}
