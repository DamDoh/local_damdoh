
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

// Super App Vision Note: The Sustainability Hub is a core feature that embodies
// the "planet" aspect of the "people, profit, planet" vision.
// It's not just a static page, but a dashboard that will integrate with
// other modules. For example, it will pull data from Farm Management (logged practices)
// and Traceability (carbon footprint calculations) to provide tangible metrics.
// AI can be used to suggest sustainable practices or identify opportunities for
// carbon credit programs based on this data.

const MetricCard = ({ title, value }: { title: string; value: string }) => (
    <div className="p-4 border-b last:border-b-0">
        <p className="font-medium">{title}:</p>
        <p className="text-muted-foreground text-sm">{value}</p>
    </div>
);

const CertificationItem = ({ name, status, color = "text-muted-foreground" }: { name: string; status: string; color?: string }) => (
    <div className="p-3 border-b last:border-b-0 flex justify-between items-center">
        <p className="font-medium">{name}</p>
        <p className={`text-sm font-semibold ${color}`}>{status}</p>
    </div>
);

const ToolLink = ({ name, href }: { name: string; href: string }) => (
    <div className="p-3 border-b last:border-b-0">
        <a href={href} className="text-primary hover:underline">{name}</a>
    </div>
);

export default function SustainabilityPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
          <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="h-7 w-7 text-green-600" />
                <CardTitle className="text-3xl">Sustainability & Impact Hub</CardTitle>
              </div>
              <CardDescription>
                Track your progress towards sustainable agriculture, manage certifications, and explore tools for positive impact across the supply chain.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Sustainable Practices Log Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sustainable Practices Log</CardTitle>
                            <CardDescription>Record and verify your on-farm sustainable activities.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground text-center p-8 border-2 border-dashed rounded-md">
                                [Conceptual Placeholder: This area will feature a form for farmers to log practices like cover cropping, reduced tillage, or integrated pest management. The system would then use this data to calculate impact metrics and potentially assist in certification processes.]
                           </p>
                        </CardContent>
                    </Card>
                     {/* Tools & Resources Section */}
                     <Card>
                        <CardHeader>
                            <CardTitle>Tools & Resources</CardTitle>
                            <CardDescription>Calculators and guides to support your sustainability journey.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ToolLink name="Carbon Footprint Calculator (Coming Soon)" href="#" />
                            <ToolLink name="Water Usage Efficiency Guide" href="#" />
                            <ToolLink name="Guide to Organic Farming Practices" href="#" />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Overview & Metrics Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Impact Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MetricCard title="Carbon Footprint" value="Estimated: 1.2 Tons CO2e" />
                            <MetricCard title="Water Usage Efficiency" value="Average: 1500 Liters/kg" />
                            <MetricCard title="Biodiversity Score" value="7/10 (based on practices)" />
                        </CardContent>
                    </Card>
                    
                    {/* Certifications Section */}
                     <Card>
                        <CardHeader>
                            <CardTitle>My Certifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CertificationItem name="Organic Certified" status="Valid" color="text-green-600" />
                            <CertificationItem name="Fair Trade" status="Pending Review" color="text-orange-500" />
                        </CardContent>
                    </Card>
                </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
};
