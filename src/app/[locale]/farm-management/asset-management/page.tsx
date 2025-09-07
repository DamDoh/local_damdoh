
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from "next/link";
import { ArrowLeft, PlusCircle, Wrench, Package, Euro, Calendar, Trash2, Edit, Eye, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';

interface FarmAsset {
  id: string;
  name: string;
  type: string;
  purchaseDate: string; // ISO date string
  value: number;
  currency: string;
}

function AssetListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function AssetManagementPage() {
  const t = useTranslations('farmManagement.assetManagement');
  const { user } = useAuth();
  const [assets, setAssets] = useState<FarmAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const functions = getFunctions(firebaseApp);
  const getUserAssetsCallable = useMemo(() => httpsCallable(functions, 'assetManagement-getUserAssets'), [functions]);

  const fetchAssets = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getUserAssetsCallable();
      setAssets((result.data as any)?.assets ?? []);
    } catch (err: any) {
      console.error("Failed to fetch assets:", err);
      setError(err.message || 'Failed to load assets.');
      setAssets([]);
      toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, getUserAssetsCallable, toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  if (!user && !isLoading) {
    return (
      <Card className="text-center py-8">
        <CardHeader>
          <CardTitle>{t('signInPrompt.title')}</CardTitle>
          <CardDescription>{t('signInPrompt.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="mt-4">
            <Link href="/auth/signin">{t('signInPrompt.button')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/farm-management" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backToHub')}
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        {user && (
          <Link href="/farm-management/asset-management/create" passHref>
            <Button><PlusCircle className="mr-2 h-4 w-4"/> {t('addNewAssetButton')}</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
           <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AssetListSkeleton />
          ) : error ? (
            <div className="text-center text-destructive">{t('errors.fetch', { message: error })}</div>
          ) : assets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.type')}</TableHead>
                  <TableHead>{t('table.purchaseDate')}</TableHead>
                  <TableHead>{t('table.value')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{asset.currency} {asset.value?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button asChild variant="outline" size="sm" title={t('actions.edit')}>
                           <Link href={`/farm-management/asset-management/${asset.id}/edit`}><Edit className="h-4 w-4"/></Link>
                        </Button>
                         <Button variant="destructive" size="sm" title={t('actions.delete')} onClick={() => alert('Delete functionality coming soon')}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4"/>
                <h3 className="mt-4 text-lg font-semibold">{t('noAssetsTitle')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t('noAssetsDescription')}</p>
                {user && (
                    <Button asChild className="mt-4">
                        <Link href="/farm-management/asset-management/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t('addNewAssetButton')}
                        </Link>
                    </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
