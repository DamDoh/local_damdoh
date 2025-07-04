
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Briefcase, BarChart, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import type { CrowdfunderDashboardData } from '@/lib/types';

const functions = getFunctions(firebaseApp);

export const CrowdfunderDashboard = () => {
  const [dashboardData, setDashboardData] = useState<CrowdfunderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCrowdfunderDashboardDataCallable = useMemo(() => httpsCallable<void, CrowdfunderDashboardData>(functions, 'getCrowdfunderDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCrowdfunderDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Crowdfunder dashboard data:", err);
        setError("Failed to load Crowdfunder dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getCrowdfunderDashboardDataCallable]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-destructive">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
      return (
           <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>No dashboard data available.</p>
                </CardContent>
           </Card>
      );
  }

  const { portfolioOverview, suggestedOpportunities, recentTransactions } = dashboardData;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Impact Investment & Crowdfunding Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Invested" value={portfolioOverview?.totalInvested || 0} icon={<Briefcase />} />
        <StatCard title="Number of Investments" value={portfolioOverview?.numberOfInvestments || 0} icon={<BarChart />} isCurrency={false} />
        <StatCard title="Estimated Returns" value={portfolioOverview?.estimatedReturns || 0} icon={<TrendingUp />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suggested Opportunities */}
        <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle className="text-base">Suggested Investment Opportunities</CardTitle>
             <CardDescription>Projects aligned with your impact goals.</CardDescription>
           </CardHeader>
           <CardContent>
             {(suggestedOpportunities?.length > 0) ? (
               <div className="space-y-4">
                 {suggestedOpportunities?.map((opp) => {
                   const progress = (opp.amountRaised / opp.fundingGoal) * 100;
                   return (
                     <div key={opp.id} className="p-3 border rounded-lg">
                       <div className="flex justify-between items-start">
                         <div>
                            <p className="font-semibold">{opp.projectName}</p>
                            <Badge variant="secondary">{opp.category}</Badge>
                         </div>
                         <Button asChild variant="secondary" size="sm">
                           <Link href={opp.actionLink}>View</Link>
                         </Button>
                       </div>
                       <Progress value={progress} className="w-full mt-2" />
                       <p className="text-xs text-muted-foreground mt-1">
                         ${opp.amountRaised.toLocaleString()} raised of ${opp.fundingGoal.toLocaleString()} goal
                       </p>
                     </div>
                   )
                 })}
               </div>
             ) : (
               <p className="text-sm text-muted-foreground">No suggested opportunities at the moment.</p>
             )}
           </CardContent>
         </Card>

         {/* Recent Transactions */}
         <Card>
           <CardHeader>
             <CardTitle className="text-base">Recent Transactions</CardTitle>
             <CardDescription>Your latest investment activities.</CardDescription>
           </CardHeader>
           <CardContent>
             {(recentTransactions?.length > 0) ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Project</TableHead>
                     <TableHead className="text-right">Amount</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {recentTransactions?.map((tx) => (
                     <TableRow key={tx.id}>
                       <TableCell>
                         <div className="font-medium">{tx.projectName}</div>
                         <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {tx.type === 'Investment' ? <ArrowUpCircle className="h-3 w-3 text-red-500"/> : <ArrowDownCircle className="h-3 w-3 text-green-500"/>}
                            {tx.type} on {new Date(tx.date).toLocaleDateString()}
                         </div>
                       </TableCell>
                       <TableCell className={`text-right font-semibold ${tx.type === 'Investment' ? 'text-red-600' : 'text-green-600'}`}>
                         ${tx.amount.toLocaleString()}
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">No recent transactions.</p>
             )}
           </CardContent>
         </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, isCurrency = true }: { title: string, value: number, icon: React.ReactNode, isCurrency?: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
          {isCurrency && '$'}{value.toLocaleString()}
      </div>
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
        </div>
    </div>
);
