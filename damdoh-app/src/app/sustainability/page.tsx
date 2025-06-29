
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Info } from "lucide-react";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common');
  return (
    <div className="container mx-auto py-8">
      <Card>
          <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="h-7 w-7 text-green-600" />
                <CardTitle className="text-3xl">{t('sustainability.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('sustainability.description')}
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Sustainable Practices Log Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('sustainability.log.title')}</CardTitle>
                            <CardDescription>{t('sustainability.log.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground text-center p-8 border-2 border-dashed rounded-md">
                                {t('sustainability.log.placeholder')}
                           </p>
                        </CardContent>
                    </Card>
                     {/* Tools & Resources Section */}
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('sustainability.tools.title')}</CardTitle>
                            <CardDescription>{t('sustainability.tools.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ToolLink name={t('sustainability.tools.carbonCalc')} href="#" />
                            <ToolLink name={t('sustainability.tools.waterGuide')} href="#" />
                            <ToolLink name={t('sustainability.tools.organicGuide')} href="#" />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Overview & Metrics Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('sustainability.overview.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MetricCard title={t('sustainability.overview.carbonFootprint')} value={t('sustainability.overview.carbonFootprintValue')} />
                            <MetricCard title={t('sustainability.overview.waterEfficiency')} value={t('sustainability.overview.waterEfficiencyValue')} />
                            <MetricCard title={t('sustainability.overview.biodiversity')} value={t('sustainability.overview.biodiversityValue')} />
                        </CardContent>
                    </Card>
                    
                    {/* Certifications Section */}
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('sustainability.certifications.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CertificationItem name={t('sustainability.certifications.organic')} status={t('sustainability.certifications.statusValid')} color="text-green-600" />
                            <CertificationItem name={t('sustainability.certifications.fairTrade')} status={t('sustainability.certifications.statusPending')} color="text-orange-500" />
                        </CardContent>
                    </Card>
                </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
};
