
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logFinancialTransactionSchema, type LogFinancialTransactionValues } from "@/lib/form-schemas";
import { ArrowLeft, Save, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { useTranslation } from "react-i18next";

export default function LogFinancialTransactionPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);
  const logFinancialTransactionCallable = useMemo(() => httpsCallable(functions, 'logFinancialTransaction'), [functions]);

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
        title: t('farmManagement.logFinancials.authErrorTitle'),
        description: t('farmManagement.logFinancials.authErrorDescription'),
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await logFinancialTransactionCallable(data);

      toast({
        title: t('farmManagement.logFinancials.successTitle'),
        description: t('farmManagement.logFinancials.successDescription'),
      });

      router.push("/farm-management/financials");
    } catch (error: any) {
      console.error("Error logging transaction:", error);
      toast({
        variant: "destructive",
        title: t('farmManagement.logFinancials.failTitle'),
        description: error.message || t('farmManagement.logFinancials.failDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management/financials">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('farmManagement.financials.backButton')}
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('farmManagement.logFinancials.title')}</CardTitle>
          </div>
          <CardDescription>{t('farmManagement.logFinancials.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('farmManagement.logFinancials.form.typeLabel')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('farmManagement.logFinancials.form.typePlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">{t('farmManagement.logFinancials.form.typeExpense')}</SelectItem>
                          <SelectItem value="income">{t('farmManagement.logFinancials.form.typeIncome')}</SelectItem>
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
                    <FormLabel>{t('farmManagement.logFinancials.form.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('farmManagement.logFinancials.form.descriptionPlaceholder')} {...field} />
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
                      <FormLabel>{t('farmManagement.logFinancials.form.amountLabel')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 25.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
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
                      <FormLabel>{t('farmManagement.logFinancials.form.currencyLabel')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('farmManagement.logFinancials.form.currencyPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="KES">KES</SelectItem>
                          <SelectItem value="NGN">NGN</SelectItem>
                          <SelectItem value="GHS">GHS</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
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
                    <FormLabel>{t('farmManagement.logFinancials.form.categoryLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('farmManagement.logFinancials.form.categoryPlaceholder')} {...field} />
                    </FormControl>
                     <FormDescription>{t('farmManagement.logFinancials.form.categoryDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('farmManagement.logFinancials.submittingButton')}
                    </>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> {t('farmManagement.logFinancials.submitButton')}</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
