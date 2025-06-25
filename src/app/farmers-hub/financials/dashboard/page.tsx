
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpCircle, ArrowDownCircle, Banknote, ShieldCheck } from 'lucide-react';

// Placeholders for backend calls
const fetchFinancialSummary = async (userId) => { /* ... */ };
const calculateCreditScore = async (userId) => {
  console.log("Calculating credit score for user:", userId);
  await new Promise(r => setTimeout(r, 500));
  return 720; // Return a sample score
};

const StatCard = ({ title, value, icon, currency = "USD" }) => ( /* ... */ );

const CreditScoreCard = ({ score, isLoading }) => (
  <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
    <CardHeader>
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6" />
        <CardTitle>DamDoh Credit Score</CardTitle>
      </div>
      <CardDescription className="text-blue-200">A measure of your farm's financial health and reliability.</CardDescription>
    </CardHeader>
    <CardContent className="text-center">
      {isLoading ? (
        <Skeleton className="h-20 w-32 bg-blue-500/50 mx-auto" />
      ) : (
        <div className="text-6xl font-extrabold tracking-tighter">
          {score}
        </div>
      )}
      <p className="text-xs text-blue-300 mt-2">Updated automatically based on your activity.</p>
    </CardContent>
  </Card>
);

export default function FinancialDashboardPage() {
  const [summaryState, setSummaryState] = useState({ summary: null, score: null, isLoading: true, error: null });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch both summary and credit score
        const summaryData = await fetchFinancialSummary("current-farmer-uid");
        const creditScore = await calculateCreditScore("current-farmer-uid");
        setSummaryState({ summary: summaryData, score: creditScore, isLoading: false, error: null });
      } catch (err) {
        setSummaryState({ summary: null, score: null, isLoading: false, error: "Failed to load financial data." });
      }
    };
    loadData();
  }, []);

  if (summaryState.isLoading) { /* ... Skeleton rendering ... */ }
  if (summaryState.error) { /* ... Error rendering ... */ }
  
  const { summary, score } = summaryState;

  return (
    <div className="p-4 md:p-8">
      {/* ... Header ... */}

      {/* --- New Credit Score Card --- */}
      <div className="mb-6">
        <CreditScoreCard score={score} isLoading={summaryState.isLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard title="Total Income" value={summary.totalIncome} icon={<ArrowUpCircle className="h-4 w-4 text-green-500" />} />
        <StatCard title="Total Expense" value={summary.totalExpense} icon={<ArrowDownCircle className="h-4 w-4 text-red-500" />} />
        <StatCard title="Net Flow" value={summary.netFlow} icon={<Banknote className="h-4 w-4 text-blue-500" />} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... Transactions list ... */}
        </CardContent>
      </Card>
    </div>
  );
}
