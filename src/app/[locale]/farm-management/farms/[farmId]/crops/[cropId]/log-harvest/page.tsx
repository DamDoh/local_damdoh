
"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createHarvestSchema, type CreateHarvestValues } from "@/lib/form-schemas";
import { ArrowLeft, Save, CalendarIcon, FileText, Loader2, Weight, Award, CheckCircle, RefreshCw, DollarSign, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useTranslations } from "next-intl";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function LogHarvestPage() {
  const t = useTranslations('farmManagement.logHarvest');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string; // This acts as our farmFieldId
  const cropType = searchParams.get('cropType') || 'Unknown Crop';

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [createdVtiId, setCreatedVtiId] = useState<string | null>(null);
  const { user } = useAuth();
  const { isOnline, addActionToQueue } = useOfflineSync();

  const functions = getFunctions(firebaseApp);
  const handleHarvestEvent = httpsCallable(functions, 'handleHarvestEvent');

  const form = useForm<CreateHarvestValues>({
    resolver: zodResolver(createHarvestSchema),
    defaultValues: {
      harvestDate: new Date(),
      yield_kg: undefined,
      quality_grade: "",
      notes: "",
    },
  });

  async function onSubmit(data: CreateHarvestValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to log a harvest.",
      });
      return;
    }
    
    setIsSubmitting(true);

    const payload = {
      farmFieldId: cropId,
      cropType: cropType,
      yieldKg: data.yield_kg,
      qualityGrade: data.quality_grade,
      actorVtiId: user.uid,
      geoLocation: null, // Placeholder for future location capture
    };

    if (!isOnline) {
      // Offline logic: Add to queue
      await addActionToQueue({
        operation: 'create', // This is a complex operation, we'll represent it as a single 'create'
        collectionPath: 'harvest_events', // Conceptual collection
        documentId: `harvest-${Date.now()}`,
        payload: payload,
      });
      setSubmissionSuccess(true);
      setCreatedVtiId('offline-vti-placeholder');
      setIsSubmitting(false);
      return;
    }
    
    // Online logic
    try {
      const result = await handleHarvestEvent(payload);
      const newVtiId = (result.data as any)?.vtiId;
      setCreatedVtiId(newVtiId);

      toast({
        title: t('success.title'),
        description: t('success.description', {cropType, vtiId: newVtiId}),
      });
      setSubmissionSuccess(true);
    } catch (error: any) {
      console.error("Error logging harvest:", error);
      toast({
        variant: "destructive",
        title: t('fail.title'),
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleResetForm = () => {
    form.reset();
    setSubmissionSuccess(false);
    setCreatedVtiId(null);
  }

  if (submissionSuccess && createdVtiId) {
    return (
       <div className="space-y-6 max-w-2xl mx-auto">
            <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900/30 rounded-full h-16 w-16 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl pt-4">{t('success.successCardTitle')}</CardTitle>
                    <CardDescription>
                       {createdVtiId === 'offline-vti-placeholder' 
                            ? t('offlineToast.description')
                            : t('success.successCardDescription', { cropType, vtiId: createdVtiId })
                       }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button size="lg" className="w-full" asChild disabled={createdVtiId === 'offline-vti-placeholder'}>
                       <Link href={`/traceability/batches/${createdVtiId}`}>
                            <GitBranch className="mr-2 h-4 w-4" /> {t('success.viewReportButton')}
                        </Link>
                    </Button>
                    <Button size="lg" className="w-full" asChild disabled={createdVtiId === 'offline-vti-placeholder'}>
                        <Link href={`/marketplace/create?vtiId=${createdVtiId}&productName=${encodeURIComponent(cropType)}`}>
                            <DollarSign className="mr-2 h-4 w-4" /> {t('success.sellButton')}
                        </Link>
                    </Button>
                     <Button size="lg" variant="outline" className="w-full" onClick={handleResetForm}>
                        <RefreshCw className="mr-2 h-4 w-4" /> {t('success.logAnotherButton')}
                    </Button>
                </CardContent>
                 <CardFooter>
                    <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                        <Link href={`/farm-management/farms/${farmId}`}>
                           <ArrowLeft className="mr-2 h-4 w-4" /> {t('success.backToFarmButton')}
                        </Link>
                    </Button>
                 </CardFooter>
            </Card>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href={`/farm-management/farms/${farmId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backLink')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Weight className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('title', {cropType})}</CardTitle>
          </div>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                  control={form.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{t('harvestDateLabel')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
              <FormField
                control={form.control}
                name="yield_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Weight className="h-4 w-4 text-muted-foreground" />{t('yieldLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('yieldPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quality_grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground" />{t('qualityLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('qualityPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{t('notesLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('notesPlaceholder')}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('savingButton')}
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> {t('saveButton')}</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
