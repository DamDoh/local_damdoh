
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import type { InventoryItem, Crop } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface LogUsageDialogProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  onUsageLogged: () => void;
}

export function LogUsageDialog({ item, isOpen, onClose, onUsageLogged }: LogUsageDialogProps) {
  const t = useTranslations('farmManagement.inventory.logUsageDialog');
  const [quantityUsed, setQuantityUsed] = useState<number | string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const functions = getFunctions(firebaseApp);
  const useInventoryItemCallable = useMemo(() => httpsCallable(functions, 'inventory-useInventoryItem'), [functions]);
  
  useEffect(() => {
    if (isOpen && user) {
      const fetchCrops = async () => {
        setIsLoadingCrops(true);
        try {
          const getFarms = httpsCallable(functions, 'farmManagement-getUserFarms');
          const farmsResult = await getFarms();
          const userFarms = (farmsResult.data as any[]) || [];
          
          let allCrops: Crop[] = [];
          const getCropsForFarm = httpsCallable(functions, 'farmManagement-getFarmCrops');

          for (const farm of userFarms) {
              const cropsResult = await getCropsForFarm({ farmId: farm.id });
              allCrops = [...allCrops, ...(cropsResult.data as any[])];
          }
          
          setCrops(allCrops.filter(c => c.currentStage !== 'Post-Harvest'));
        } catch (error) {
          console.error("Error fetching crops:", error);
          toast({ title: t('toast.error'), description: t('toast.fetchCropsError'), variant: 'destructive' });
        } finally {
          setIsLoadingCrops(false);
        }
      };
      fetchCrops();
    }
  }, [isOpen, user, functions, toast, t]);

  const handleSubmit = async () => {
    const quantityNum = Number(quantityUsed);
    if (!selectedCrop || !quantityNum || quantityNum <= 0) {
      toast({ title: t('toast.validationErrorTitle'), description: t('toast.validationErrorDescription'), variant: "destructive" });
      return;
    }
    if (quantityNum > item.quantity) {
        toast({ title: t('toast.quantityErrorTitle'), description: t('toast.quantityErrorDescription', { max: item.quantity, unit: item.unit }), variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      await useInventoryItemCallable({
        itemId: item.id,
        cropId: selectedCrop,
        quantityUsed: quantityNum,
        notes: `Used ${quantityNum} ${item.unit} of ${item.name} on crop.`
      });
      toast({ title: t('toast.successTitle'), description: t('toast.successDescription') });
      onUsageLogged();
    } catch (error: any) {
      toast({ title: t('toast.error'), description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title', { itemName: item.name })}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="crop-select">{t('selectCropLabel')}</Label>
            {isLoadingCrops ? <Skeleton className="h-10 w-full" /> : (
              <Select onValueChange={setSelectedCrop} value={selectedCrop}>
                <SelectTrigger id="crop-select">
                  <SelectValue placeholder={t('selectCropPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {crops.map(crop => (
                    <SelectItem key={crop.id} value={crop.id}>{crop.cropType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity-used">{t('quantityUsedLabel', { unit: item.unit })}</Label>
            <Input 
              id="quantity-used" 
              type="number" 
              value={quantityUsed}
              onChange={(e) => setQuantityUsed(e.target.value)}
              placeholder={t('quantityUsedPlaceholder')}
              max={item.quantity}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingCrops}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Droplets className="mr-2 h-4 w-4" />}
            {isSubmitting ? t('loggingButton') : t('logButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
