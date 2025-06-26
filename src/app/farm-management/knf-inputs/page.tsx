
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlaskConical, ArrowLeft, PlusCircle, Calendar, Clock, Edit2, Loader2, CheckCircle } from "lucide-react";
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


type KnfInputType = 'fpj' | 'faa' | 'wca' | 'imo' | 'lab';

interface ActiveBatch {
  id: string;
  type: KnfInputType;
  typeName: string;
  startDate: string; // ISO String
  ingredients: string;
  status: string;
  nextStep: string;
  nextStepDate: string; // ISO String
}

export default function KNFInputAssistantPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  
  const createKnfBatchCallable = useMemo(() => httpsCallable(functions, 'createKnfBatch'), [functions]);
  const getUserKnfBatchesCallable = useMemo(() => httpsCallable(functions, 'getUserKnfBatches'), [functions]);

  const [activeBatches, setActiveBatches] = useState<ActiveBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        setActiveBatches(result.data as ActiveBatch[]);
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
            {/* Active Batches Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Batches</h3>
                {isLoadingBatches ? (
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : activeBatches.length > 0 ? (
                    activeBatches.map(batch => (
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
                                <Button variant="outline" size="sm"><Edit2 className="h-3 w-3 mr-1"/> Log Activity</Button>
                                <Button size="sm"><CheckCircle className="h-3 w-3 mr-1"/> Mark as Complete</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>You have no active KNF input batches.</p>
                        <p>Start a new batch to begin tracking!</p>
                    </div>
                )}
            </div>

            <hr className="my-6"/>

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
