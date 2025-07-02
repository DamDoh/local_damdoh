
"use client";

import Link from "next/link";
import { ArrowLeft, PlusCircle, LayoutGrid, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface Farm {
  id: string;
  name: string;
  location: string;
  size: number;
  unit: string;
}

function FarmListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MyFarmsPage() {
  const t = useTranslations('FarmManagement.myFarms');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching farm data from a backend
    const fetchFarms = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setFarms([
        { id: 'farm1', name: 'Green Valley Farm', location: 'Rural Area, Kenya', size: 10, unit: 'hectares' },
        { id: 'farm2', name: 'Riverside Orchards', location: 'Near River, Brazil', size: 5, unit: 'acres' },
        { id: 'farm3', name: 'Mountain View Dairy', location: 'Highlands, India', size: 20, unit: 'acres' },
      ]);
      setIsLoading(false);
    };

    fetchFarms();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/farm-management" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backToDashboard')}
      </Link>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href="/farm-management/create-farm" passHref>
          <Button><PlusCircle className="mr-2 h-4 w-4"/> {t('addNewFarmButton')}</Button>
        </Link>
      </div>

      {isLoading ? (
        <FarmListSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {farms.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3 text-center py-8">
              <CardHeader>
                <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground mb-4"/>
                <CardTitle>{t('noFarmsTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{t('noFarmsDescription')}</CardDescription>
                <Link href="/farm-management/create-farm" passHref>
                  <Button>{t('addNewFarmButton')}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            farms.map(farm => (
              <Card key={farm.id}>
                <CardHeader>
                  <CardTitle>{farm.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {farm.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('size')}: {farm.size} {farm.unit}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link href={`/farm-management/farms/${farm.id}`} passHref>
                    <Button variant="outline" className="w-full">{t('viewFarmButton')}</Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
