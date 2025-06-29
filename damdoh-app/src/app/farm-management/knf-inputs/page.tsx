
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlaskConical, ArrowLeft, PlusCircle, Calendar, Clock, Edit2, Loader2, CheckCircle, Package, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Skeleton } from "@/components/ui/skeleton";
import type { KnfBatch as KnfBatchType } from '@/lib/types';
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type KnfInputType = 'fpj' | 'faa' | 'wca' | 'imo' | 'lab';

interface ActiveBatch extends KnfBatchType {
  startDate: string; 
  nextStepDate: string;
}

export default function KNFInputAssistantPage() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  
  const createKnfBatchCallable = useMemo(() => httpsCallable(functions, 'createKnfBatch'), [functions]);
  const getUserKnfBatchesCallable = useMemo(() => httpsCallable(functions, 'getUserKnfBatches'), [functions]);
  const updateKnfBatchStatusCallable = useMemo(() => httpsCallable(functions, 'updateKnfBatchStatus'), [functions]);

  const [allBatches, setAllBatches] = useState<ActiveBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingBatchId, setUpdatingBatchId] = useState<string | null>(null);
  
  const [selectedInput, setSelectedInput] = useState<KnfInputType | ''>('');
  const [ingredients, setIngredients] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());

  const knfOptions: { value: KnfInputType; label: string; placeholder: string }[] = [
    { value: 'fpj', label: t('farmManagement.knf.types.fpj.label'), placeholder: t('farmManagement.knf.types.fpj.placeholder') },
    { value: 'faa', label: t('farmManagement.knf.types.faa.label'), placeholder: t('farmManagement.knf.types.faa.placeholder') },
    { value: 'wca', label: t('farmManagement.knf.types.wca.label'), placeholder: t('farmManagement.knf.types.wca.placeholder') },
    { value: 'imo', label: t('farmManagement.knf.types.imo.label'), placeholder: t('farmManagement.knf.types.imo.placeholder') },
    { value: 'lab', label: t('farmManagement.knf.types.lab.label'), placeholder: t('farmManagement.knf.types.lab.placeholder') },
  ];

  const fetchBatches = async () => {
    if (!user) {
        setIsLoadingBatches(false);
        return;
    };
    setIsLoadingBatches(true);
    try {
        const result = await getUserKnfBatchesCallable();
        const batches = result.data as ActiveBatch[];
        setAllBatches(batches.filter(b => b.status !== 'Archived'));
    } catch (error) {
        console.error("Error fetching KNF batches:", error);
        toast({ title: t('farmManagement.knf.errorLoadTitle'), description: t('farmManagement.knf.errorLoadDescription'), variant: "destructive" });
    } finally {
        setIsLoadingBatches(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchBatches();
    } else {
        setIsLoadingBatches(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleStartBatch = async () => {
    if (!selectedInput || !ingredients || !startDate) {
        toast({ title: t('farmManagement.knf.errorFields'), variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    
    const selectedOption = knfOptions.find(opt => opt.value === selectedInput)!;

    try {
        await createKnfBatchCallable({
            type: selectedInput,
            typeName: selectedOption.label,
            ingredients,
            startDate: startDate.toISOString(),
        });

        toast({ title: t('farmManagement.knf.successStartTitle'), description: t('farmManagement.knf.successStartDescription') });
        
        setShowCreateForm(false);
        setSelectedInput('');
        setIngredients('');
        setStartDate(new Date());
        await fetchBatches();
    } catch (error) {
        console.error("Error creating KNF batch:", error);
        toast({ title: t('farmManagement.knf.failStartTitle'), description: t('farmManagement.knf.failStartDescription'), variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleUpdateStatus = async (batchId: string, newStatus: 'Ready' | 'Archived' | 'Used') => {
    setUpdatingBatchId(batchId);
    try {
        await updateKnfBatchStatusCallable({ batchId, status: newStatus });
        toast({ title: t('farmManagement.knf.successUpdateTitle'), description: t('farmManagement.knf.successUpdateDescription', { status: newStatus })});
        await fetchBatches();
    } catch (error) {
        console.error("Error updating batch status:", error);
        toast({ title: t('farmManagement.knf.failUpdateTitle'), description: t('farmManagement.knf.failUpdateDescription'), variant: "destructive" });
    } finally {
        setUpdatingBatchId(null);
    }
  };

  const fermentingBatches = allBatches.filter(b => b.status === 'Fermenting');
  const readyBatches = allBatches.filter(b => b.status === 'Ready');

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('farmManagement.backToHub')}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('farmManagement.knf.title')}</CardTitle>
          </div>
          <CardDescription>{t('farmManagement.knf.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('farmManagement.knf.fermentingTitle')}</h3>
                {isLoadingBatches ? (
                    <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>
                ) : fermentingBatches.length > 0 ? (
                    fermentingBatches.map(batch => {
                        const isActionable = new Date(batch.nextStepDate) <= new Date();
                        return (
                            <Card key={batch.id} className="bg-muted/30">
                                <CardHeader className="pb-3 pt-4">
                                    <CardTitle className="text-md flex justify-between items-center">
                                        <span>{batch.typeName}</span>
                                        <Badge>{batch.status}</Badge>
                                    </CardTitle>
                                    <CardDescription className="text-xs">{t('farmManagement.knf.startedLabel')}: {format(new Date(batch.startDate), 'PPP')}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <p><strong className="font-medium">{t('farmManagement.knf.ingredientsLabel')}:</strong> {batch.ingredients}</p>
                                    <div className="mt-2 flex items-center text-primary gap-2 p-2 bg-primary/10 rounded-md">
                                        <Clock className="h-5 w-5"/>
                                        <div>
                                            <p className="font-semibold">{batch.nextStep}</p>
                                            <p>{t('farmManagement.knf.readyOnLabel')}: {format(new Date(batch.nextStepDate), 'PPP')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end gap-2">
                                    <Button size="sm" onClick={() => handleUpdateStatus(batch.id, 'Ready')} disabled={!isActionable || updatingBatchId === batch.id}>
                                        {updatingBatchId === batch.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {t('farmManagement.knf.markReadyButton')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg"><p>{t('farmManagement.knf.noFermentingBatches')}</p></div>
                )}
            </div>

            <hr className="my-6"/>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('farmManagement.knf.readyTitle')}</h3>
                {isLoadingBatches ? (
                    <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>
                ) : readyBatches.length > 0 ? (
                    readyBatches.map(batch => (
                        <Card key={batch.id} className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CardHeader className="pb-3 pt-4">
                                <CardTitle className="text-md flex justify-between items-center">
                                    <span>{batch.typeName}</span>
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">{batch.status}</Badge>
                                </CardTitle>
                                <CardDescription className="text-xs">{t('farmManagement.knf.readySinceLabel')}: {format(new Date(batch.nextStepDate), 'PPP')}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p><strong className="font-medium">{t('farmManagement.knf.ingredientsLabel')}:</strong> {batch.ingredients}</p>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="secondary" size="sm" disabled={updatingBatchId === batch.id}><Package className="h-4 w-4 mr-2"/>{t('farmManagement.knf.logUsageButton')}</Button>
                                <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(batch.id, 'Archived')} disabled={updatingBatchId === batch.id}>
                                    {updatingBatchId === batch.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    <Archive className="h-4 w-4 mr-2"/>{t('farmManagement.knf.archiveButton')}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg"><p>{t('farmManagement.knf.noReadyBatches')}</p></div>
                )}
            </div>

            <hr className="my-6"/>

            <div>
                {!showCreateForm ? (
                    <Button onClick={() => setShowCreateForm(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/> {t('farmManagement.knf.startBatchButton')}
                    </Button>
                ) : (
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold">{t('farmManagement.knf.createTitle')}</h3>
                        <div className="space-y-2">
                            <Label htmlFor="knf-type">{t('farmManagement.knf.form.typeLabel')}</Label>
                            <Select value={selectedInput} onValueChange={(value) => setSelectedInput(value as KnfInputType)}>
                                <SelectTrigger id="knf-type">
                                    <SelectValue placeholder={t('farmManagement.knf.form.typePlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {knfOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {selectedInput && (
                             <>
                                <div className="space-y-2">
                                    <Label htmlFor="ingredients">{t('farmManagement.knf.form.ingredientsLabel')}</Label>
                                    <Input 
                                        id="ingredients" 
                                        value={ingredients}
                                        onChange={(e) => setIngredients(e.target.value)}
                                        placeholder={knfOptions.find(o => o.value === selectedInput)?.placeholder} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">{t('farmManagement.knf.form.dateLabel')}</Label>
                                    <Input 
                                        id="start-date" 
                                        type="date"
                                        value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => setStartDate(e.target.valueAsDate || undefined)}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button onClick={handleStartBatch} disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        {isSubmitting ? t('farmManagement.knf.submittingButton') : t('farmManagement.knf.submitButton')}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isSubmitting}>{t('farmManagement.knf.cancelButton')}</Button>
                                </div>
                             </>
                        )}
                    </div>
                )}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
