
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpCircle, ArrowDownCircle, Banknote, DollarSign, PlusCircle, FilePlus, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import type { FinancialSummary, FinancialTransaction, FinancialApplication } from '@/lib/types';
import { useTranslations } from 'next-intl';


const functions = getFunctions(firebaseApp);

const StatCard = ({ title, value, icon, currency = "USD" }: { title: string, value: number, icon: React.ReactNode, currency?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{currency} {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </CardContent>
  </Card>
);

export default function FinancialDashboardPage() {
  const t = useTranslations('farmManagement.financials');
  const tAppPage = useTranslations('FiApplicationPage'); // For status labels
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [applications, setApplications] = useState<FinancialApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFinancialsCallable = useMemo(() => httpsCallable(functions, 'financials-getFinancialSummaryAndTransactions'), []);
  const getApplicationsCallable = useMemo(() => httpsCallable(functions, 'financials-getFarmerApplications'), []);
  
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [financialsResult, applicationsResult] = await Promise.all([
        getFinancialsCallable(),
        getApplicationsCallable()
      ]);

      const finData = financialsResult.data as { summary: FinancialSummary; transactions: FinancialTransaction[] };
      setSummary(finData?.summary ?? { totalIncome: 0, totalExpense: 0, netFlow: 0 });
      setTransactions(finData?.transactions ?? []);

      const appData = applicationsResult.data as { applications: FinancialApplication[] };
      setApplications(appData?.applications ?? []);

    } catch (err) {
      console.error("Failed to load financial data.", err);
      setSummary(null);
      setTransactions([]);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [getFinancialsCallable, getApplicationsCallable]);


  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
        setIsLoading(false);
    }
  }, [user, fetchAllData]);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-64" />
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-64" />
        </div>
    );
  }
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('signInPrompt.title')}</CardTitle>
          <CardDescription>{t('signInPrompt.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild><Link href="/auth/signin">{t('signInPrompt.button')}</Link></Button>
        </CardContent>
      </Card>
    );
  }
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Approved': return 'default';
        case 'Rejected': return 'destructive';
        case 'Under Review':
        case 'More Info Required':
        case 'Pending':
            return 'secondary';
        default: return 'outline';
    }
  };


  const netFlow = (summary?.totalIncome ?? 0) - (summary?.totalExpense ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-primary" />
                {t('title')}
            </h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button asChild>
                <Link href="/farm-management/financials/apply">
                    <FilePlus className="mr-2 h-4 w-4"/>
                    {t('applyForFundingButton')}
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/farm-management/financials/log"><PlusCircle className="mr-2 h-4 w-4"/>{t('newTransactionButton')}</Link>
            </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title={t('totalIncome')} value={summary?.totalIncome ?? 0} icon={<ArrowUpCircle className="h-4 w-4 text-green-500" />} />
        <StatCard title={t('totalExpense')} value={summary?.totalExpense ?? 0} icon={<ArrowDownCircle className="h-4 w-4 text-red-500" />} />
        <StatCard title={t('netFlow')} value={netFlow} icon={<Banknote className="h-4 w-4 text-blue-500" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>{t('applications.title')}</CardTitle>
          <CardDescription>{t('applications.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('applications.table.type')}</TableHead>
                <TableHead>{t('applications.table.amount')}</TableHead>
                <TableHead>{t('applications.table.status')}</TableHead>
                <TableHead>{t('applications.table.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.type}</TableCell>
                    <TableCell>${app.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(app.status)}>{tAppPage(`status.${app.status.toLowerCase().replace(/\s/g, '_')}` as any, app.status)}</Badge></TableCell>
                    <TableCell>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">{t('applications.noApplications')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>{t('recentTransactions')}</CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.date')}</TableHead>
                <TableHead>{t('table.description')}</TableHead>
                <TableHead>{t('table.category')}</TableHead>
                <TableHead className="text-right">{t('table.amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {Array.isArray(transactions) && transactions.length > 0 ? (
                    transactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="font-medium">{tx.description}</TableCell>
                            <TableCell><Badge variant="outline">{tx.category || 'Uncategorized'}</Badge></TableCell>
                            <TableCell className={`text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                                {tx.type === 'income' ? '+' : '-'} {tx.currency} {tx.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">{t('noTransactions')}</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
