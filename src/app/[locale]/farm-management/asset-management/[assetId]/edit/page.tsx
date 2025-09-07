
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Tractor, Calendar, DollarSign, FileText, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAssetSchema, type CreateAssetValues } from "@/lib/form-schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

function EditAssetSkeleton() {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
}

export default function EditAssetPage() {
  const t = useTranslations('farmManagement.editAsset');
  const tCreate = useTranslations('farmManagement.createAsset');
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  const assetId = params.assetId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const functions = getFunctions(firebaseApp);
  const getAssetCallable = useMemo(() => httpsCallable(functions, 'assetManagement-getAsset'), [functions]);
  const updateAssetCallable = useMemo(() => httpsCallable(functions, 'assetManagement-updateAsset'), [functions]);

  const form = useForm<CreateAssetValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: { name: "", type: undefined, purchaseDate: new Date(), value: undefined, currency: "USD", notes: "" },
  });

  const fetchAsset = useCallback(async () => {
    if (!user || !assetId) return;
    setIsLoading(true);
    try {
      const result = await getAssetCallable({ assetId });
      const data = result.data as any;
      form.reset({
        ...data,
        purchaseDate: new Date(data.purchaseDate),
        value: data.value ?? undefined
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      router.push('/farm-management/asset-management');
    } finally {
      setIsLoading(false);
    }
  }, [user, assetId, getAssetCallable, form, toast, router]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  const onSubmit = async (values: CreateAssetValues) => {
    setIsSubmitting(true);
    try {
      const payload = { ...values, assetId, purchaseDate: values.purchaseDate.toISOString() };
      await updateAssetCallable(payload);
      toast({ title: t('toast.successTitle'), description: t('toast.successDescription', { assetName: values.name }) });
      router.push('/farm-management/asset-management');
    } catch (error: any) {
      toast({ title: t('toast.errorTitle'), description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if(isLoading) {
      return <EditAssetSkeleton />
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/farm-management/asset-management" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Package className="h-4 w-4"/>{tCreate('form.nameLabel')}</FormLabel> <FormControl> <Input placeholder={tCreate('form.namePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Tractor className="h-4 w-4"/>{tCreate('form.typeLabel')}</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl> <SelectTrigger><SelectValue placeholder={tCreate('form.typePlaceholder')} /></SelectTrigger> </FormControl> <SelectContent> <SelectItem value="Machinery">{tCreate('form.types.machinery')}</SelectItem> <SelectItem value="Tool">{tCreate('form.types.tool')}</SelectItem> <SelectItem value="Building">{tCreate('form.types.building')}</SelectItem> <SelectItem value="Other">{tCreate('form.types.other')}</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="purchaseDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{tCreate('form.dateLabel')}</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} > <Calendar className="mr-2 h-4 w-4" /> {field.value ? format(field.value, "PPP") : <span>{tCreate('form.datePlaceholder')}</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="value" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4"/>{tCreate('form.valueLabel')}</FormLabel> <FormControl> <Input type="number" placeholder={tCreate('form.valuePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/>{tCreate('form.notesLabel')}</FormLabel> <FormControl> <Textarea placeholder={tCreate('form.notesPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />

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
