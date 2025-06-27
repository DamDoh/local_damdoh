
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createShopSchema, type CreateShopValues } from '@/lib/form-schemas';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Building, Save } from 'lucide-react';
import { STAKEHOLDER_ROLES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Frontend component for stakeholders to create their Digital Shopfront.
 * This UI calls the `createShop` backend function.
 */
export default function CreateShopPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  const router = useRouter();
  const createShopCallable = useMemo(() => httpsCallable(functions, 'createShop'), [functions]);

  const form = useForm<CreateShopValues>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: "",
      description: "",
      stakeholderType: undefined,
    },
  });

  const handleSubmit = async (data: CreateShopValues) => {
    setIsSubmitting(true);
    try {
      await createShopCallable(data);

      toast({
        title: "Shopfront Created!",
        description: `Your Digital Shopfront "${data.name}" has been successfully created.`,
      });

      // Redirect to a relevant page, e.g., the user's main profile or a new shop management page
      router.push('/profiles/me');

    } catch (error: any) {
      console.error("Error creating shopfront:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4">
      <Button asChild variant="outline">
          <Link href="/marketplace"><ArrowLeft className="h-4 w-4 mr-2" />Back to Marketplace</Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary"/>
            <CardTitle className="text-2xl">Create Your Digital Shopfront</CardTitle>
          </div>
          <CardDescription>Establish your presence on the DamDoh Marketplace. This will be your public page to showcase products or services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop / Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sokhom's Fresh Organics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                  control={form.control}
                  name="stakeholderType"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Primary Business Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select the main category of your business" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  {STAKEHOLDER_ROLES.map((role) => (
                                      <SelectItem key={role} value={role}>{role}</SelectItem>
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
                    <FormLabel>Shop / Service Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell everyone what makes your products or services special." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full !mt-8" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating...
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" />Create My Shopfront</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    