"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, CalendarIcon, Scale, Beaker, FlaskConical, CircleDot } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logCropInputSchema, type LogCropInputValues } from "@/lib/form-schemas"; // Assuming you have this schema
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Calendar } from "@/components/ui/calendar"; // Assuming you have a Calendar component
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Assuming you have Popover components
import { format } from "date-fns";

// Assume a type for KNF batches if needed for the select
// interface KnfBatchOption {
//   id: string;
//   name: string;
// }

export default function LogCropInputPage() {
  const t = useTranslations('farmManagement.logInput');
  const { toast } = useToast();
  const router = useRouter();
  const { farmId, cropId } = useParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const functions = getFunctions(firebaseApp);
  const logCropInputCallable = useMemo(() => httpsCallable(functions, 'logCropInput'), [functions]);
  // Assume a callable for fetching KNF batches if needed
  // const getUserKnfBatchesCallable = useMemo(() => httpsCallable(functions, 'getUserKnfBatches'), [functions]);
  // const [knfBatches, setKnfBatches] = useState<KnfBatchOption[]>([]);


  const form = useForm<LogCropInputValues>({
    resolver: zodResolver(logCropInputSchema),
    defaultValues: {
      inputType: undefined,
      inputDetails: "",
      applicationDate: new Date(), // Default to today
      quantity: 0,
      unit: "",
      applicationMethod: "",
      knfBatchId: undefined, // For selecting KNF batch
    },
  });

  // Effect to fetch KNF batches if needed
  // useEffect(() => {
  //   if (!user) return;
  //   const fetchKnfBatches = async () => {
  //     try {
  //       const result = await getUserKnfBatchesCallable();
  //       // Filter for ready batches
  //       setKnfBatches((result.data as any[] || []).filter(b => b.status === 'Ready').map(b => ({ id: b.id, name: `${b.typeName} (${b.quantityProduced} ${b.unit})` })));
  //     } catch (error) {
  //       console.error("Failed to fetch KNF batches:", error);
  //       // Optionally show a toast here
  //     }
  //   };
  //   fetchKnfBatches();
  // }, [user, getUserKnfBatchesCallable]);


  const onSubmit = async (values: LogCropInputValues) => {
    if (!user) {
      toast({ title: t('toast.authErrorTitle'), description: t('toast.authErrorDescription'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        farmId: farmId as string,
        cropId: cropId as string,
        // Ensure date is sent as ISO string or Timestamp
        applicationDate: values.applicationDate.toISOString(),
        // Remove knfBatchId if inputType is not KNF, or ensure backend handles it
        // if (values.inputType !== 'KNF') delete payload.knfBatchId;
      };

      await logCropInputCallable(payload);

      toast({
        title: t('toast.success'),
        description: t('toast.description'),
      });
      form.reset();
      router.push(`/farm-management/farms/${farmId}/crops/${cropId}`); // Redirect back to crop detail
    } catch (error: any) {
      console.error("Error logging input:", error);
      const errorMessage = error.message || t('toast.fail');
      toast({
        title: t('toast.fail'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto text-center py-8">
        <CardHeader><CardTitle>{t('toast.authErrorTitle')}</CardTitle></CardHeader>
        <CardContent>
          <CardDescription>{t('toast.authErrorDescription')}</CardDescription>
          {/* Add a sign-in button if needed */}
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href={`/farm-management/farms/${farmId}/crops/${cropId}`} className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> {t('backLink')}
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="inputType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><CircleDot className="h-4 w-4 text-muted-foreground" />{t('typeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('typePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                        <SelectItem value="Pesticide">Pesticide</SelectItem>
                        <SelectItem value="Herbicide">Herbicide</SelectItem>
                        <SelectItem value="Fungicide">Fungicide</SelectItem>
                        <SelectItem value="KNF">KNF Input</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional field for selecting KNF batch */}
              {form.watch('inputType') === 'KNF' ? (
                 <FormField
                    control={form.control}
                    name="knfBatchId"
                    render={({ field }) => (
                       <FormItem>
                          <FormLabel className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-muted-foreground" />{t('useKNFLabel')}</FormLabel>
                          {/* This select needs to be populated with actual KNF batches */}
                          <Select onValueChange={field.onChange} value={field.value} >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('useKNFPlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                             {/* Replace with fetched knfBatches.map */}
                            <SelectContent>
                                {/* {knfBatches.map(batch => (
                                  <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                                ))} */}
                                 <SelectItem value="mock-knf-batch-1">Mock KNF Batch 1</SelectItem> {/* Placeholder */}
                                 <SelectItem value="mock-knf-batch-2">Mock KNF Batch 2</SelectItem> {/* Placeholder */}
                            </SelectContent>
                          </Select>
                          <FormDescription>{t('manualInputLabel')}</FormDescription> {/* repurposing this for now */}
                          <FormMessage />
                       </FormItem>
                    )}
                 />
              ) : (
                 <FormField
                    control={form.control}
                    name="inputDetails"
                    render={({ field }) => (
                       <FormItem>
                          <FormLabel className="flex items-center gap-2"><Beaker className="h-4 w-4 text-muted-foreground" />{t('manualInputLabel')}</FormLabel>
                          <FormControl>
                             <Input placeholder={t('manualInputPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                       </FormItem>
                    )}
                 />
              )}


              <FormField
                control={form.control}
                name="applicationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{t('dateLabel')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-[240px] pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
                              }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span> // Hardcoded - needs i18n
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4 text-muted-foreground" />{t('quantityLabel')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('quantityPlaceholder')} {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><CircleDot className="h-4 w-4 text-muted-foreground" />{t('unitLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('unitPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="applicationMethod"
                render={({ field }) => (\n                  <FormItem>\n                    <FormLabel className=\"flex items-center gap-2\"><Wrench className=\"h-4 w-4 text-muted-foreground\" />{t(\'methodLabel\')}</FormLabel>\n                    <FormControl>\n                      <Input placeholder={t(\'methodPlaceholder\')} {...field} />\n                    </FormControl>\n                    <FormMessage />\n                  </FormItem>\n                )}\n              />


              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {t('saveButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}