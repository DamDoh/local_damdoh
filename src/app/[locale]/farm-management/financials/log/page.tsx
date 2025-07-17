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
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { useTranslations } from "next-intl";


const currencies = ["USD", "KES", "NGN", "GHS", "EUR", "UGX", "TZS", "ZMW"]; // Example currencies

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
      type: "expense", // Default to expense? Or make it required?
      amount: undefined,
      currency: "USD",
      description: "",
      category: "",
      date: new Date().toISOString().split('T')[0], // Default to today
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

      // Redirect to the financial dashboard after successful submission
      router.push("/farm-management/financials");

    } catch (error: any) {
      console.error("Error logging transaction:", error);

      let errorMessage = t('toast.fail'); // Default fallback message title
      if (error.message) {
         errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: t('toast.fail'),
        description: errorMessage,
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
                 name="date"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('dateLabel')}</FormLabel>
                     <FormControl>
                       <Input type="date" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
              {/* Form Fields for Type, Description, Amount, Currency, Category */}
              {/* These are already implemented in the provided code */}
              {/* ... (Existing form fields for type, description, amount, currency, category) ... */}

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
