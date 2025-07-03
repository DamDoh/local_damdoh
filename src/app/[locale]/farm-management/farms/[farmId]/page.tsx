
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MapPin, Sprout, ClipboardList, PlusCircle, Droplets, Weight, NotebookPen } from 'lucide-react';

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

function FarmDetailSkeleton() {
  const t = useTranslations('FarmManagement.farmDetail');
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-4 mb-8">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
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
  );
}

export default function FarmDetailPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const router = useRouter();
  const t = useTranslations('FarmManagement.farmDetail');
  const [farm, setFarm] = useState<FarmDetails | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const functions = getFunctions(firebaseApp);
  const getFarmCallable = useMemo(() => httpsCallable(functions, 'getFarm'), [functions]);
  const getFarmCropsCallable = useMemo(() => httpsCallable(functions, 'getFarmCrops'), [functions]);

  useEffect(() => {
    if (!farmId || !user) {
        if (!user) router.push('/auth/signin');
        setIsLoading(false);
        return;
    };

    const fetchFarmDetails = async () => {
      setIsLoading(true);
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
        setCrops(cropsResult.data as Crop[]);

      } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error loading farm data",
            description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmDetails();
  }, [farmId, user, getFarmCallable, getFarmCropsCallable, toast, router]);

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
        <h1 className="text-4xl font-bold">{farm.name}</h1>
        <div className="flex items-center text-muted-foreground mt-2">
          <MapPin className="mr-2 h-5 w-5" />
          <span>{farm.location} - Registered on {farm.createdAt ? format(new Date(farm.createdAt), 'PPP') : 'N/A'}</span>
        </div>
      </div>
      
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
            {crops && crops.length > 0 ? (
                <div className="space-y-3">
                    {crops.map((crop) => (
                        <Card key={crop.id} className="bg-muted/30">
                            <CardHeader className="p-4">
                               <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{crop.cropType}</CardTitle>
                                        <CardDescription>Planted: {format(new Date(crop.plantingDate), 'PPP')} | Stage: {crop.currentStage || 'N/A'}</CardDescription>
                                    </div>
                               </div>
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
  );
}
