
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, LayoutGrid, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";

interface Farm {
  id: string;
  name: string;
  location: string;
  size: string;
}

function FarmListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  const functions = getFunctions(firebaseApp);
  const getUserFarmsCallable = useMemo(() => httpsCallable(functions, 'getUserFarms'), [functions]);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    }

    const fetchFarms = async () => {
      setIsLoading(true);
      try {
        const result = await getUserFarmsCallable();
        setFarms((result.data as Farm[]) ?? []); // Safeguard against undefined result
      } catch (error: any) {
        console.error("Failed to fetch farms:", error);
        toast({
            variant: "destructive",
            title: "Could not load farms",
            description: error.message
        });
        setFarms([]); // Ensure farms is an array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarms();
  }, [user, getUserFarmsCallable, toast]);

  if (!user && !isLoading) {
    return (
      <Card className="text-center py-8">
        <CardHeader><CardTitle>Please Sign In</CardTitle></CardHeader>
        <CardContent>
          <CardDescription>You need to be logged in to manage your farms.</CardDescription>
          <Button asChild className="mt-4"><Link href="/auth/signin">Sign In</Link></Button>
        </CardContent>
      </Card>
    );
  }

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
          {farms.length > 0 ? (
            farms.map(farm => (
              <Card key={farm.id}>
                <CardHeader>
                  <CardTitle>{farm.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {farm.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('size')}: {farm.size}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link href={`/farm-management/farms/${farm.id}`} passHref>
                    <Button variant="outline" className="w-full">{t('viewFarmButton')}</Button>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}
