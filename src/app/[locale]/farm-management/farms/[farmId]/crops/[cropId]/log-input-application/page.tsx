
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createInputApplicationSchema, type CreateInputApplicationValues } from "@/lib/form-schemas";
import { ArrowLeft, Save, CalendarIcon, Loader2, Droplets, Text, Hash, List, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import type { KnfBatch } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function LogInputApplicationPage() {
  const t = useTranslations('farmManagement.logInput');
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;
  const cropId = params.cropId as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  const handleInputApplicationEvent = httpsCallable(functions, 'handleInputApplicationEvent');

  const [knfBatches, setKnfBatches] = useState<KnfBatch[]>([]);
  const getUserKnfBatchesCallable = useMemo(() => httpsCallable(functions, 'getUserKnfBatches'), [functions]);

  const form = useForm<CreateInputApplicationValues>({
    resolver: zodResolver(createInputApplicationSchema),
    defaultValues: {
      applicationDate: new Date(),
      inputId: "",
      quantity: undefined,
      unit: "",
      method: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    const fetchKnfBatches = async () => {
      try {
        const result = await getUserKnfBatchesCallable();
        const allBatches = (result.data as KnfBatch[]) || [];
        setKnfBatches(allBatches.filter(b => b.status === 'Ready'));
      } catch (error) {
        console.error("Error fetching KNF batches:", error);
      }
    };
    fetchKnfBatches();
  }, [user, getUserKnfBatchesCallable]);

  async function onSubmit(data: CreateInputApplicationValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: t('toast.authErrorTitle'),
        description: t('toast.authErrorDescription'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        farmFieldId: cropId,
        inputId: data.inputId,
        applicationDate: data.applicationDate.toISOString(),
        quantity: data.quantity,
        unit: data.unit,
        method: data.method,
        actorVtiId: user.uid,
        geoLocation: null,
      };

      await handleInputApplicationEvent(payload);

      toast({
        title: t('toast.success'),
        description: t('toast.description'),
      });

      router.push(`/farm-management/farms/${farmId}`);
    } catch (error: any) {
      console.error("Error logging input application:", error);
      toast({
        variant: "destructive",
        title: t('toast.fail'),
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
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backLink')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Droplets className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
          </div>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {knfBatches.length > 0 && (
                 <FormField
                    control={form.control}
                    name="inputId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className=\"flex items-center gap-2\"><FlaskConical className=\"mr-2 h-4 w-4 text-muted-foreground\" />{t(\'useKNFLabel\')}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('useKNFPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {knfBatches.map(batch => (
                              <SelectItem key={batch.id} value={`${batch.typeName} (Batch: ${batch.id.substring(0,5)})`}>{batch.typeName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

              <FormField
                control={form.control}
                name="inputId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=\"flex items-center gap-2\"><Text className=\"mr-2 h-4 w-4 text-muted-foreground\" />{t(\'manualInputLabel\')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('manualInputPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                  control={form.control}
                  name="applicationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className=\"flex items-center gap-2\"><CalendarIcon className=\"mr-2 h-4 w-4 text-muted-foreground\" />{t(\'dateLabel\')}</FormLabel>\
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
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className=\"flex items-center gap-2\"><Hash className=\"mr-2 h-4 w-4 text-muted-foreground\" />{t(\'quantityLabel\')}</FormLabel>\
                        <FormControl>
                        <Input type="number" placeholder={t('quantityPlaceholder')} {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className=\"flex items-center gap-2\"><List className=\"mr-2 h-4 w-4 text-muted-foreground\" />{t(\'unitLabel\')}</FormLabel>\
                        <FormControl>
                        <Input placeholder={t('unitPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

               <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Text className="h-4 w-4 text-muted-foreground" />{t('methodLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('methodPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('savingButton')}
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> {t('saveButton')}</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
