

"use client";

import { useState, useMemo } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileText, MapPin, Tractor, Wrench, Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFarmSchema, type CreateFarmValues } from "@/lib/form-schemas";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { HttpsCallableResult } from "firebase/functions";

export default function CreateFarmPage() {
  const t = useTranslations('farmManagement.createFarm');
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const functions = getFunctions(firebaseApp);
  const createFarmCallable = useMemo(() => httpsCallable(functions, 'createFarm'), [functions]);

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

  const onSubmit = async (values: CreateFarmValues) => {
    if (!user) {
        toast({ title: t('toast.authErrorTitle'), description: t('toast.authErrorDescription'), variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        await createFarmCallable(values);
        toast({ // Use a unique key for success toast to avoid stacking
          title: t('toast.successTitle'),
          description: t('toast.successDescription', { farmName: values.name }),
          variant: "default",
          key: `create-farm-success-${Date.now()}`,
        });
        form.reset();
        router.push('/farm-management/farms');
    } catch(error: any) {
        let errorMessage = t('toast.errorDescription'); // Fallback generic message

        // Check if it's a Firebase HttpsError and use the message if available
        if (error && typeof error === 'object' && error.message) {
           // Assume backend sends translation key in error.message for HttpsError
            errorMessage = t(error.message as any);
        }

        console.error("Error creating farm:", error);
        toast({
          title: t('toast.errorTitle'),
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
        // No need to set a key here, as we want errors to stack if multiple happen
    }
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{t('form.farmNameLabel')}</FormLabel>
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
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{t('form.locationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('form.locationDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Circle className="h-4 w-4 text-muted-foreground" />{t('form.sizeLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.sizePlaceholder')} {...field} />
                    </FormControl>
                     <FormDescription>{t('form.sizeDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farmType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Tractor className="h-4 w-4 text-muted-foreground" />{t('form.typeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.typePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="crop">{t('form.types.crop')}</SelectItem>
                        <SelectItem value="livestock">{t('form.types.livestock')}</SelectItem>
                        <SelectItem value="mixed">{t('form.types.mixed')}</SelectItem>
                        <SelectItem value="aquaculture">{t('form.types.aquaculture')}</SelectItem>
                        <SelectItem value="other">{t('form.types.other')}</SelectItem>
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{t('form.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('form.descriptionPlaceholder')} {...field} />
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
                    <FormLabel className="flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" />{t('form.irrigationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.irrigationPlaceholder')} {...field} />
                    </FormControl>
                     <FormDescription>{t('form.irrigationDescription')}</FormDescription>
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
