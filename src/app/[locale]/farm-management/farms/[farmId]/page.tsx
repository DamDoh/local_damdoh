
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MapPin, Sprout, ClipboardList, PlusCircle, Droplets, Weight, NotebookPen, TrendingUp, Lightbulb, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FarmDetails {
  id: string;
  name: string;
  location: string;
  size: string;
  createdAt: string;
}

interface Crop {
    id: string;
    cropType: string;
    plantingDate: string;
    currentStage?: string;
}

interface Insight {
    id: string;
    title: string;
    details: string;
    recommendation: string;
}

function FarmDetailSkeleton() {
  const t = useTranslations('FarmManagement.farmDetail');
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-4 mb-8">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
         <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function FarmDetailPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const router = useRouter();
  const t = useTranslations('FarmManagement.farmDetail');
  const [farm, setFarm] = useState<FarmDetails | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const functions = getFunctions(firebaseApp);
  const getFarmCallable = useMemo(() => httpsCallable(functions, 'getFarm'), [functions]);
  const getFarmCropsCallable = useMemo(() => httpsCallable(functions, 'getFarmCrops'), [functions]);
  const getProfitabilityInsightsCallable = useMemo(() => httpsCallable(functions, 'getProfitabilityInsights'), [functions]);

  const fetchFarmData = useCallback(async () => {
    try {
        const [farmResult, cropsResult] = await Promise.all([
            getFarmCallable({ farmId }),
            getFarmCropsCallable({ farmId })
        ]);

        if(!farmResult.data){
            toast({
                variant: "destructive",
                title: "Farm not found or permission denied",
            });
            router.push('/farm-management/farms');
            return;
        }

        setFarm(farmResult.data as FarmDetails);
        setCrops((cropsResult.data as Crop[]) || []);
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Error loading farm data",
            description: error.message,
        });
    }
  }, [farmId, getFarmCallable, getFarmCropsCallable, toast, router]);

  const fetchInsights = useCallback(async () => {
      setIsLoadingInsights(true);
      try {
        const result = await getProfitabilityInsightsCallable({ farmId });
        setInsights((result.data as any).insights || []);
      } catch (err: any) {
        console.error("Error fetching insights:", err);
        toast({ variant: "destructive", title: "Could not load farm insights." });
      } finally {
        setIsLoadingInsights(false);
      }
  }, [farmId, getProfitabilityInsightsCallable, toast]);


  useEffect(() => {
    if (!farmId || !user) {
        if (!user) router.push('/auth/signin');
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    Promise.all([
        fetchFarmData(),
        fetchInsights()
    ]).finally(() => {
        setIsLoading(false);
    });
  }, [farmId, user, fetchFarmData, fetchInsights, router]);

  if (isLoading) {
    return <FarmDetailSkeleton />;
  }

  if (!farm) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold">{t('notFound.title')}</h2>
        <p className="text-muted-foreground">{t('notFound.description')}</p>
        <Button asChild className="mt-4">
          <Link href="/farm-management/farms">{t('notFound.backButton')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/farm-management/farms" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backToFarms')}
      </Link>
      
      <div className="mb-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold">{farm.name}</h1>
                <div className="flex items-center text-muted-foreground mt-2">
                    <MapPin className="mr-2 h-5 w-5" />
                    <span>{farm.location} - Registered on {farm.createdAt ? format(new Date(farm.createdAt), 'PPP') : 'N/A'}</span>
                </div>
            </div>
            <Button asChild variant="outline">
                <Link href={`/farm-management/farms/${farmId}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Farm
                </Link>
            </Button>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Sprout className="h-5 w-5"/>Crops / Livestock</CardTitle>
                            <CardDescription>All active plantings and livestock batches on this farm.</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href={`/farm-management/farms/${farmId}/create-crop`}><PlusCircle className="mr-2 h-4 w-4"/>Add New</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {(Array.isArray(crops) && crops.length > 0) ? (
                            <div className="space-y-3">
                                {crops.map((crop) => (
                                    <Card key={crop.id} className="bg-muted/30">
                                        <CardHeader className="p-4 flex flex-row justify-between items-start">
                                            <div>
                                                <Link href={`/farm-management/farms/${farmId}/crops/${crop.id}`} className="hover:underline">
                                                    <CardTitle className="text-lg">{crop.cropType}</CardTitle>
                                                </Link>
                                                <CardDescription>Planted: {format(new Date(crop.plantingDate), 'PPP')} | Stage: {crop.currentStage || 'N/A'}</CardDescription>
                                            </div>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/farm-management/farms/${farmId}/crops/${crop.id}`}>
                                                    View Journey
                                                </Link>
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 flex flex-wrap gap-2">
                                            <Button asChild variant="default" size="sm">
                                                <Link href={`/farm-management/farms/${farmId}/crops/${crop.id}/log-harvest?cropType=${encodeURIComponent(crop.cropType)}`}>
                                                    <Weight className="mr-2 h-4 w-4" />Log Harvest
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/farm-management/farms/${farmId}/crops/${crop.id}/log-input-application`}>
                                                    <Droplets className="mr-2 h-4 w-4" />Log Input
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/farm-management/farms/${farmId}/crops/${crop.id}/log-observation`}>
                                                    <NotebookPen className="mr-2 h-4 w-4" />Log Observation
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">No crops or livestock have been added to this farm yet.</p>
                                <Button asChild className="mt-4">
                                    <Link href={`/farm-management/farms/${farmId}/create-crop`}>
                                        <PlusCircle className="mr-2 h-4 w-4"/>Add First Crop/Livestock
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Profitability Insights
                        </CardTitle>
                        <CardDescription>AI-powered analysis of your farm's performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingInsights ? (
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : insights.length > 0 ? (
                            <div className="space-y-4">
                                {insights.map(insight => (
                                    <div key={insight.id} className="p-3 border rounded-lg bg-background">
                                        <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                                        <p className="text-xs text-muted-foreground">{insight.details}</p>
                                        <p className="text-xs text-primary mt-2 font-medium flex items-start gap-1.5">
                                            <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                                            <span>{insight.recommendation}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-center text-muted-foreground py-4">No insights available yet. Add more financial data to get started.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
