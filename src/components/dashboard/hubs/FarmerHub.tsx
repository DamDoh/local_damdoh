
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

import type { FarmerDashboardData } from '@/lib/types'; // Import the FarmerDashboardData type

// Assume mock getFarmerDashboardData is available via firebase functions
// In a real app, you would need to ensure this function is deployed and accessible
// For this example, we assume it's already set up in firebase/functions/src/hubs.ts
// and imported here potentially via a shared functions index or directly.
// For now, we'll simulate the call.
const functions = getFunctions(firebaseApp);
const getFarmerDashboardDataCallable = httpsCallable<void, FarmerDashboardData>(functions, 'getFarmerDashboardData');


export default function FarmerHub() {
  const [dashboardData, setDashboardData] = useState<FarmerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the mock Firebase function
        const result = await getFarmerDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching farmer dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
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
      {/* Predicted Yield */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Yield</CardTitle>
          <CardDescription>Insights based on your farm data and AI analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Your predicted yield for {dashboardData.predictedYield.crop} is{' '}
            <Badge variant="secondary">{dashboardData.predictedYield.variance}</Badge> with{' '}
            <Badge variant="secondary">{dashboardData.predictedYield.confidence}</Badge> confidence.
          </p>
        </CardContent>
      </Card>

      {/* Irrigation Schedule */}
      <Card>
         <CardHeader>
            <CardTitle>Irrigation Schedule</CardTitle>
            <CardDescription>Next scheduled irrigation and recommendations.</CardDescription>
         </CardHeader>
         <CardContent>
             <p>Next run: {dashboardData.irrigationSchedule.next_run}</p>
             <p>Duration: {dashboardData.irrigationSchedule.duration_minutes} minutes</p>
             <p>Recommendation: {dashboardData.irrigationSchedule.recommendation}</p>
         </CardContent>
      </Card>


      {/* Matched Buyers */}
      <Card>
        <CardHeader>
          <CardTitle>Matched Buyers</CardTitle>
          <CardDescription>Potential buyers interested in your produce.</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.matchedBuyers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.matchedBuyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium">{buyer.name}</TableCell>
                    <TableCell>{buyer.matchScore}%</TableCell>
                     <TableCell>{buyer.request}</TableCell>
                    <TableCell>
                      <Link href={`/messages/${buyer.contactId}`} passHref>
                         <Button variant="outline" size="sm">Contact</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No matched buyers found yet.</p>
          )}
        </CardContent>
      </Card>

       {/* Trust Score */}
      <Card>
        <CardHeader>
          <CardTitle>Trust Score</CardTitle>
          <CardDescription>Your reputation and verified certifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Reputation Score: <Badge variant="secondary">{dashboardData.trustScore.reputation}</Badge></p>
          {dashboardData.trustScore.certifications.length > 0 && (
              <div className="mt-2">
                  <h4 className="text-sm font-semibold mb-1">Certifications:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {dashboardData.trustScore.certifications.map(cert => (
                          <li key={cert.id}>{cert.name} ({cert.issuingBody})</li>
                      ))}
                  </ul>
              </div>
          )}
             {dashboardData.trustScore.certifications.length === 0 && (
                 <p className="text-sm text-muted-foreground mt-2">No certifications added yet.</p>
             )}
        </CardContent>
      </Card>

    </div>
  );
}
