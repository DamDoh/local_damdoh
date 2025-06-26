
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpCircle, ArrowDownCircle, Banknote, DollarSign, PlusCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { FinancialSummary, FinancialTransaction } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

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
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getFinancialsCallable = useMemo(() => httpsCallable(functions, 'getFinancialSummaryAndTransactions'), [functions]);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    }
    const loadData = async () => {
        setIsLoading(true);
        try {
            const result = await getFinancialsCallable();
            const data = result.data as { summary: FinancialSummary; transactions: FinancialTransaction[] };
            setSummary(data.summary);
            setTransactions(data.transactions);
        } catch (err) {
            console.error("Failed to load financial data.", err);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, [user, getFinancialsCallable]);

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
          <CardTitle>Please Sign In</CardTitle>
          <CardDescription>You must be signed in to view your financial dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild><Link href="/auth/signin">Sign In</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const netFlow = (summary?.totalIncome ?? 0) - (summary?.totalExpense ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-primary" />
                Financials Dashboard
            </h1>
            <p className="text-muted-foreground">An overview of your farm's financial health.</p>
        </div>
        <Button asChild>
            <Link href="/farm-management/financials/log"><PlusCircle className="mr-2 h-4 w-4"/>Log New Transaction</Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Income" value={summary?.totalIncome ?? 0} icon={<ArrowUpCircle className="h-4 w-4 text-green-500" />} />
        <StatCard title="Total Expense" value={summary?.totalExpense ?? 0} icon={<ArrowDownCircle className="h-4 w-4 text-red-500" />} />
        <StatCard title="Net Flow" value={netFlow} icon={<Banknote className="h-4 w-4 text-blue-500" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your last 10 financial records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.length > 0 ? (
                    transactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{tx.description}</TableCell>
                            <TableCell><Badge variant="outline">{tx.category || 'Uncategorized'}</Badge></TableCell>
                            <TableCell className={`text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'income' ? '+' : '-'} {tx.currency} {tx.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No transactions logged yet.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
