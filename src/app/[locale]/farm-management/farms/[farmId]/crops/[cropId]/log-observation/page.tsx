
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createObservationSchema, type CreateObservationValues } from "@/lib/form-schemas";
import { ArrowLeft, Save, CalendarIcon, FileText, Loader2, NotebookPen, ImageUp, Eye, Sparkles, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { uploadFileAndGetURL } from '@/lib/storage-utils';
import { useTranslations, useLocale } from "next-intl";
import { getObservationTypes } from "@/lib/i18n-constants";
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { askFarmingAssistant } from "@/lib/server-actions";

export default function LogObservationPage() {
  const t = useTranslations('farmManagement.logObservation');
  const tConstants = useTranslations('constants');
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const locale = useLocale();
  const functions = getFunctions(firebaseApp);
  const { isOnline, addActionToQueue } = useOfflineSync();
  const handleObservationEvent = httpsCallable(functions, 'traceability-handleObservationEvent');

  const form = useForm<CreateObservationValues>({
    resolver: zodResolver(createObservationSchema),
    defaultValues: {
      observationType: "",
      observationDate: new Date(),
      details: "",
      imageFile: undefined,
    },
  });

  const observationTypes = getObservationTypes(tConstants);

  async function onSubmit(data: CreateObservationValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: t('toast.authErrorTitle'),
        description: t('toast.authErrorDescription'),
      });
      return;
    }

    setIsSubmitting(true);
    let imageUrl: string | undefined = undefined;
    let aiDiagnosis: any = null;
    let photoDataUri: string | undefined = undefined;

    try {
      if (data.imageFile) {
        toast({ title: t('toast.uploading'), description: t('toast.uploadingDescription') });
        
        // Convert file to data URI for AI analysis and potential offline queuing
        const reader = new FileReader();
        const dataUriPromise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
        reader.readAsDataURL(data.imageFile);
        photoDataUri = await dataUriPromise;
        
        // If online, upload to storage immediately
        if (isOnline) {
          imageUrl = await uploadFileAndGetURL(data.imageFile, `observations/${cropId}`);
        }

        if (isOnline) {
          toast({ title: t('toast.aiAnalyzing'), description: t('toast.aiDescription') });
          aiDiagnosis = await askFarmingAssistant({
              query: data.details,
              photoDataUri: photoDataUri,
              language: locale,
          });
          toast({ title: t('toast.aiComplete'), description: t('toast.aiCompleteDescription') });
        }
      }

      const payload = {
        farmFieldId: cropId,
        observationType: data.observationType,
        observationDate: data.observationDate.toISOString(),
        details: data.details,
        mediaUrls: imageUrl ? [imageUrl] : [],
        photoDataUri: photoDataUri, // Include for offline sync
        actorVtiId: user.uid,
        geoLocation: null,
        aiAnalysis: aiDiagnosis,
      };

      if (isOnline) {
        await handleObservationEvent(payload);
        toast({ title: t('toast.success'), description: t('toast.successDescription') });
      } else {
        await addActionToQueue({
            operation: 'handleObservationEvent',
            collectionPath: 'traceability_events',
            documentId: `observation-${Date.now()}`,
            payload: payload,
        });
        toast({ title: t('toast.queued.title'), description: t('toast.queued.description') });
      }
      router.push(`/farm-management/farms/${farmId}/crops/${cropId}`);

    } catch (error: any) {
      console.error("Error logging observation:", error);
      toast({
        variant: "destructive",
        title: t('toast.fail'),
        description: error.message || t('toast.failDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href={`/farm-management/farms/${farmId}/crops/${cropId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backLink')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <NotebookPen className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
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
                name="observationType"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="flex items-center gap-2"><Eye className="mr-2 h-4 w-4 text-muted-foreground" />{t('typeLabel')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('typePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {observationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                  control={form.control}
                  name="observationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                     <FormLabel className="flex items-center gap-2"><CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />{t('dateLabel')}</FormLabel>
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
                name="details"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="flex items-center gap-2"><FileText className="mr-2 h-4 w-4 text-muted-foreground" />{t('detailsLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('detailsPlaceholder')}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                     <FormLabel className="flex items-center gap-2"><ImageUp className="mr-2 h-4 w-4 text-muted-foreground" />{t('uploadLabel')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => onChange(e.target.files?.[0])}
                            className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary/10 file:text-primary
                              hover:file:bg-primary/20"
                            {...rest}
                          />
                        </div>
                      </FormControl>
                       <FormDescription className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="h-3 w-3 text-amber-500"/>
                        {t('uploadDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                 {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : isOnline ? (
                    <Save className="mr-2 h-4 w-4" />
                 ) : (
                    <WifiOff className="mr-2 h-4 w-4" />
                 )}
                 {isSubmitting ? t('processingButton') : (isOnline ? t('saveButton') : t('saveOfflineButton'))}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
