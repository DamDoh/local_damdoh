
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createMarketplaceItemSchema, type CreateMarketplaceItemValues } from "@/lib/form-schemas";
import { UNIFIED_MARKETPLACE_FORM_CATEGORIES, LISTING_TYPE_FORM_OPTIONS } from "@/lib/constants";
import { ArrowLeft, Save, UploadCloud, Leaf, ShoppingBag, Briefcase, LandPlot, Tractor, DollarSign, Settings2, MapPin, FileText, Link as LinkIcon, ImageUp, PackageIcon, ListChecks, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CreateMarketplaceListingPage() {
  const { toast } = useToast();
  const [currentListingType, setCurrentListingType] = useState<"Product" | "Service" | undefined>(undefined);

  const form = useForm<CreateMarketplaceItemValues>({
    resolver: zodResolver(createMarketplaceItemSchema),
    defaultValues: {
      name: "",
      listingType: undefined,
      description: "",
      price: undefined, 
      currency: "USD",
      perUnit: "",
      category: undefined, 
      isSustainable: false,
      location: "",
      imageUrl: "",
      imageFile: undefined,
      contactInfo: "",
      skillsRequired: "",
      compensation: "",
    },
  });

  function onSubmit(data: CreateMarketplaceItemValues) {
    console.log("Marketplace Listing Data:", data);
    if (data.imageFile) {
      console.log("Uploaded file details:", {
        name: data.imageFile.name,
        size: data.imageFile.size,
        type: data.imageFile.type,
      });
    }
    toast({
      title: "Listing Submitted (Simulated)",
      description: "Your marketplace listing has been created (details logged to console).",
    });
    // form.reset(); 
  }

  const watchedListingType = form.watch("listingType");

  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Marketplace
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Listing</CardTitle>
          <CardDescription>List your agricultural product, equipment, land, or professional service.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><PackageIcon className="h-4 w-4 text-muted-foreground" />Listing Name / Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Organic Hass Avocados, Agronomy Consulting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-muted-foreground" />Listing Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setCurrentListingType(value as "Product" | "Service");
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select listing type (Product or Service)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LISTING_TYPE_FORM_OPTIONS.map((option) => (
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about the item, quality, quantity, service scope, terms, specifications, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedListingType === "Product" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g., 25.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., USD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="perUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Per Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., /kg, /ton, /item" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {watchedListingType === "Service" && (
                 <FormField
                    control={form.control}
                    name="compensation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />Compensation / Rate</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., $75/hour, Project-based, Negotiable" {...field} />
                        </FormControl>
                         <FormDescription>Describe payment terms for the service.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}


              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-muted-foreground" />Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category for your listing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIFIED_MARKETPLACE_FORM_CATEGORIES.map((option) => (
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
              
              {watchedListingType === "Product" && (
                <FormField
                  control={form.control}
                  name="isSustainable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center">
                          <Leaf className="mr-2 h-4 w-4 text-green-600" />
                          Sustainable Product
                        </FormLabel>
                        <FormDescription>
                          Check this if your product promotes sustainable or regenerative agriculture.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              
              {watchedListingType === "Service" && (
                <FormField
                  control={form.control}
                  name="skillsRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" />Skills / Keywords (for services)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Organic farming, Tractor operation, Irrigation" {...field} />
                      </FormControl>
                      <FormDescription>Comma-separated list of key skills, qualifications, or relevant keywords for the service.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}


              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nairobi, Kenya or Central Valley, CA, or 'Remote'" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the city, region, port, or if it's a global/remote service.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-muted-foreground" />Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-image-host.com/image.png" {...field} />
                    </FormControl>
                     <FormDescription>
                      Link to an image for your listing if it's already hosted online.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageFile"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4 text-muted-foreground" />Or Upload Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        {/* <UploadCloud className="h-5 w-5 text-muted-foreground" /> Input component already has icon styling if needed */}
                        <Input 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20"
                          {...rest}
                        />
                      </div>
                    </FormControl>
                     <FormDescription>
                      Upload an image from your device (max 5MB, JPG/PNG/WEBP).
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
                    <FormLabel className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" />Contact Information / Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Contact via DamDoh platform, or email@example.com, or call +123456789"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      How should interested parties contact you?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : <><Save className="mr-2 h-4 w-4" /> Create Listing</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

