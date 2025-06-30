"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useTranslation } from 'react-i18next';
import { addDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const reportSchema = z.object({
  targetId: z.string().min(1, { message: "User or Organization ID is required." }),
  reportPeriod: z.object({
    from: z.date(),
    to: z.date(),
  }).optional()
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function CompliancePage() {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportResult, setReportResult] = useState<{ id: string, status: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const generateReportCallable = useMemo(() => httpsCallable(functions, 'generateRegulatoryReport'), [functions]);

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            targetId: "",
            reportPeriod: {
                from: addDays(new Date(), -30),
                to: new Date()
            }
        },
    });
    
    async function onSubmit(data: ReportFormValues) {
        setIsSubmitting(true);
        setReportResult(null);
        setError(null);
        try {
             const payload = {
                reportType: 'FullComplianceReport', // Example type
                userId: data.targetId, // Assuming ID is a user ID for now
                orgId: null, // Can be extended to support orgs
                reportPeriod: {
                    startDate: data.reportPeriod?.from.getTime(),
                    endDate: data.reportPeriod?.to.getTime(),
                },
            };
            const result = await generateReportCallable(payload);
            const reportData = result.data as { reportId: string, status: string };
            setReportResult(reportData);
            toast({ title: t('adminPage.compliance.successTitle'), description: t('adminPage.compliance.successDescription', { reportId: reportData.reportId })});
        } catch (err: any) {
            console.error("Error generating report:", err);
            setError(err.message || t('adminPage.compliance.failDescription'));
            toast({ variant: 'destructive', title: t('adminPage.compliance.failTitle'), description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('adminPage.compliance.title')}</CardTitle>
                <CardDescription>{t('adminPage.compliance.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="targetId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('adminPage.compliance.form.targetIdLabel')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('adminPage.compliance.form.targetIdPlaceholder')} {...field} />
                                    </FormControl>
                                     <FormDescription>{t('adminPage.compliance.form.targetIdDescription')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                          control={form.control}
                          name="reportPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('adminPage.compliance.form.dateRangeLabel')}</FormLabel>
                              <FormControl>
                                <DateRangePicker
                                  date={field.value as DateRange}
                                  onDateChange={field.onChange}
                                />
                              </FormControl>
                               <FormDescription>{t('adminPage.compliance.form.dateRangeDescription')}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('adminPage.compliance.generatingButton')}</>
                            ) : (
                                <><FileText className="mr-2 h-4 w-4"/> {t('adminPage.compliance.generateButton')}</>
                            )}
                        </Button>
                    </form>
                </Form>
                 {reportResult && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2">
                           <CheckCircle className="h-5 w-5 text-green-600"/>
                           <h4 className="font-semibold text-green-800 dark:text-green-200">{t('adminPage.compliance.successTitle')}</h4>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                           {t('adminPage.compliance.reportGenerated')}: <span className="font-mono bg-green-200 dark:bg-green-900/50 p-1 rounded-sm">{reportResult.id}</span>
                        </p>
                    </div>
                )}
                 {error && (
                     <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2">
                           <AlertTriangle className="h-5 w-5 text-red-600"/>
                           <h4 className="font-semibold text-red-800 dark:text-red-200">{t('adminPage.compliance.failTitle')}</h4>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
