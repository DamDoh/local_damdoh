
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileText, MapPin, Tractor, Wrench, Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFarmSchema, type CreateFarmValues } from "@/lib/form-schemas";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditFarmPage() {
  const t = useTranslations('farmManagement.editFarm');
  const tCreate = useTranslations('farmManagement.createFarm'); // Reuse for form labels
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const functions = getFunctions(firebaseApp);
  const getFarmCallable = useMemo(() => httpsCallable(functions, 'getFarm'), [functions]);
  const updateFarmCallable = useMemo(() => httpsCallable(functions, 'updateFarm'), [functions]);

  const form = useForm<CreateFarmValues>({
    resolver: zodResolver(createFarmSchema),
    defaultValues: {
      name: "",
      location: "",
      size: "",
      farmType: undefined,
      description: "",
      irrigationMethods: "",
    },
  });

  const fetchFarmData = useCallback(async () => {
    setIsLoadingData(true);
    try {
        const result = await getFarmCallable({ farmId });
        const farmData = result.data as CreateFarmValues;
        if (farmData) {
            form.reset(farmData);
        } else {
            toast({ title: t('toast.notFoundTitle'), description: t('toast.loadError'), variant: "destructive" });
            router.push('/farm-management/farms');
        }
    } catch (error: any) {
        toast({ title: "Error", description: t('toast.loadFail', { message: error.message }), variant: "destructive" });
    } finally {
        setIsLoadingData(false);
    }
  }, [farmId, getFarmCallable, form, toast, router, t]);

  useEffect(() => {
    if (user && farmId) {
        fetchFarmData();
    }
  }, [user, farmId, fetchFarmData]);


  const onSubmit = async (values: CreateFarmValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
        const payload = { ...values, farmId };
        await updateFarmCallable(payload);
        toast({
          title: t('toast.successTitle'),
          description: t('toast.successDescription', { farmName: values.name }),
        });
        router.push(`/farm-management/farms/${farmId}`);
    } catch(error: any) {
        console.error("Error updating farm:", error);
        toast({
          title: t('toast.errorTitle'),
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
      return (
          <div className="container mx-auto p-4 md:p-8">
              <Skeleton className="h-6 w-40 mb-4" />
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href={`/farm-management/farms/${farmId}`} className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backToFarm')}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{tCreate('form.farmNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tCreate('form.farmNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{tCreate('form.locationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tCreate('form.locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{tCreate('form.locationDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Circle className="h-4 w-4 text-muted-foreground" />{tCreate('form.sizeLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tCreate('form.sizePlaceholder')} {...field} />
                    </FormControl>
                     <FormDescription>{tCreate('form.sizeDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farmType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Tractor className="h-4 w-4 text-muted-foreground" />{tCreate('form.typeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={tCreate('form.typePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="crop">{tCreate('form.types.crop')}</SelectItem>
                        <SelectItem value="livestock">{tCreate('form.types.livestock')}</SelectItem>
                        <SelectItem value="mixed">{tCreate('form.types.mixed')}</SelectItem>
                        <SelectItem value="aquaculture">{tCreate('form.types.aquaculture')}</SelectItem>
                        <SelectItem value="other">{tCreate('form.types.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{tCreate('form.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={tCreate('form.descriptionPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="irrigationMethods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" />{tCreate('form.irrigationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tCreate('form.irrigationPlaceholder')} {...field} />
                    </FormControl>
                     <FormDescription>{tCreate('form.irrigationDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {t('form.submitButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


