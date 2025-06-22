
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FieldAgentDashboard = () => (
    <div>
        <h1 className="text-2xl font-bold mb-4">Field Agent Operations Center</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Farmer Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Placeholder for farmer list and status.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Diagnostics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Placeholder for pest/disease identification tool.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Visits</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Placeholder for scheduled farm visits.</p>
                </CardContent>
            </Card>
        </div>
    </div>
);
