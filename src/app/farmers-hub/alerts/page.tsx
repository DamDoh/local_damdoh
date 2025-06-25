
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';

// Create a callable reference to our alerts function
const getAlertsFunction = httpsCallable(functions, 'getFarmerAlerts');

const AlertSkeleton = () => ( /* ... Skeleton component ... */ );
const severityConfig = { /* ... severityConfig object ... */ };

export default function AlertsPage() {
  const [alertsState, setAlertsState] = useState({ alerts: [], isLoading: true, error: null });

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        console.log("Calling 'getFarmerAlerts' function...");
        const result = await getAlertsFunction();
        
        if ((result.data as any).success) {
          setAlertsState({ alerts: (result.data as any).alerts, isLoading: false, error: null });
        } else {
          throw new Error((result.data as any).message || "Failed to fetch alerts.");
        }
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setAlertsState({ alerts: [], isLoading: false, error: err.message });
      }
    };
    loadAlerts();
  }, []);

  if (alertsState.isLoading) {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5">
            <div className="mb-8"><h1 className="text-3xl font-bold">Alerts & Recommendations</h1></div>
            <AlertSkeleton />
            <AlertSkeleton />
            <AlertSkeleton />
        </div>
    );
  }

  if (alertsState.error) {
    return <div className="p-8 text-center text-red-600 font-semibold">Error: {alertsState.error}</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Alerts & Recommendations</h1>
        <p className="text-lg text-gray-600">Your AI-powered farm assistant.</p>
      </div>
      <div className="space-y-5">
        {alertsState.alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">You have no new alerts.</div>
        ) : (
          alertsState.alerts.map(alert => {
            const config = severityConfig[alert.severity] || severityConfig.Low;
            return (
              <Card key={alert.id} className={`shadow-sm border-l-4 ${config.border}`}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <config.icon className={`w-8 h-8 ${config.color}`} />
                  <div>
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <CardDescription>{new Date(alert.timestamp).toLocaleString()}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent><p>{alert.description}</p></CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
