
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Droplets, PawPrint, Award, TrendingUp, TrendingDown, Circle, CheckCircle } from "lucide-react";
import { apiCall } from '@/lib/api-utils';
import { useAuth } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { SustainabilityDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';

const MetricCard = ({ title, value, unit, trend, icon, higherIsBetter = true }: { title: string, value: number, unit: string, trend: number, icon: React.ReactNode, higherIsBetter?: boolean }) => {
    const t = useTranslations('sustainabilityPage.metricCard');
    const isGoodTrend = higherIsBetter ? trend >= 0 : trend < 0;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value.toLocaleString()}{unit}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                    {trend !== 0 && (isGoodTrend ? 
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" /> :
                        <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                    )}
                    {trend > 0 ? '+' : ''}{trend}% {t('trendText')}
                </p>
            </CardContent>
        </Card>
    );
};

const SustainabilitySkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-5 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    </div>
);

export default function SustainabilityPage() {
    const t = useTranslations('sustainabilityPage');
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<SustainabilityDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setIsLoading(false);
            return;
        }
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await apiCall<SustainabilityDashboardData>('/dashboard/sustainability');
                setData(result);
            } catch (error) {
                console.error("Error fetching sustainability data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user, authLoading]);
    
    if (isLoading || authLoading) {
        return <SustainabilitySkeleton />;
    }

    if (!user) {
        return (
            <Card className="text-center py-8">
                <CardHeader><CardTitle>{t('auth.title')}</CardTitle></CardHeader>
                <CardContent>
                    <CardDescription>{t('auth.description')}</CardDescription>
                    <Button asChild className="mt-4"><Link href="/auth/signin">{t('auth.button')}</Link></Button>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="text-center py-8">
                <CardHeader><CardTitle>{t('noData.title')}</CardTitle></CardHeader>
                <CardContent>
                    <CardDescription>{t('noData.description')}</CardDescription>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <h1 className="text-3xl font-bold">{t('title')}</h1>
            </div>
            <p className="text-muted-foreground">{t('description')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard title={t('carbonFootprint')} value={data.carbonFootprint.total} unit={data.carbonFootprint.unit} trend={data.carbonFootprint.trend} icon={<Circle className="h-4 w-4 text-muted-foreground" />} higherIsBetter={false} />
                <MetricCard title={t('waterEfficiency')} value={data.waterUsage.efficiency} unit={data.waterUsage.unit} trend={data.waterUsage.trend} icon={<Droplets className="h-4 w-4 text-muted-foreground" />} />
                <MetricCard title={t('biodiversityScore')} value={data.biodiversityScore.score} unit={data.biodiversityScore.unit} trend={data.biodiversityScore.trend} icon={<PawPrint className="h-4 w-4 text-muted-foreground" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5"/> {t('practicesTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('practicesTable.practice')}</TableHead>
                                    <TableHead>{t('practicesTable.lastLogged')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.sustainablePractices.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.practice}</TableCell>
                                        <TableCell>{format(new Date(p.lastLogged), 'PPP')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5"/> {t('certificationsTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('certificationsTable.certification')}</TableHead>
                                    <TableHead>{t('certificationsTable.status')}</TableHead>
                                    <TableHead>{t('certificationsTable.expiry')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.certifications.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell><Badge>{c.status}</Badge></TableCell>
                                        <TableCell>{format(new Date(c.expiry), 'PPP')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
