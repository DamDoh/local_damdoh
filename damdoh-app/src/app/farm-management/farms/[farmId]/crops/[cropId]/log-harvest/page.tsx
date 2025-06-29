
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
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { useTranslation } from "react-i18next";

export default function LogHarvestPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string;
  const cropType = searchParams.get('cropType') || t('farmManagement.logHarvest.unknownCrop');

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [createdVtiId, setCreatedVtiId] = useState<string | null>(null);
  const { user } = useAuth();
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
        title: t('farmManagement.logHarvest.authErrorTitle'),
        description: t('farmManagement.logHarvest.authErrorDescription'),
      });
      return;
    }

    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      toast({
        title: t('farmManagement.logHarvest.offlineTitle'),
        description: t('farmManagement.logHarvest.offlineDescription'),
        variant: "default",
      });
      setSubmissionSuccess(true);
      setCreatedVtiId('offline-vti-placeholder');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        farmFieldId: cropId,
        cropType: cropType,
        yieldKg: data.yield_kg,
        qualityGrade: data.quality_grade,
        actorVtiId: user.uid,
        geoLocation: null,
      };

      const result = await handleHarvestEvent(payload);
      const newVtiId = (result.data as any)?.vtiId;
      setCreatedVtiId(newVtiId);

      toast({
        title: t('farmManagement.logHarvest.successTitle'),
        description: t('farmManagement.logHarvest.successDescription', { cropType, vtiId: newVtiId }),
      });
      setSubmissionSuccess(true);
    } catch (error: any) {
      console.error("Error logging harvest:", error);
      toast({
        variant: "destructive",
        title: t('farmManagement.logHarvest.failTitle'),
        description: error.message || t('farmManagement.logHarvest.failDescription'),
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
                    <CardTitle className="text-2xl pt-4">{t('farmManagement.logHarvest.successCardTitle')}</CardTitle>
                    <CardDescription>
                       {t('farmManagement.logHarvest.successCardDescription', { cropType, vtiId: createdVtiId })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button size="lg" className="w-full" asChild>
                       <Link href={`/traceability/batches/${createdVtiId}`}>
                            <GitBranch className="mr-2 h-4 w-4" /> {t('farmManagement.logHarvest.viewReportButton')}
                        </Link>
                    </Button>
                    <Button size="lg" className="w-full" asChild>
                        <Link href={`/marketplace/create?cropId=${createdVtiId}&cropName=${encodeURIComponent(cropType)}`}>
                            <DollarSign className="mr-2 h-4 w-4" /> {t('farmManagement.logHarvest.sellButton')}
                        </Link>
                    </Button>
                     <Button size="lg" variant="outline" className="w-full" onClick={handleResetForm}>
                        <RefreshCw className="mr-2 h-4 w-4" /> {t('farmManagement.logHarvest.logAnotherButton')}
                    </Button>
                </CardContent>
                 <CardFooter>
                    <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                        <Link href={`/farm-management/farms/${farmId}`}>
                           <ArrowLeft className="mr-2 h-4 w-4" /> {t('farmManagement.backToFarm')}
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
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('farmManagement.backToFarm')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Weight className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('farmManagement.logHarvest.title', { cropType })}</CardTitle>
          </div>
          <CardDescription>
            {t('farmManagement.logHarvest.description')}
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
                      <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{t('farmManagement.logHarvest.form.dateLabel')}</FormLabel>
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
                name="yield_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Weight className="h-4 w-4 text-muted-foreground" />{t('farmManagement.logHarvest.form.yieldLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('farmManagement.logHarvest.form.yieldPlaceholder')} {...field} />
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
                    <FormLabel className="flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground" />{t('farmManagement.logHarvest.form.qualityLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('farmManagement.logHarvest.form.qualityPlaceholder')} {...field} />
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{t('farmManagement.logHarvest.form.notesLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('farmManagement.logHarvest.form.notesPlaceholder')}
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('farmManagement.logHarvest.submittingButton')}
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> {t('farmManagement.logHarvest.submitButton')}</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

