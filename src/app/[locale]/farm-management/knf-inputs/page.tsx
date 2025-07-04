
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlaskConical, ArrowLeft, PlusCircle, Calendar, Clock, Edit2, Loader2, CheckCircle, Package, Archive, BookOpen, ListOrdered, Beaker } from "lucide-react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

type KnfInputType = 'fpj' | 'faa' | 'wca' | 'imo' | 'lab';

interface ActiveBatch extends KnfBatchType {
  // Frontend uses string dates for easier state management
  startDate: string; 
  nextStepDate: string;
}

const knfRecipeData = [
  {
    id: "fpj",
    name: "Fermented Plant Juice (FPJ)",
    description: "A fermented extract of a plant's sap and chlorophylls. Rich in enzymes and microorganisms, it's a potent growth enhancer for plants.",
    ingredients: [
      "1 kg of fast-growing plant parts (e.g., sweet potato tips, bamboo shoots)",
      "1 kg of brown sugar or molasses"
    ],
    steps: [
      "Collect plant materials before sunrise. Do not wash them.",
      "Roughly chop the plant materials.",
      "Add an equal weight of brown sugar and mix thoroughly.",
      "Pack tightly into a clay pot or glass jar (about 2/3 full).",
      "Cover with a breathable cloth and store in a cool, dark place.",
      "Let it ferment for 7 days. Strain the liquid.",
    ],
    usage: "Dilution ratio: 1:500 to 1:1000 with water. Apply as foliar spray or soil drench."
  },
  {
    id: "faa",
    name: "Fish Amino Acid (FAA)",
    description: "A powerful liquid fertilizer made from fish waste, rich in nitrogen and amino acids. Excellent for boosting plant growth, especially during the vegetative stage.",
    ingredients: [
      "1 kg of fish scraps (heads, bones, guts)",
      "1 kg of brown sugar or molasses"
    ],
    steps: [
      "Chop the fish parts into small pieces.",
      "In a container, layer the fish parts and brown sugar.",
      "Fill the container to about 2/3 capacity and cover with a breathable cloth.",
      "Store in a cool, dark place and let it ferment for at least 3-6 months.",
      "Strain the liquid before use."
    ],
    usage: "Dilution ratio: 1:1000 with water. Primarily used as a soil drench."
  }
];


export default function KNFInputAssistantPage() {
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
    { value: 'fpj', label: 'Fermented Plant Juice (FPJ)', placeholder: 'e.g., Sweet potato vine tips, Bamboo shoots' },
    { value: 'faa', label: 'Fish Amino Acid (FAA)', placeholder: 'e.g., Fish heads, bones, guts' },
    { value: 'wca', label: 'Water-Soluble Calcium (WCA)', placeholder: 'e.g., Crushed eggshells, Oyster shells' },
    { value: 'imo', label: 'Indigenous Microorganisms (IMO)', placeholder: 'e.g., Cooked rice from forest collection' },
    { value: 'lab', label: 'Lactic Acid Bacteria (LAB) Serum', placeholder: 'e.g., Rice wash water' },
  ];

  const fetchBatches = async () => {
    if (!user) {
        setIsLoadingBatches(false);
        return;
    };
    setIsLoadingBatches(true);
    try {
        const result = await getUserKnfBatchesCallable();
        const batches = (result.data as ActiveBatch[]) ?? []; // Use nullish coalescing for safety
        // Filter out archived batches from the main view
        setAllBatches(batches.filter(b => b.status !== 'Archived'));
    } catch (error) {
        console.error("Error fetching KNF batches:", error);
        toast({ title: "Could not load your batches", description: "There was an issue connecting to the database. Please try refreshing the page.", variant: "destructive" });
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
        toast({ title: "Please fill all required fields", variant: "destructive" });
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

        toast({ title: "Batch Started!", description: "Your new KNF batch is now being tracked." });
        
        setShowCreateForm(false);
        setSelectedInput('');
        setIngredients('');
        setStartDate(new Date());
        await fetchBatches();
    } catch (error) {
        console.error("Error creating KNF batch:", error);
        toast({ title: "Failed to start batch", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleUpdateStatus = async (batchId: string, newStatus: 'Ready' | 'Archived' | 'Used') => {
    setUpdatingBatchId(batchId);
    try {
        await updateKnfBatchStatusCallable({ batchId, status: newStatus });
        toast({ title: "Batch Updated!", description: `The batch has been marked as ${newStatus}.`});
        await fetchBatches(); // refetch data
    } catch (error) {
        console.error("Error updating batch status:", error);
        toast({ title: "Update failed", description: "Could not update the batch status.", variant: "destructive" });
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farm Management Hub
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">KNF Input Assistant</CardTitle>
          </div>
          <CardDescription>
            Your interactive guide to creating powerful, natural farming inputs. Track your batches and get timely reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5"/>KNF Recipe Guides</h3>
              <Accordion type="single" collapsible className="w-full">
                {knfRecipeData.map((recipe) => (
                  <AccordionItem value={recipe.id} key={recipe.id}>
                    <AccordionTrigger>{recipe.name}</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{recipe.description}</p>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><Beaker className="h-4 w-4"/>Ingredients</h4>
                        <ul className="list-disc list-inside pl-5 text-sm">
                          {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><ListOrdered className="h-4 w-4"/>Steps</h4>
                        <ol className="list-decimal list-inside pl-5 text-sm space-y-1">
                          {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                      </div>
                       <div>
                        <h4 className="font-semibold text-sm mb-1">Usage</h4>
                        <p className="text-sm">{recipe.usage}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <Separator className="my-6" />

            {/* Active Batches Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Batches (Fermenting)</h3>
                {isLoadingBatches ? (
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                    </div>
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
                                    <CardDescription className="text-xs">Started: {format(new Date(batch.startDate), 'PPP')}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <p><strong className="font-medium">Ingredients:</strong> {batch.ingredients}</p>
                                    <div className="mt-2 flex items-center text-primary gap-2 p-2 bg-primary/10 rounded-md">
                                        <Clock className="h-5 w-5"/>
                                        <div>
                                            <p className="font-semibold">{batch.nextStep}</p>
                                            <p>On or around: {format(new Date(batch.nextStepDate), 'PPP')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end gap-2">
                                    <Button size="sm" onClick={() => handleUpdateStatus(batch.id, 'Ready')} disabled={!isActionable || updatingBatchId === batch.id}>
                                        {updatingBatchId === batch.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Mark as Ready
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>You have no actively fermenting KNF batches.</p>
                    </div>
                )}
            </div>

            <Separator className="my-6"/>

             {/* Ready Batches Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ready Batches (Inventory)</h3>
                {isLoadingBatches ? (
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : readyBatches.length > 0 ? (
                    readyBatches.map(batch => (
                        <Card key={batch.id} className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CardHeader className="pb-3 pt-4">
                                <CardTitle className="text-md flex justify-between items-center">
                                    <span>{batch.typeName}</span>
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">{batch.status}</Badge>
                                </CardTitle>
                                <CardDescription className="text-xs">Ready since: {format(new Date(batch.nextStepDate), 'PPP')}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p><strong className="font-medium">Ingredients:</strong> {batch.ingredients}</p>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="secondary" size="sm" disabled={updatingBatchId === batch.id}><Package className="h-4 w-4 mr-2"/>Log Usage</Button>
                                <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(batch.id, 'Archived')} disabled={updatingBatchId === batch.id}>
                                    {updatingBatchId === batch.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    <Archive className="h-4 w-4 mr-2"/>Archive
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>You have no ready KNF inputs in your inventory.</p>
                    </div>
                )}
            </div>

            <Separator className="my-6"/>

            {/* Create New Batch Section */}
            <div>
                {!showCreateForm ? (
                    <Button onClick={() => setShowCreateForm(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Start New KNF Batch
                    </Button>
                ) : (
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold">Create New Batch</h3>
                        <div className="space-y-2">
                            <Label htmlFor="knf-type">Type of KNF Input</Label>
                            <Select value={selectedInput} onValueChange={(value) => setSelectedInput(value as KnfInputType)}>
                                <SelectTrigger id="knf-type">
                                <SelectValue placeholder="Select an input to create..." />
                                </SelectTrigger>
                                <SelectContent>
                                {knfOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {selectedInput && (
                             <>
                                <div className="space-y-2">
                                    <Label htmlFor="ingredients">Base Ingredients</Label>
                                    <Input 
                                        id="ingredients" 
                                        value={ingredients}
                                        onChange={(e) => setIngredients(e.target.value)}
                                        placeholder={knfOptions.find(o => o.value === selectedInput)?.placeholder} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">Start Date</Label>
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
                                        {isSubmitting ? 'Starting...' : 'Start Batch'}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isSubmitting}>Cancel</Button>
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
