
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { createFarmSchema, type CreateFarmValues } from "@/lib/form-schemas";
import { ArrowLeft, Save, Home, Tractor, MapPin, Text, Droplets, Leaf, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { LandPlot } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CreateFarmPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  const createFarmCallable = useMemo(() => httpsCallable(functions, 'createFarm'), [functions]);

  const form = useForm<CreateFarmValues>({
    resolver: zodResolver(createFarmSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      size: "",
      farmType: undefined,
      irrigationMethods: "",
    },
  });

  async function onSubmit(data: CreateFarmValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: t('farmManagement.createFarm.authErrorTitle'),
        description: t('farmManagement.createFarm.authErrorDescription'),
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createFarmCallable(data);

      toast({
        title: t('farmManagement.createFarm.successTitle'),
        description: t('farmManagement.createFarm.successDescription', { name: data.name }),
      });

      router.push("/farm-management");
    } catch (error: any) {
      console.error("Error creating farm:", error);
      toast({
        variant: "destructive",
        title: t('farmManagement.createFarm.failTitle'),
        description: error.message || t('farmManagement.createFarm.failDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('farmManagement.backToHub')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('farmManagement.createFarm.title')}</CardTitle>
          </div>
          <CardDescription>{t('farmManagement.createFarm.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Text className="h-4 w-4 text-muted-foreground" />{t('farmManagement.createFarm.form.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('farmManagement.createFarm.form.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('farmManagement.createFarm.form.nameDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{t('farmManagement.createFarm.form.locationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('farmManagement.createFarm.form.locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('farmManagement.createFarm.form.locationDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><LandPlot className="h-4 w-4 text-muted-foreground" />{t('farmManagement.createFarm.form.sizeLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('farmManagement.createFarm.form.sizePlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('farmManagement.createFarm.form.sizeDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="farmType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Tractor className="h-4 w-4 text-muted-foreground" />{t('farmManagement.createFarm.form.typeLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('farmManagement.createFarm.form.typePlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="crop">{t('farmManagement.createFarm.form.typeCrop')}</SelectItem>
                          <SelectItem value="livestock">{t('farmManagement.createFarm.form.typeLivestock')}</SelectItem>
                          <SelectItem value="mixed">{t('farmManagement.createFarm.form.typeMixed')}</SelectItem>
                          <SelectItem value="aquaculture">{t('farmManagement.createFarm.form.typeAquaculture')}</SelectItem>
                          <SelectItem value="other">{t('farmManagement.createFarm.form.typeOther')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="irrigationMethods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4 text-muted-foreground" />{t('farmManagement.createFarm.form.irrigationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('farmManagement.createFarm.form.irrigationPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('farmManagement.createFarm.form.irrigationDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Leaf className="h-4 w-4 text-muted-foreground" />{t('farmManagement.createFarm.form.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('farmManagement.createFarm.form.descriptionPlaceholder')}
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('farmManagement.createFarm.submittingButton')}
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> {t('farmManagement.createFarm.submitButton')}</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
