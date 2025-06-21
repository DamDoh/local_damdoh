
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
  SelectItem as SelectRadixItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createMarketplaceItemSchema, type CreateMarketplaceItemValues } from "@/lib/form-schemas";
import { UNIFIED_MARKETPLACE_FORM_CATEGORIES, LISTING_TYPE_FORM_OPTIONS } from "@/lib/constants";
import { ArrowLeft, Save, Leaf, DollarSign, MapPin, FileText, Link as LinkIcon, ImageUp, PackageIcon, ListChecks, Wrench, LocateFixed, Tag, ShieldCheck, Warehouse, CalendarDays, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function CreateMarketplaceListingPage() {
  const { toast } = useToast();
  
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
      brand: "",
      condition: undefined,
      availabilityStatus: undefined,
      certifications: "",
    },
  });

  const watchedListingType = form.watch("listingType");

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
    // form.reset(); // Optionally reset form after submission
  }

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const formattedLocation = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
        form.setValue("location", formattedLocation, { shouldValidate: true });
        toast({
          title: "Location Fetched",
          description: `Location set to: ${formattedLocation}`,
        });
      },
      (error) => {
        let message = "Could not get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable permissions.";
        }
        toast({
          variant: "destructive",
          title: "Location Error",
          description: message,
        });
      }
    );
  };

  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Marketplace
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Marketplace Listing</CardTitle>
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
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select listing type (Product or Service)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LISTING_TYPE_FORM_OPTIONS.map((option) => {
                           let icon = null;
                           if (option.value === 'Product') {
                             icon = <PackageIcon className="mr-2 h-4 w-4" />;
                           } else if (option.value === 'Service') {
                             icon = <Wrench className="mr-2 h-4 w-4" />;
                           }
                          return (
                            <SelectRadixItem key={option.value} value={option.value} className="flex items-center">
                              {icon}
                              {option.label}
                            </SelectRadixItem>
                          );
                        })}
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
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category for your listing" />
                        </SelectTrigger>
                      </FormControl>
                       <SelectContent>
                        {UNIFIED_MARKETPLACE_FORM_CATEGORIES.map((option) => (
                          <SelectRadixItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectRadixItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedListingType === "Product" && (
                <>
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
                  <FormField
                      control={form.control}
                      name="relatedTraceabilityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-muted-foreground" />Related Traceability ID (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., batch-abc-123. Link to a specific harvest/batch." {...field} />
                          </FormControl>
                          <FormDescription>Link this product listing to a specific batch or harvest record for traceability.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </>
              )}

              {(watchedListingType === "Product" || watchedListingType === "Equipment") && (
                <>
                   <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />Brand (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., John Deere, Pioneer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground" />Condition (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectRadixItem value="New">New</SelectRadixItem>
                                    <SelectRadixItem value="Used">Used</SelectRadixItem>
                                    <SelectRadixItem value="Refurbished">Refurbished</SelectRadixItem>
                                </SelectContent>
                            </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-muted-foreground" />Certifications (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Organic, Fair Trade, ISO 9001" {...field} />
                          </FormControl>
                          <FormDescription>Comma-separated list of relevant certifications.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
              )}
              
              {watchedListingType === "Service" && (
                 <>
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
                    <FormField
                        control={form.control}
                        name="availabilityStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" />Availability Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select availability status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectRadixItem value="Available">Available</SelectRadixItem>
                                <SelectRadixItem value="Booking Required">Booking Required</SelectRadixItem>
                                <SelectRadixItem value="Limited Availability">Limited Availability</SelectRadixItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                    />
                 </>
              )}
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Location</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="e.g., Nairobi, Kenya or Central Valley, CA, or 'Remote'" {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={handleFetchLocation} aria-label="Use current location">
                        <LocateFixed className="h-4 w-4" />
                      </Button>
                    </div>
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
