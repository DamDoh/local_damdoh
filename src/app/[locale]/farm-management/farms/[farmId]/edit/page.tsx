
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
            toast({ title: "Farm not found", description: "Could not load farm data for editing.", variant: "destructive" });
            router.push('/farm-management/farms');
        }
    } catch (error: any) {
        toast({ title: "Error", description: `Failed to load farm data: ${error.message}`, variant: "destructive" });
    } finally {
        setIsLoadingData(false);
    }
  }, [farmId, getFarmCallable, form, toast, router]);

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
          title: "Farm Updated!",
          description: `Your farm "${values.name}" has been successfully updated.`,
        });
        router.push(`/farm-management/farms/${farmId}`);
    } catch(error: any) {
        console.error("Error updating farm:", error);
        toast({
          title: "Update Failed",
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
        <ArrowLeft className="mr-1 h-4 w-4"/> Back to Farm Details
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Farm Details</CardTitle>
          <CardDescription>Update the information for your farm.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Farm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Green Valley Organics" {...field} />
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
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rift Valley, Kenya" {...field} />
                    </FormControl>
                    <FormDescription>The general location of your farm.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Circle className="h-4 w-4 text-muted-foreground" />Size / Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 50 Hectares" {...field} />
                    </FormControl>
                     <FormDescription>Include the unit (e.g., acres, hectares).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farmType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Tractor className="h-4 w-4 text-muted-foreground" />Type of Farm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the primary type of your farm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="crop">Crop Farming</SelectItem>
                        <SelectItem value="livestock">Livestock Rearing</SelectItem>
                        <SelectItem value="mixed">Mixed (Crop & Livestock)</SelectItem>
                        <SelectItem value="aquaculture">Aquaculture (Fish Farming)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Short Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of your farm's focus or mission." {...field} />
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
                    <FormLabel className="flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" />Irrigation Methods (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Drip irrigation, Canal, Rain-fed" {...field} />
                    </FormControl>
                     <FormDescription>Describe the primary irrigation methods used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
