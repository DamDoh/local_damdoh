
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlaskConical, ArrowLeft, PlusCircle, Calendar, Clock, Edit2, Loader2, CheckCircle, Package, Archive, BookOpen, ListOrdered, Beaker } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Skeleton } from "@/components/ui/skeleton";
import type { KnfBatch as KnfBatchType } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

type KnfInputType = 'fpj' | 'faa' | 'wca' | 'imo' | 'lab';

interface ActiveBatch extends KnfBatchType {
  startDate: string; 
  nextStepDate: string;
}

export default function KNFInputAssistantPage() {
  const t = useTranslations('farmManagement.knfInputsPage');
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
  const [quantity, setQuantity] = useState<number | string>('');
  const [unit, setUnit] = useState<string>('');


  const knfOptions: { value: KnfInputType; label: string; placeholder: string }[] = t.tm('knfOptions');
  const knfRecipeData: any[] = t.tm('recipeData');

  const fetchBatches = async () => {
    if (!user) {
        setIsLoadingBatches(false);
        return;
    };
    setIsLoadingBatches(true);
    try {
        const result = await getUserKnfBatchesCallable();
        const batches = (result.data as ActiveBatch[]) ?? [];
        setAllBatches(batches.filter(b => b.status !== 'Archived'));
    } catch (error) {
        console.error("Error fetching KNF batches:", error);
        toast({ title: t('toasts.loadErrorTitle'), description: t('toasts.loadErrorDescription'), variant: "destructive" });
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
    if (!selectedInput || !ingredients || !startDate || !quantity || !unit) {
        toast({ title: t('toasts.validationError'), variant: "destructive" });
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
            quantityProduced: Number(quantity),
            unit,
        });

        toast({ title: t('toasts.batchStartedTitle'), description: t('toasts.batchStartedDescription') });
        
        setShowCreateForm(false);
        setSelectedInput('');
        setIngredients('');
        setStartDate(new Date());
        setQuantity('');
        setUnit('');
        await fetchBatches();
    } catch (error) {
        console.error("Error creating KNF batch:", error);
        toast({ title: t('toasts.batchStartFailed'), description: t('toasts.unexpectedError'), variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleUpdateStatus = async (batchId: string, newStatus: 'Ready' | 'Archived' | 'Used') => {
    setUpdatingBatchId(batchId);
    try {
        await updateKnfBatchStatusCallable({ batchId, status: newStatus });
        toast({ title: t('toasts.batchUpdatedTitle'), description: t('toasts.batchUpdatedDescription', { status: newStatus })});
        await fetchBatches();
    } catch (error) {
        console.error("Error updating batch status:", error);
        toast({ title: t('toasts.updateFailed'), description: t('toasts.couldNotUpdate'), variant: "destructive" });
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
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backLink')}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
          </div>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5"/>{t('guidesTitle')}</h3>
              <Accordion type="single" collapsible className="w-full">
                {knfRecipeData.map((recipe) => (
                  <AccordionItem value={recipe.id} key={recipe.id}>
                    <AccordionTrigger>{recipe.name}</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{recipe.description}</p>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><Beaker className="h-4 w-4"/>{t('ingredients')}</h4>
                        <ul className="list-disc list-inside pl-5 text-sm">
                          {recipe.ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><ListOrdered className="h-4 w-4"/>{t('steps')}</h4>
                        <ol className="list-decimal list-inside pl-5 text-sm space-y-1">
                          {recipe.steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                        </ol>
                      </div>
                       <div>
                        <h4 className="font-semibold text-sm mb-1">{t('usage')}</h4>
                        <p className="text-sm">{recipe.usage}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <Separator className="my-6" />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('fermentingBatchesTitle')}</h3>
                {isLoadingBatches ? (
                    <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>
                ) : fermentingBatches.length > 0 ? (
                    fermentingBatches.map(batch => {
                        const isActionable = new Date(batch.nextStepDate) <= new Date();
                        return (
                            <Card key={batch.id} className="bg-muted/30">
                                <CardHeader className="pb-3 pt-4"><CardTitle className="text-md flex justify-between items-center"><span>{batch.typeName}</span><Badge>{batch.status}</Badge></CardTitle><CardDescription className="text-xs">{t('started')}: {format(new Date(batch.startDate), 'PPP')}</CardDescription></CardHeader>
                                <CardContent className="text-sm"><p><strong className="font-medium">{t('ingredients')}:</strong> {batch.ingredients}</p><div className="mt-2 flex items-center text-primary gap-2 p-2 bg-primary/10 rounded-md"><Clock className="h-5 w-5"/><div><p className="font-semibold">{batch.nextStep}</p><p>{t('nextStepOn')}: {format(new Date(batch.nextStepDate), 'PPP')}</p></div></div></CardContent>
                                <CardFooter className="justify-end gap-2"><Button size="sm" onClick={() => handleUpdateStatus(batch.id, 'Ready')} disabled={!isActionable || updatingBatchId === batch.id}>{updatingBatchId === batch.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{t('markReady')}</Button></CardFooter>
                            </Card>
                        )
                    })
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg"><p>{t('noFermentingBatches')}</p></div>
                )}
            </div>

            <Separator className="my-6"/>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('readyBatchesTitle')}</h3>
                {isLoadingBatches ? (
                    <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>
                ) : readyBatches.length > 0 ? (
                    readyBatches.map(batch => (
                        <Card key={batch.id} className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CardHeader className="pb-3 pt-4"><CardTitle className="text-md flex justify-between items-center"><span>{batch.typeName}</span><Badge variant="default" className="bg-green-600 hover:bg-green-700">{batch.status}</Badge></CardTitle><CardDescription className="text-xs">{t('readySince')}: {format(new Date(batch.nextStepDate), 'PPP')}</CardDescription></CardHeader>
                            <CardContent className="text-sm"><p><strong className="font-medium">{t('ingredients')}:</strong> {batch.ingredients}</p><p><strong className="font-medium">{t('quantity')}:</strong> {batch.quantityProduced} {batch.unit}</p></CardContent>
                            <CardFooter className="justify-end gap-2"><Button variant="secondary" size="sm" disabled={updatingBatchId === batch.id} onClick={() => toast({ title: "Coming Soon!", description: "The ability to log usage against a crop is coming next."})}><Package className="h-4 w-4 mr-2"/>{t('logUsage')}</Button><Button variant="outline" size="sm" onClick={() => handleUpdateStatus(batch.id, 'Archived')} disabled={updatingBatchId === batch.id}>{updatingBatchId === batch.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Archive className="h-4 w-4 mr-2"/>{t('archive')}</Button></CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg"><p>{t('noReadyBatches')}</p></div>
                )}
            </div>

            <Separator className="my-6"/>

            <div>
                {!showCreateForm ? (
                    <Button onClick={() => setShowCreateForm(true)}><PlusCircle className="mr-2 h-4 w-4"/> {t('startNewBatch')}</Button>
                ) : (
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold">{t('createNewBatchTitle')}</h3>
                        <div className="space-y-2"><Label htmlFor="knf-type">{t('form.typeLabel')}</Label><Select value={selectedInput} onValueChange={(value) => setSelectedInput(value as KnfInputType)}><SelectTrigger id="knf-type"><SelectValue placeholder={t('form.typePlaceholder')} /></SelectTrigger><SelectContent>{knfOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select></div>
                        {selectedInput && (
                             <>
                                <div className="space-y-2"><Label htmlFor="ingredients">{t('form.ingredientsLabel')}</Label><Input id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder={knfOptions.find(o => o.value === selectedInput)?.placeholder} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2"><Label htmlFor="quantity">{t('form.quantityLabel')}</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t('form.quantityPlaceholder')} /></div>
                                     <div className="space-y-2"><Label htmlFor="unit">{t('form.unitLabel')}</Label><Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={t('form.unitPlaceholder')} /></div>
                                </div>
                                <div className="space-y-2"><Label htmlFor="start-date">{t('form.startDateLabel')}</Label><Input id="start-date" type="date" value={startDate ? format(startDate, 'yyyy-MM-dd') : ''} onChange={(e) => setStartDate(e.target.valueAsDate || undefined)}/></div>
                                <div className="flex gap-2 pt-2"><Button onClick={handleStartBatch} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{isSubmitting ? t('form.startingButton') : t('form.startButton')}</Button><Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isSubmitting}>{t('cancel')}</Button></div>
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
