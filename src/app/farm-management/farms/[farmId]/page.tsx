"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MapPin, Sprout, Tractor, ClipboardList, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FarmDetails {
  id: string;
  name: string;
  location: string;
  size: number;
  unit: string;
}

function FarmDetailSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}

export default function FarmDetailPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const t = useTranslations('FarmManagement.farmDetail');
  const [farm, setFarm] = useState<FarmDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!farmId) return;

    const fetchFarmDetails = async () => {
      setIsLoading(true);
      // Simulate fetching data for a specific farm
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockFarms = [
        { id: 'farm1', name: 'Green Valley Farm', location: 'Rural Area, Kenya', size: 10, unit: 'hectares' },
        { id: 'farm2', name: 'Riverside Orchards', location: 'Near River, Brazil', size: 5, unit: 'acres' },
        { id: 'farm3', name: 'Mountain View Dairy', location: 'Highlands, India', size: 20, unit: 'acres' },
      ];
      const foundFarm = mockFarms.find(f => f.id === farmId);
      setFarm(foundFarm || null);
      setIsLoading(false);
    };

    fetchFarmDetails();
  }, [farmId]);

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
          <span>{farm.location}</span>
        </div>
      </div>
      
      {/* Placeholder for a map component */}
      <Card className="mb-8">
        <CardContent className="h-64 flex items-center justify-center bg-muted rounded-lg">
          <p className="text-muted-foreground">{t('mapPlaceholder')}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Manage Fields */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sprout className="h-8 w-8 text-primary"/>
              <CardTitle>{t('fields.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('fields.description')}</CardDescription>
            <Button className="mt-4 w-full" variant="outline" disabled>{t('fields.button')}</Button>
          </CardContent>
        </Card>
        
        {/* Manage Crops */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
             <div className="flex items-center gap-3">
              <Tractor className="h-8 w-8 text-primary"/>
              <CardTitle>{t('crops.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('crops.description')}</CardDescription>
            <Button className="mt-4 w-full" variant="outline" disabled>{t('crops.button')}</Button>
          </CardContent>
        </Card>

        {/* Manage Activities */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
             <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-primary"/>
              <CardTitle>{t('activities.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('activities.description')}</CardDescription>
            <Button className="mt-4 w-full" variant="outline" disabled>{t('activities.button')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
