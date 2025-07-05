
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
import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCropPage() {
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  
  const getCropCallable = useMemo(() => httpsCallable(functions, 'getCrop'), [functions]);
  const updateCropCallable = useMemo(() => httpsCallable(functions, 'updateCrop'), [functions]);

  const form = useForm<CreateCropValues>({
    resolver: zodResolver(createCropSchema),
    defaultValues: {
      cropType: "",
      plantingDate: undefined,
      harvestDate: undefined,
      expectedYield: "",
      currentStage: undefined,
      notes: "",
    },
  });

  const fetchCropData = useCallback(async () => {
    setIsLoading(true);
    try {
        const result = await getCropCallable({ cropId });
        const cropData = result.data as any; // Cast to any to handle Firestore Timestamps
        if (cropData) {
            form.reset({
                ...cropData,
                plantingDate: cropData.plantingDate ? new Date(cropData.plantingDate) : undefined,
                harvestDate: cropData.harvestDate ? new Date(cropData.harvestDate) : undefined,
            });
        } else {
             toast({ title: "Crop not found", description: "Could not load crop data for editing.", variant: "destructive" });
            router.push(`/farm-management/farms/${farmId}`);
        }
    } catch (error: any) {
        toast({ title: "Error", description: `Failed to load crop data: ${error.message}`, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [cropId, getCropCallable, form, toast, router, farmId]);

  useEffect(() => {
      if (user) {
          fetchCropData();
      }
  }, [user, fetchCropData]);

  async function onSubmit(data: CreateCropValues) {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const payload = {
        cropId,
        ...data,
        plantingDate: data.plantingDate?.toISOString(),
        harvestDate: data.harvestDate?.toISOString(),
      };
      
      await updateCropCallable(payload);

      toast({
        title: "Crop Updated Successfully!",
        description: `Your crop "${data.cropType}" has been updated.`,
      });

      router.push(`/farm-management/farms/${farmId}/crops/${cropId}`);
    } catch (error: any) {
      console.error("Error updating crop:", error);
      toast({
        variant: "destructive",
        title: "Failed to Update Crop",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
      return (
          <div className="space-y-6">
            <Skeleton className="h-10 w-48"/>
             <Card className="max-w-2xl mx-auto">
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-full"/>
                </CardContent>
            </Card>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href={`/farm-management/farms/${farmId}/crops/${cropId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Crop Journey
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Edit Crop/Livestock Details</CardTitle>
          </div>
          <CardDescription>
            Update the information for this crop batch.
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
                    <FormLabel className="flex items-center gap-2"><Text className="h-4 w-4 text-muted-foreground" />Crop/Livestock Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Maize (DKC 90-89), Holstein Cow, Broiler Chicken Batch" {...field} />
                    </FormControl>
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
                      <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />Planting / Acquisition Date</FormLabel>
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
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                      <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />Expected Harvest Date (Opt.)</FormLabel>
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
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                    <FormLabel className="flex items-center gap-2"><BarChart className="h-4 w-4 text-muted-foreground" />Expected Yield (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5 Tons, 2000 Liters of milk" {...field} />
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
                    <FormLabel className="flex items-center gap-2"><HardHat className="h-4 w-4 text-muted-foreground" />Current Stage (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Planting">Planting</SelectItem>
                        <SelectItem value="Vegetative">Vegetative</SelectItem>
                        <SelectItem value="Flowering">Flowering</SelectItem>
                        <SelectItem value="Fruiting">Fruiting</SelectItem>
                        <SelectItem value="Harvesting">Harvesting</SelectItem>
                        <SelectItem value="Post-Harvest">Post-Harvest</SelectItem>
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this crop, such as plot location, seed source, or initial observations."
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
