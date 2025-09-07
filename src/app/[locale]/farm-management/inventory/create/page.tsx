
"use client";

import { useState, useMemo } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateInventoryItemPage() {
  const t = useTranslations('farmManagement.inventory.create');
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const functions = getFunctions(firebaseApp);
  const addInventoryItemCallable = useMemo(() => httpsCallable(functions, 'inventory-addInventoryItem'), [functions]);

  const form = useForm<CreateInventoryItemValues>({
    resolver: zodResolver(createInventoryItemSchema),
    defaultValues: {
      name: "",
      category: undefined,
      quantity: undefined,
      unit: "",
      purchaseDate: new Date(),
      expiryDate: undefined,
      supplier: "",
      notes: ""
    },
  });

  const onSubmit = async (values: CreateInventoryItemValues) => {
    if (!user) {
        toast({ title: t('toast.authErrorTitle'), description: t('toast.authErrorDescription'), variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        const payload = { 
            ...values, 
            purchaseDate: values.purchaseDate?.toISOString(),
            expiryDate: values.expiryDate?.toISOString()
        };
        await addInventoryItemCallable(payload);
        toast({
          title: t('toast.successTitle'),
          description: t('toast.successDescription', { itemName: values.name }),
        });
        form.reset();
        router.push('/farm-management/inventory');
    } catch(error: any) {
        console.error("Error creating inventory item:", error);
        toast({
          title: t('toast.errorTitle'),
          description: error.message || t('toast.errorDescription'),
          variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const itemCategories = [
    { value: 'Seeds', label: t('categories.seeds') },
    { value: 'Fertilizers', label: t('categories.fertilizers') },
    { value: 'Pesticides', label: t('categories.pesticides') },
    { value: 'Animal Feed', label: t('categories.animalFeed') },
    { value: 'Tools', label: t('categories.tools') },
    { value: 'Other', label: t('categories.other') },
  ];

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
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Package className="h-4 w-4"/>{t('form.nameLabel')}</FormLabel> <FormControl> <Input placeholder={t('form.namePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Tag className="h-4 w-4"/>{t('form.categoryLabel')}</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl> <SelectTrigger><SelectValue placeholder={t('form.categoryPlaceholder')} /></SelectTrigger> </FormControl> <SelectContent> {itemCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="quantity" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><CircleDot className="h-4 w-4"/>{t('form.quantityLabel')}</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 50" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="unit" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><CircleDot className="h-4 w-4"/>{t('form.unitLabel')}</FormLabel> <FormControl> <Input placeholder="e.g., kg, bags, liters" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="purchaseDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{t('form.purchaseDateLabel')}</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} > <Calendar className="mr-2 h-4 w-4" /> {field.value ? format(field.value, "PPP") : <span>{t('form.datePlaceholder')}</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="expiryDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{t('form.expiryDateLabel')}</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} > <Calendar className="mr-2 h-4 w-4" /> {field.value ? format(field.value, "PPP") : <span>{t('form.datePlaceholder')}</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="supplier" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4"/>{t('form.supplierLabel')}</FormLabel> <FormControl> <Input placeholder={t('form.supplierPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
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

    