
"use client";

import { useState, useMemo } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Calendar, Clock, MapPin, Users, Link as LinkIcon, FileText, Image, Sparkles, CircleDollarSign, Limit, CheckSquare, Badge } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAgriEventSchema, type CreateAgriEventValues } from "@/lib/form-schemas";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { getAgriEventTypeFormOptions } from '@/lib/i18n-constants';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { uploadFileAndGetURL } from '@/lib/storage-utils';

export default function CreateAgriEventPage() {
  const t = useTranslations('AgriEvents.createPage');
  const tConstants = useTranslations('constants');
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const functions = getFunctions(firebaseApp);
  const createAgriEventCallable = useMemo(() => httpsCallable(functions, 'agriEvents-createAgriEvent'), [functions]);

  const form = useForm<CreateAgriEventValues>({
    resolver: zodResolver(createAgriEventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: undefined,
      eventTime: "",
      location: "",
      eventType: undefined,
      organizer: "",
      websiteLink: "",
      imageUrl: "",
      registrationEnabled: false,
      price: undefined,
      currency: "USD"
    },
  });

  const onSubmit = async (values: CreateAgriEventValues) => {
    if (!user) {
        toast({ title: t('toast.authErrorTitle'), description: t('toast.authErrorDescription'), variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        let finalImageUrl = values.imageUrl;
        if(values.imageFile) {
            toast({ title: t('toast.uploadingImageTitle'), description: t('toast.uploadingImageDescription') });
            finalImageUrl = await uploadFileAndGetURL(values.imageFile, 'event-banners');
        }

        const payload = {
            ...values,
            imageUrl: finalImageUrl,
            eventDate: values.eventDate.toISOString(),
            imageFile: undefined, // Don't send file object to backend
        };
        
        await createAgriEventCallable(payload);
        toast({
          title: t('toast.successTitle'),
          description: t('toast.successDescription', { eventName: values.title }),
        });
        form.reset();
        router.push('/agri-events');
    } catch(error: any) {
        console.error("Error creating event:", error);
        toast({
          title: t('toast.errorTitle'),
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/agri-events" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
      </Link>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6"/>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>{t('form.title')}</FormLabel> <FormControl> <Input placeholder={t('form.titlePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>{t('form.description')}</FormLabel> <FormControl> <Textarea placeholder={t('form.descriptionPlaceholder')} {...field} className="min-h-[120px]"/> </FormControl> <FormMessage /> </FormItem> )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="eventDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>{t('form.date')}</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} > <Calendar className="mr-2 h-4 w-4" /> {field.value ? format(field.value, "PPP") : <span>{t('form.datePlaceholder')}</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name="eventTime" render={({ field }) => ( <FormItem> <FormLabel>{t('form.time')}</FormLabel> <FormControl> <Input type="time" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>{t('form.location')}</FormLabel> <FormControl> <Input placeholder={t('form.locationPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="eventType" render={({ field }) => ( <FormItem> <FormLabel>{t('form.type')}</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder={t('form.typePlaceholder')} /> </SelectTrigger> </FormControl> <SelectContent> {getAgriEventTypeFormOptions(tConstants).map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
               </div>
                
                 <FormField control={form.control} name="organizer" render={({ field }) => ( <FormItem> <FormLabel>{t('form.organizer')}</FormLabel> <FormControl> <Input placeholder={t('form.organizerPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name="websiteLink" render={({ field }) => ( <FormItem> <FormLabel>{t('form.website')}</FormLabel> <FormControl> <Input type="url" placeholder={t('form.websitePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />

              <Separator />
                
              <FormField control={form.control} name="imageFile" render={({ field: { onChange, value, ...rest } }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Image className="h-4 w-4 text-muted-foreground" />{t('form.imageFile')}</FormLabel> <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl><FormMessage /></FormItem> )} />
                
              <Separator />

              <FormField control={form.control} name="registrationEnabled" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"> <div> <FormLabel>{t('form.registration')}</FormLabel> <FormDescription>{t('form.registrationDescription')}</FormDescription> </div> <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl> </FormItem> )} />

                {form.watch('registrationEnabled') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="attendeeLimit" render={({ field }) => ( <FormItem> <FormLabel>{t('form.attendeeLimit')}</FormLabel> <FormControl> <Input type="number" placeholder={t('form.attendeeLimitPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>{t('form.price')}</FormLabel> <FormControl> <Input type="number" step="0.01" placeholder={t('form.pricePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                )}


              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {t('form.submitButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
