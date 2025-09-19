
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Package, Calendar, DollarSign, FileText, Tag, CircleDot } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInventoryItemSchema, type CreateInventoryItemValues } from "@/lib/form-schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-utils";
import { apiCall } from '@/lib/api-utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

function EditInventorySkeleton() {
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

export default function EditInventoryItemPage() {
  const t = useTranslations('farmManagement.inventory.edit');
  const tCreate = useTranslations('farmManagement.inventory.create');
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  const itemId = params.itemId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateInventoryItemValues>({
    resolver: zodResolver(createInventoryItemSchema),
    defaultValues: { name: "", category: undefined, quantity: undefined, unit: "", purchaseDate: undefined, expiryDate: undefined, supplier: "", notes: "" },
  });

  const fetchItem = useCallback(async () => {
    if (!user || !itemId) return;
    setIsLoading(true);
    try {
      const data = await apiCall<any>(`/inventory/items/${itemId}`);
      form.reset({
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      router.push('/farm-management/inventory');
    } finally {
      setIsLoading(false);
    }
  }, [user, itemId, form, toast, router]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const onSubmit = async (values: CreateInventoryItemValues) => {
    setIsSubmitting(true);
    try {
      const payload = { ...values, purchaseDate: values.purchaseDate?.toISOString(), expiryDate: values.expiryDate?.toISOString() };
      await apiCall(`/inventory/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      toast({ title: t('toast.successTitle'), description: t('toast.successDescription', { itemName: values.name }) });
      router.push('/farm-management/inventory');
    } catch (error: any) {
      toast({ title: t('toast.errorTitle'), description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
    const itemCategories = [
    { value: 'Seeds', label: tCreate('categories.seeds') },
    { value: 'Fertilizers', label: tCreate('categories.fertilizers') },
    { value: 'Pesticides', label: tCreate('categories.pesticides') },
    { value: 'Animal Feed', label: tCreate('categories.animalFeed') },
    { value: 'Tools', label: tCreate('categories.tools') },
    { value: 'Other', label: tCreate('categories.other') },
  ];
  
  if(isLoading) {
      return <EditInventorySkeleton />
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/farm-management/inventory" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
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
              <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Tag className="h-4 w-4"/>{tCreate('form.categoryLabel')}</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl> <SelectTrigger><SelectValue placeholder={tCreate('form.categoryPlaceholder')} /></SelectTrigger> </FormControl> <SelectContent> {itemCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="quantity" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><CircleDot className="h-4 w-4"/>{tCreate('form.quantityLabel')}</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 50" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="unit" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><CircleDot className="h-4 w-4"/>{tCreate('form.unitLabel')}</FormLabel> <FormControl> <Input placeholder="e.g., kg, bags, liters" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="purchaseDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{tCreate('form.purchaseDateLabel')}</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} > <Calendar className="mr-2 h-4 w-4" /> {field.value ? format(field.value, "PPP") : <span>{tCreate('form.datePlaceholder')}</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="expiryDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{tCreate('form.expiryDateLabel')}</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} > <Calendar className="mr-2 h-4 w-4" /> {field.value ? format(field.value, "PPP") : <span>{tCreate('form.datePlaceholder')}</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="supplier" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4"/>{tCreate('form.supplierLabel')}</FormLabel> <FormControl> <Input placeholder={tCreate('form.supplierPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
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

    