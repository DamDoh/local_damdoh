
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createMarketplaceItemSchema, type CreateMarketplaceItemValues } from "@/lib/form-schemas";
import { MARKETPLACE_FORM_OPTIONS } from "@/lib/constants";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function CreateMarketplaceListingPage() {
  const { toast } = useToast();

  const form = useForm<CreateMarketplaceItemValues>({
    resolver: zodResolver(createMarketplaceItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "USD",
      perUnit: "",
      category: undefined, 
      location: "",
      imageUrl: "",
      imageFile: undefined,
      contactInfo: "",
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
      // In a real app, you would upload data.imageFile to your backend/storage
      // and get a URL back to store, potentially replacing or supplementing data.imageUrl.
    }
    toast({
      title: "Listing Submitted (Simulated)",
      description: "Your marketplace listing has been created (details logged to console).",
    });
  }

  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Marketplace
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Marketplace Listing</CardTitle>
          <CardDescription>Fill in the details below to list your product, equipment, or service.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Name / Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Organic Hass Avocados (Bulk)" {...field} />
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
                        placeholder="Provide details about the item, quality, quantity, terms, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
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
                      <FormLabel>Per Unit (Optional)</FormLabel>
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category for your listing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MARKETPLACE_FORM_OPTIONS.map((option) => (
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nairobi, Kenya or Central Valley, CA" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the city, region, or port where the item/service is located.
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
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-image-host.com/image.png" {...field} />
                    </FormControl>
                     <FormDescription>
                      Link to an image of your item if it's already hosted online.
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
                    <FormLabel>Or Upload Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <UploadCloud className="h-5 w-5 text-muted-foreground" />
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
                      Upload an image from your device (max 5MB, JPG/PNG/WEBP). AI could help optimize it in the future!
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
                    <FormLabel>Contact Information / Instructions</FormLabel>
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
