
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
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { useTranslations } from "next-intl";

export default function CreateCropPage() {
  const t = useTranslations('farmManagement.createCrop');
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  const createCropCallable = useMemo(() => httpsCallable(functions, 'createCrop'), [functions]);

  const form = useForm<CreateCropValues>({
    resolver: zodResolver(createCropSchema),
    defaultValues: {
      cropType: "",
      plantingDate: new Date(),
      harvestDate: undefined,
      expectedYield: "",
      currentStage: undefined,
      notes: "",
    },
  });

  async function onSubmit(data: CreateCropValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: t('toast.authErrorTitle'),
        description: t('toast.authErrorDescription'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        farmId: farmId,
        cropType: data.cropType,
        plantingDate: data.plantingDate?.toISOString(),
        harvestDate: data.harvestDate?.toISOString(),
        expectedYield: data.expectedYield,
        currentStage: data.currentStage,
        notes: data.notes,
      };

      await createCropCallable(payload);

      toast({
        title: t('toast.successTitle'),
        description: t('toast.successDescription', { cropType: data.cropType }),
      });

      router.push(`/farm-management/farms/${farmId}`);

    } catch (error: any) {
      console.error("Error creating crop:", error);
      toast({
        variant: "destructive",
        title: t('toast.failTitle'),
        description: error.message || t('toast.failDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const cropStages = Object.keys(t.raw('stages')).map(key => ({
    value: key,
    label: t(`stages.${key}`)
  }));


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
            <Sprout className="h-7 w-7 text-primary" />
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
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Text className="h-4 w-4 text-muted-foreground mr-1" />{t('cropTypeLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('cropTypePlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('cropTypeDescription')}</FormDescription>
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
                      <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground mr-1" />{t('plantingDateLabel')}</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

    