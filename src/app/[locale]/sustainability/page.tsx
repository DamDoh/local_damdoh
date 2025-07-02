import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('sustainabilityPage');
  return (
    <div className="container mx-auto py-8">
      <Card>
          <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="h-7 w-7 text-green-600" />
                <CardTitle className="text-3xl">{t('title')}</CardTitle>
              </div>
              <CardDescription>
                {t('description')}
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Sustainable Practices Log Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('practicesLog.title')}</CardTitle>
                            <CardDescription>{t('practicesLog.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground text-center p-8 border-2 border-dashed rounded-md">
                                {t('practicesLog.placeholder')}
                           </p>
                        </CardContent>
                    </Card>
                     {/* Tools & Resources Section */}
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('toolsAndResources.title')}</CardTitle>
                            <CardDescription>{t('toolsAndResources.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ToolLink name={t('toolsAndResources.carbonCalculator')} href="#" />
                            <ToolLink name={t('toolsAndResources.waterUsageGuide')} href="#" />
                            <ToolLink name={t('toolsAndResources.organicFarmingGuide')} href="#" />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Overview & Metrics Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('impactOverview.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MetricCard title={t('impactOverview.carbonFootprint')} value={t('impactOverview.carbonFootprintValue')} />
                            <MetricCard title={t('impactOverview.waterUsage')} value={t('impactOverview.waterUsageValue')} />
                            <MetricCard title={t('impactOverview.biodiversityScore')} value={t('impactOverview.biodiversityScoreValue')} />
                        </CardContent>
                    </Card>
                    
                    {/* Certifications Section */}
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('myCertifications.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CertificationItem name={t('myCertifications.organicCertified')} status={t('myCertifications.valid')} color="text-green-600" />
                            <CertificationItem name={t('myCertifications.fairTrade')} status={t('myCertifications.pendingReview')} color="text-orange-500" />
                        </CardContent>
                    </Card>
                </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
};
