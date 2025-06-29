
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
import { ArrowLeft, Save, CalendarIcon, FileText, Loader2, NotebookPen, ImageUp, Eye, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { uploadFileAndGetURL } from "@/lib/storage-utils";
import { askFarmingAssistant, type FarmingAssistantOutput } from "@/ai/flows/farming-assistant-flow";
import { useTranslation } from "react-i18next";

export default function LogObservationPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  const handleObservationEvent = httpsCallable(functions, 'handleObservationEvent');

  const form = useForm<CreateObservationValues>({
    resolver: zodResolver(createObservationSchema),
    defaultValues: {
      observationType: "",
      observationDate: new Date(),
      details: "",
      imageFile: undefined,
    },
  });

  async function onSubmit(data: CreateObservationValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: t('farmManagement.logObservation.authErrorTitle'),
        description: t('farmManagement.logObservation.authErrorDescription'),
      });
      return;
    }

    setIsSubmitting(true);
    let mediaUrls: string[] = [];
    let aiAnalysisResult: FarmingAssistantOutput | null = null;

    if (data.imageFile) {
      toast({ title: t('farmManagement.logObservation.aiAnalysisTitle'), description: t('farmManagement.logObservation.aiAnalysisDescription') });
      try {
        const getFileDataUri = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        
        const photoDataUri = await getFileDataUri(data.imageFile);
        
        aiAnalysisResult = await askFarmingAssistant({
            query: data.details,
            photoDataUri: photoDataUri,
            language: 'en'
        });

        toast({ title: t('farmManagement.logObservation.aiSuccessTitle'), description: t('farmManagement.logObservation.aiSuccessDescription') });
      } catch (aiError: any) {
        console.error("Error during AI analysis:", aiError);
        toast({ variant: "destructive", title: t('farmManagement.logObservation.aiFailTitle'), description: aiError.message || t('farmManagement.logObservation.aiFailDescription')});
      }
    }

    try {
      if (data.imageFile) {
        toast({ title: t('farmManagement.logObservation.uploadingTitle'), description: t('farmManagement.logObservation.uploadingDescription') });
        const imageUrl = await uploadFileAndGetURL(data.imageFile, `observations/${cropId}`);
        mediaUrls.push(imageUrl);
        toast({ title: t('farmManagement.logObservation.uploadSuccessTitle'), variant: "default" });
      }

      const payload = {
        farmFieldId: cropId,
        observationType: data.observationType,
        observationDate: data.observationDate.toISOString(),
        details: data.details,
        mediaUrls: mediaUrls,
        actorVtiId: user.uid,
        geoLocation: null, 
        aiAnalysis: aiAnalysisResult,
      };

      await handleObservationEvent(payload);

      toast({
        title: t('farmManagement.logObservation.logSuccessTitle'),
        description: t('farmManagement.logObservation.logSuccessDescription'),
      });

      router.push(`/farm-management/farms/${farmId}`);
    } catch (error: any) {
      console.error("Error logging observation:", error);
      toast({
        variant: "destructive",
        title: t('farmManagement.logObservation.logFailTitle'),
        description: error.message || t('farmManagement.logObservation.logFailDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href={`/farm-management/farms/${farmId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('farmManagement.backToFarm')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <NotebookPen className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('farmManagement.logObservation.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('farmManagement.logObservation.description')}
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
                    <FormLabel className="flex items-center gap-2"><Eye className="h-4 w-4 text-muted-foreground" />{t('farmManagement.logObservation.form.typeLabel')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('farmManagement.logObservation.form.typePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pest Sighting">{t('farmManagement.logObservation.form.typePest')}</SelectItem>
                        <SelectItem value="Disease Symptom">{t('farmManagement.logObservation.form.typeDisease')}</SelectItem>
                        <SelectItem value="Weed Growth">{t('farmManagement.logObservation.form.typeWeed')}</SelectItem>
                        <SelectItem value="Crop Health Update">{t('farmManagement.logObservation.form.typeHealth')}</SelectItem>
                        <SelectItem value="Weather Event">{t('farmManagement.logObservation.form.typeWeather')}</SelectItem>
                        <SelectItem value="Other">{t('farmManagement.logObservation.form.typeOther')}</SelectItem>
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
                      <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{t('farmManagement.logObservation.form.dateLabel')}</FormLabel>
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
                              {field.value ? format(field.value, "PPP") : <span>{t('farmManagement.createCrop.form.datePlaceholder')}</span>}
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{t('farmManagement.logObservation.form.detailsLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('farmManagement.logObservation.form.detailsPlaceholder')}
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
                      <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4 text-muted-foreground" />{t('farmManagement.logObservation.form.imageLabel')}</FormLabel>
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
                       <FormDescription>
                        {t('farmManagement.logObservation.form.imageDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('farmManagement.logObservation.submittingButton')}
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> {t('farmManagement.logObservation.submitButton')}</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

