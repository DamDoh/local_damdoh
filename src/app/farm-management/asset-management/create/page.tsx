
"use client";

import { useState, useMemo } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function CreateAssetPage() {
  const t = useTranslations('farmManagement.createAsset');
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const functions = getFunctions(firebaseApp);
  const addAssetCallable = useMemo(() => httpsCallable(functions, 'assetManagement-addAsset'), [functions]);

  const form = useForm<CreateAssetValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: "",
      type: undefined,
      purchaseDate: new Date(),
      value: undefined,
      currency: "USD",
      notes: ""
    },
  });

  const onSubmit = async (values: CreateAssetValues) => {
    if (!user) {
        toast({ title: t('toast.authErrorTitle'), description: t('toast.authErrorDescription'), variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        const payload = { ...values, purchaseDate: values.purchaseDate.toISOString() };
        await addAssetCallable(payload);
        toast({
          title: t('toast.successTitle'),
          description: t('toast.successDescription', { assetName: values.name }),
        });
        form.reset();
        router.push('/farm-management/asset-management');
    } catch(error: any) {
        console.error("Error creating asset:", error);
        toast({
          title: t('toast.errorTitle'),
          description: error.message || t('toast.errorDescription'),
          variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

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
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Package className="h-4 w-4"/>{t('form.nameLabel')}</FormLabel> <FormControl> <Input placeholder={t('form.namePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Tractor className="h-4 w-4"/>{t('form.typeLabel')}</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl> <SelectTrigger><SelectValue placeholder={t('form.typePlaceholder')} /></SelectTrigger> </FormControl> <SelectContent> <SelectItem value="Machinery">{t('form.types.machinery')}</SelectItem> <SelectItem value="Tool">{t('form.types.tool')}</SelectItem> <SelectItem value="Building">{t('form.types.building')}</SelectItem> <SelectItem value="Other">{t('form.types.other')}</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="purchaseDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{t('form.dateLabel')}</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} > <Calendar className="mr-2 h-4 w-4" /> {field.value ? format(field.value, "PPP") : <span>{t('form.datePlaceholder')}</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="value" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4"/>{t('form.valueLabel')}</FormLabel> <FormControl> <Input type="number" placeholder={t('form.valuePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/>{t('form.notesLabel')}</FormLabel> <FormControl> <Textarea placeholder={t('form.notesPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />

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

