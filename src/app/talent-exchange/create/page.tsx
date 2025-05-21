
"use client";

import Link from "next/link";
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
import { createTalentListingSchema, type CreateTalentListingValues } from "@/lib/form-schemas";
import { TALENT_FORM_OPTIONS, TALENT_LISTING_TYPE_FORM_OPTIONS } from "@/lib/constants";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateTalentListingPage() {
  const { toast } = useToast();

  const form = useForm<CreateTalentListingValues>({
    resolver: zodResolver(createTalentListingSchema),
    defaultValues: {
      title: "",
      description: "",
      type: undefined, 
      category: undefined,
      location: "",
      skillsRequired: "",
      compensation: "",
      contactInfo: "",
    },
  });

  function onSubmit(data: CreateTalentListingValues) {
    console.log("Talent Listing Data:", data);
    // Here you would typically send the data to your backend
    toast({
      title: "Listing Submitted (Simulated)",
      description: "Your talent/service listing has been created (details logged to console).",
    });
  }

  return (
    <div className="space-y-6">
      <Link href="/talent-exchange" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Talent Exchange
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Offer a Job or List a Service</CardTitle>
          <CardDescription>Fill in the details below to list your opportunity or service.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Experienced Agronomist, Tractor Repair Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about the job responsibilities, service offered, land features, equipment specifics, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select listing type (Job/Service)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TALENT_LISTING_TYPE_FORM_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TALENT_FORM_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nakuru, Kenya or Remote" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify where the job is based, land is located, or service is offered.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skillsRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills Required / Keywords (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Organic farming, Tractor operation, Irrigation" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of key skills, qualifications, or relevant keywords.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="compensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compensation / Terms (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $50,000/year, Project-based, Negotiable" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide details on salary, rates, lease terms, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information / Application Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Apply via DamDoh platform, email resume to jobs@example.com, or call +123456789 for inquiries"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      How should interested parties contact you or apply?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto">
                <Save className="mr-2 h-4 w-4" /> Create Listing
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
