
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logFinancialTransactionSchema, type LogFinancialTransactionValues } from "@/lib/form-schemas";
import { ArrowLeft, Save, DollarSign, Loader2, ListFilter, FileText, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { useTranslations } from "next-intl";

const currencies = ["USD", "KES", "NGN", "GHS", "EUR", "UGX", "TZS", "ZMW"];

export default function LogFinancialTransactionPage() {
  const t = useTranslations('farmManagement.financials.log');
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  const logFinancialTransactionCallable = httpsCallable(functions, 'logFinancialTransaction');

  const form = useForm<LogFinancialTransactionValues>({
    resolver: zodResolver(logFinancialTransactionSchema),
    defaultValues: {
      type: "expense",
      amount: undefined,
      currency: "USD",
      description: "",
      category: "",
    },
  });

  async function onSubmit(data: LogFinancialTransactionValues) {
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
      await logFinancialTransactionCallable(data);

      toast({
        title: t('toast.success'),
        description: t('toast.description'),
      });

      router.push("/farm-management/financials");
    } catch (error: any) {
      console.error("Error logging transaction:", error);
      toast({
        variant: "destructive",
        title: t('toast.fail'),
        description: error.message || "An error occurred while saving. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const transactionTypes = Object.keys(t.raw('types')).map(key => ({
    value: key,
    label: t(`types.${key}`)
  }));

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management/financials">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backLink')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
          </div>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><ListFilter className="h-4 w-4 text-muted-foreground" />{t('typeLabel')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('typePlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transactionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{t('descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('descriptionPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />{t('amountLabel')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder={t('amountPlaceholder')} {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
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
                      <FormLabel className="flex items-center gap-2"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />{t('currencyLabel')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('currencyPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
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
                    <FormLabel className="flex items-center gap-2"><Tag className="mr-2 h-4 w-4 text-muted-foreground" />{t('categoryLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('categoryPlaceholder')} {...field} />
                    </FormControl>
                     <FormDescription>{t('categoryDescription')}</FormDescription>
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
