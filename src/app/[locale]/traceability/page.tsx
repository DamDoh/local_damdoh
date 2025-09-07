
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History, Fingerprint, GitBranch, Sprout, User, CalendarDays, Frown } from "lucide-react";
import { useTranslations } from "next-intl";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from 'next/link';

interface VtiBatch {
    id: string;
    producerName: string;
    productName: string;
    harvestDate: string;
}

function BatchCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-1/3" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    )
}

export default function TraceabilityHubPage() {
  const t = useTranslations('traceabilityPage');
  const [vti, setVti] = useState("");
  const [recentBatches, setRecentBatches] = useState<VtiBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const functions = getFunctions(firebaseApp);
  const getRecentBatchesCallable = useMemo(() => httpsCallable(functions, 'traceability-getRecentVtiBatches'), [functions]);

  useEffect(() => {
    const fetchRecentBatches = async () => {
      setIsLoading(true);
      try {
        const result = await getRecentBatchesCallable();
        setRecentBatches((result.data as any).batches || []);
      } catch (error) {
        console.error("Failed to fetch recent batches:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentBatches();
  }, [getRecentBatchesCallable]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (vti.trim()) {
      router.push(`/traceability/batches/${vti.trim()}`);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Fingerprint className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder={t('inputPlaceholder')}
              value={vti}
              onChange={(e) => setVti(e.target.value)}
              className="h-12 text-lg"
              aria-label="Vibrant Traceability ID"
            />
            <Button type="submit" size="lg" disabled={!vti.trim()}>
              <Search className="mr-2 h-5 w-5" />
              {t('trackButton')}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">{t('vtiDescription')}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> {t('recentTitle')}</CardTitle>
           <CardDescription>{t('recentDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <BatchCardSkeleton />
                    <BatchCardSkeleton />
                    <BatchCardSkeleton />
                </div>
            ) : recentBatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentBatches.map(batch => (
                        <Card key={batch.id}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sprout className="h-5 w-5 text-green-600"/>
                                    {batch.productName}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1.5 text-xs">
                                    <User className="h-3 w-3"/>
                                    {t('producerLabel')}: {batch.producerName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                               <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4"/>
                                {t('harvestDateLabel')}: {format(new Date(batch.harvestDate), 'PPP')}
                               </p>
                            </CardContent>
                            <CardFooter>
                               <Button asChild className="w-full">
                                   <Link href={`/traceability/batches/${batch.id}`}>
                                       <GitBranch className="mr-2 h-4 w-4" />
                                       {t('viewReportButton')}
                                   </Link>
                               </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                     <Frown className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2"/>
                    <p className="text-sm text-muted-foreground">{t('noRecentBatches')}</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
