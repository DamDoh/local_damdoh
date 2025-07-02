
"use client";

import { useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const createFarmFormSchema = z.object({
  farmName: z.string().min(3, "Farm name must be at least 3 characters").max(100),
  location: z.string().min(5, "Location must be at least 5 characters").max(200),
  area: z.coerce.number().positive("Area must be a positive number"),
  unit: z.enum(["hectares", "acres"]),
});

export default function CreateFarmPage() {
  const t = useTranslations('FarmManagement.createFarm');
  const { toast } = useToast();
  const form = useForm<z.infer<typeof createFarmFormSchema>>({
    resolver: zodResolver(createFarmFormSchema),
    defaultValues: {
      farmName: "",
      location: "",
      area: 0,
      unit: "hectares",
    },
  });

  const onSubmit = async (values: z.infer<typeof createFarmFormSchema>) => {
    console.log("Creating farm:", values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: t('toast.successTitle'),
      description: t('toast.successDescription', { farmName: values.farmName }),
    });
    form.reset();
    // In a real app, you might redirect the user to the new farm's detail page or the farm list
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/farm-management/farms" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backToFarms')}
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
                name="farmName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.farmNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.farmNamePlaceholder')} {...field} />
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
                    <FormLabel>{t('form.locationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('form.locationDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.areaLabel')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.unitLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.unitPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hectares">{t('form.hectares')}</SelectItem>
                          <SelectItem value="acres">{t('form.acres')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('form.submitButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
