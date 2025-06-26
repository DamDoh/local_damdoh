
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
import { useState } from "react";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { LandPlot } from "lucide-react";


export default function CreateFarmPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  const createFarmCallable = httpsCallable(functions, 'createFarm');

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
        title: "Not Authenticated",
        description: "You must be logged in to create a farm.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        ...data,
        owner_id: user.uid,
      };
      
      const result = await createFarmCallable(payload);

      console.log("Farm created successfully:", result.data);
      
      toast({
        title: "Farm Created Successfully!",
        description: `Your farm "${data.name}" has been registered.`,
      });

      router.push("/farm-management");
    } catch (error: any) {
      console.error("Error creating farm:", error);
      toast({
        variant: "destructive",
        title: "Failed to Create Farm",
        description: error.message || "An error occurred while saving the farm. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farmer's Hub
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Register a New Farm</CardTitle>
          </div>
          <CardDescription>
            Add a new agricultural property to your profile. This information helps in planning, tracking, and connecting with relevant services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Text className="h-4 w-4 text-muted-foreground" />Farm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Green Valley Acres, Sunrise Livestock Farm" {...field} />
                    </FormControl>
                    <FormDescription>Give your farm a recognizable name.</FormDescription>
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
                      <Input placeholder="e.g., Nakuru County, Kenya or Central Valley, California" {...field} />
                    </FormControl>
                    <FormDescription>Specify the general location, region, or address of your farm.</FormDescription>
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
                      <FormLabel className="flex items-center gap-2"><LandPlot className="h-4 w-4 text-muted-foreground" />Total Size</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10 Hectares, 25 Acres" {...field} />
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
                      <FormLabel className="flex items-center gap-2"><Tractor className="h-4 w-4 text-muted-foreground" />Primary Farm Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select farm type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="crop">Crop Production</SelectItem>
                          <SelectItem value="livestock">Livestock</SelectItem>
                          <SelectItem value="mixed">Mixed (Crop & Livestock)</SelectItem>
                          <SelectItem value="aquaculture">Aquaculture</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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
                    <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4 text-muted-foreground" />Irrigation Methods (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Drip irrigation, Sprinklers, Rain-fed" {...field} />
                    </FormControl>
                    <FormDescription>List the primary methods you use for watering.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Leaf className="h-4 w-4 text-muted-foreground" />Brief Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share a bit more about your farm, like main crops/livestock, farming philosophy (e.g., organic, regenerative), or unique features."
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
                    <><Save className="mr-2 h-4 w-4" /> Save Farm</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
