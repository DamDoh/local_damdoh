"use client";

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase'; // Assuming firebaseApp is exported from here
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

import type { BuyerDashboardData } from '@/lib/types'; // Import the BuyerDashboardData type

// Assume mock getBuyerDashboardData is available via firebase functions
const functions = getFunctions(firebaseApp);
const getBuyerDashboardDataCallable = httpsCallable<void, BuyerDashboardData>(functions, 'getBuyerDashboardData');


export default function BuyerHub() {
  const [dashboardData, setDashboardData] = useState<BuyerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the mock Firebase function
        const result = await getBuyerDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching buyer dashboard data:", err);
        setError("Failed to load buyer dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
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

  return (
    <div className="space-y-6">
      {/* Supply Chain Risk */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Risk</CardTitle>
          <CardDescription>Alerts and insights on potential disruptions.</CardDescription>
        </CardHeader>
        <CardContent>
           {dashboardData.supplyChainRisk ? (
              <div>
                  <p>Region: {dashboardData.supplyChainRisk.region}</p>
                  <p>Level: <Badge variant="secondary">{dashboardData.supplyChainRisk.level}</Badge></p>
                  <p>Factor: {dashboardData.supplyChainRisk.factor}</p>
                  <Button variant="link" className="px-0 pt-2" asChild>
                    <Link href={dashboardData.supplyChainRisk.action.link}>
                      {dashboardData.supplyChainRisk.action.label}
                    </Link>
                  </Button>
              </div>
           ) : (
               <p className="text-sm text-muted-foreground">No supply chain risk data available.</p>
           )}
        </CardContent>
      </Card>

      {/* Sourcing Recommendations */}
      <Card>
         <CardHeader>
            <CardTitle>Sourcing Recommendations</CardTitle>
            <CardDescription>Suggested suppliers based on your needs.</CardDescription>
         </CardHeader>
         <CardContent>
             {dashboardData.sourcingRecommendations.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Reliability</TableHead>
                            <TableHead>VTI Verified</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dashboardData.sourcingRecommendations.map(rec => (
                            <TableRow key={rec.id}>
                                <TableCell className="font-medium">{rec.name}</TableCell>
                                <TableCell>{rec.product}</TableCell>
                                <TableCell>{rec.reliability}%</TableCell>
                                <TableCell>{rec.vtiVerified ? <Badge>Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             ) : (
                <p className="text-sm text-muted-foreground">No sourcing recommendations available.</p>
             )}
         </CardContent>
      </Card>


      {/* Market Price Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle>Market Price Intelligence</CardTitle>
          <CardDescription>Trends and forecasts for key products.</CardDescription>
        </CardHeader>
        <CardContent>
           {dashboardData.marketPriceIntelligence ? (
               <div>
                  <p>Product: {dashboardData.marketPriceIntelligence.product}</p>
                  <p>Trend: <Badge variant={dashboardData.marketPriceIntelligence.trend === 'up' ? 'default' : 'destructive'}>{dashboardData.marketPriceIntelligence.trend}</Badge></p>
                  <p>Forecast: {dashboardData.marketPriceIntelligence.forecast}</p>
                   <Button variant="link" className="px-0 pt-2" asChild>
                    <Link href={dashboardData.marketPriceIntelligence.action.link}>
                      {dashboardData.marketPriceIntelligence.action.label}
                    </Link>
                  </Button>
               </div>
           ) : (
               <p className="text-sm text-muted-foreground">No market price intelligence available.</p>
           )}
        </CardContent>
      </Card>

    </div>
  );
}
