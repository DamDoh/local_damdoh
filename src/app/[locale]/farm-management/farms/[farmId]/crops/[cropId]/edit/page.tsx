
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
import { createCropSchema, type CreateCropValues } from "@/lib/form-schemas";
import { ArrowLeft, Save, Sprout, CalendarIcon, Text, BarChart, HardHat, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { getCropStages } from "@/lib/i18n-constants";

export default function EditCropPage() {
  const t = useTranslations('farmManagement.createCrop'); // Re-use create translations
  const tEdit = useTranslations('farmManagement.editCrop');
  const tConstants = useTranslations('constants');
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  
  const getCropCallable = useMemo(() => httpsCallable(functions, 'getCrop'), [functions]);
  const updateCropCallable = useMemo(() => httpsCallable(functions, 'updateCrop'), [functions]);

  const form = useForm<CreateCropValues>({
    resolver: zodResolver(createCropSchema),
    defaultValues: {
      farmId: farmId,
      cropType: "",
      plantingDate: undefined,
      harvestDate: undefined,
      expectedYield: "",
      currentStage: undefined,
      notes: "",
    },
  });

  const fetchCropData = useCallback(async () => {
    setIsLoading(true);
    try {
        const result = await getCropCallable({ cropId });
        const cropData = result.data as any; // Cast to any to handle Firestore Timestamps
        if (cropData) {
            form.reset({
                ...cropData,
                plantingDate: cropData.plantingDate ? new Date(cropData.plantingDate) : undefined,
                harvestDate: cropData.harvestDate ? new Date(cropData.harvestDate) : undefined,
            });
        } else {
             toast({ title: tEdit('toast.notFound'), description: tEdit('toast.loadError'), variant: "destructive" });
            router.push(`/farm-management/farms/${farmId}`);
        }
    } catch (error: any) {
        toast({ title: tEdit('toast.error'), description: tEdit('toast.loadFail', {message: error.message}), variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [cropId, getCropCallable, form, toast, router, farmId, tEdit]);

  useEffect(() => {
      if (user) {
          fetchCropData();
      }
  }, [user, fetchCropData]);

  async function onSubmit(data: CreateCropValues) {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const payload = {
        cropId,
        ...data,
        plantingDate: data.plantingDate?.toISOString(),
        harvestDate: data.harvestDate?.toISOString(),
      };
      
      await updateCropCallable(payload);

      toast({
        title: tEdit('toast.success'),
        description: tEdit('toast.description', {cropType: data.cropType}),
      });

      router.push(`/farm-management/farms/${farmId}/crops/${cropId}`);
    } catch (error: any) {
      console.error("Error updating crop:", error);
      toast({
        variant: "destructive",
        title: tEdit('toast.fail'),
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const cropStages = getCropStages(tConstants);


  if (isLoading) {
      return (
          <div className="space-y-6">
            <Skeleton className="h-10 w-48"/>
             <Card className="max-w-2xl mx-auto">
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-full"/>
                </CardContent>
            </Card>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href={`/farm-management/farms/${farmId}/crops/${cropId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {tEdit('backLink')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{tEdit('title')}</CardTitle>
          </div>
          <CardDescription>
            {tEdit('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Text className="h-4 w-4 text-muted-foreground" />{t('cropTypeLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('cropTypePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="plantingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{t('plantingDateLabel')}</FormLabel>
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
                              {field.value ? format(field.value, "PPP") : <span>{t('datePlaceholder')}</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
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
                              {field.value ? format(field.value, "PPP") : <span>{t('datePlaceholder')}</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expectedYield"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><BarChart className="h-4 w-4 text-muted-foreground" />{t('yieldLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('yieldPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><HardHat className="h-4 w-4 text-muted-foreground" />{t('stageLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('stagePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cropStages.map(stage => (
                           <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tEdit('savingButton')}
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> {tEdit('saveButton')}</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
