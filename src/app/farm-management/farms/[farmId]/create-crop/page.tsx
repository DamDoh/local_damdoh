
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
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";

export default function CreateCropPage() {
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  const createCropCallable = httpsCallable(functions, 'createCrop');

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

  async function onSubmit(data: CreateCropValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to add a crop.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        farmId: farmId,
        ownerId: user.uid, // The backend will verify this against the auth context
        cropType: data.cropType,
        plantingDate: data.plantingDate?.toISOString(),
        harvestDate: data.harvestDate?.toISOString(),
        expectedYield: data.expectedYield,
        currentStage: data.currentStage,
        notes: data.notes,
      };

      await createCropCallable(payload);

      toast({
        title: "Crop Added Successfully!",
        description: `Your new crop "${data.cropType}" has been registered.`,
      });

      router.push(`/farm-management/farms/${farmId}`);

    } catch (error: any) {
      console.error("Error creating crop:", error);
      toast({
        variant: "destructive",
        title: "Failed to Add Crop",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href={`/farm-management/farms/${farmId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farm Details
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Add New Crop/Livestock</CardTitle>
          </div>
          <CardDescription>
            Log a new crop, planting, or livestock batch for this farm to begin tracking its progress and activities.
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
                    <FormDescription>Be specific with the variety if known.</FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Crop</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
