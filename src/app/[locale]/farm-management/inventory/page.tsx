
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from "next/link";
import { ArrowLeft, PlusCircle, Package, AlertCircle, Trash2, Edit, Eye, Loader2, Droplets } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { InventoryItem, Crop } from '@/lib/types';
import { LogUsageDialog } from '@/components/farm-management/LogUsageDialog';


function InventoryListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function InventoryManagementPage() {
  const t = useTranslations('farmManagement.inventory');
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const functions = getFunctions(firebaseApp);
  const getInventoryCallable = useMemo(() => httpsCallable(functions, 'inventory-getInventory'), [functions]);

  const fetchInventory = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getInventoryCallable();
      setInventory((result.data as any)?.items ?? []);
    } catch (err: any) {
      console.error("Failed to fetch inventory:", err);
      setError(err.message || 'Failed to load inventory items.');
      setInventory([]);
      toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, getInventoryCallable, toast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const isExpired = (expiryDate?: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };
  
  const handleUsageLogged = () => {
    setSelectedItem(null);
    fetchInventory(); // Refresh data after usage is logged
  };

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
    <>
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/farm-management" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backToHub')}
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        {user && (
          <Link href="/farm-management/inventory/create" passHref>
            <Button><PlusCircle className="mr-2 h-4 w-4"/> {t('addNewItemButton')}</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
           <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <InventoryListSkeleton />
          ) : error ? (
            <div className="text-center text-destructive">{t('errors.fetch', { message: error })}</div>
          ) : inventory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.category')}</TableHead>
                  <TableHead>{t('table.quantity')}</TableHead>
                  <TableHead>{t('table.expiry')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map(item => (
                  <TableRow key={item.id} className={isExpired(item.expiryDate) ? "bg-destructive/10" : ""}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell className={isExpired(item.expiryDate) ? "text-destructive font-semibold" : ""}>
                      {isExpired(item.expiryDate) && <AlertCircle className="inline h-4 w-4 mr-1"/>}
                      {item.expiryDate ? format(new Date(item.expiryDate), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="secondary" size="sm" title={t('actions.logUsage')} onClick={() => setSelectedItem(item)}>
                            <Droplets className="h-4 w-4"/>
                        </Button>
                        <Button asChild variant="outline" size="sm" title={t('actions.edit')}>
                           <Link href={`/farm-management/inventory/${item.id}/edit`}><Edit className="h-4 w-4"/></Link>
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
                <h3 className="mt-4 text-lg font-semibold">{t('noItemsTitle')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t('noItemsDescription')}</p>
                {user && (
                    <Button asChild className="mt-4">
                        <Link href="/farm-management/inventory/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t('addNewItemButton')}
                        </Link>
                    </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    {selectedItem && (
        <LogUsageDialog
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            onUsageLogged={handleUsageLogged}
        />
    )}
    </>
  );
}
