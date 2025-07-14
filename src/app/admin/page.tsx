
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Users, Tractor, ShoppingCart, UserPlus, FileText } from 'lucide-react';
import type { AdminDashboardData, AdminActivity } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { StakeholderIcon } from '@/components/icons/StakeholderIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const functions = getFunctions(firebaseApp);

const StatCard = ({ title, value, icon, description }: { title: string; value: string | number; icon: React.ReactNode; description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const ActivityIcon = ({ type }: { type: string }) => {
    const iconMap: Record<string, React.ElementType> = {
        'New User': UserPlus,
        'New Listing': ShoppingCart
    };
    const IconComponent = iconMap[type] || FileText;
    return <IconComponent className="h-4 w-4" />;
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard');
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAdminDashboardDataCallable = useMemo(() => httpsCallable(functions, 'getAdminDashboardData'), []);
  const getAdminRecentActivityCallable = useMemo(() => httpsCallable(functions, 'getAdminRecentActivity'), []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dataResult, activityResult] = await Promise.all([
          getAdminDashboardDataCallable(),
          getAdminRecentActivityCallable()
        ]);
        setData(dataResult.data as AdminDashboardData);
        setActivity((activityResult.data as any).activity || []);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getAdminDashboardDataCallable, getAdminRecentActivityCallable]);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-96" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('totalUsers')} value={data?.totalUsers ?? 0} description={t('totalUsersDesc', {count: data?.newUsersLastWeek ?? 0})} icon={<Users />} />
        <StatCard title={t('totalFarms')} value={data?.totalFarms ?? 0} description={t('totalFarmsDesc')} icon={<Tractor />} />
        <StatCard title={t('totalListings')} value={data?.totalListings ?? 0} description={t('totalListingsDesc')} icon={<ShoppingCart />} />
        <StatCard title={t('pendingApprovals')} value={data?.pendingApprovals ?? 0} description={t('pendingApprovalsDesc')} icon={<FileText />} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity.title')}</CardTitle>
          <CardDescription>{t('recentActivity.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('recentActivity.table.type')}</TableHead>
                <TableHead>{t('recentActivity.table.details')}</TableHead>
                <TableHead>{t('recentActivity.table.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity.length > 0 ? activity.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                     <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                        <ActivityIcon type={item.type}/>
                        {t(`recentActivity.types.${item.type.replace(/\s/g, '')}` as any, item.type)}
                     </Badge>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.avatarUrl || undefined} />
                            <AvatarFallback>{item.primaryInfo.substring(0,1)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={item.link} target="_blank" className="font-medium text-primary hover:underline">{item.primaryInfo}</Link>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {item.secondaryInfo && <><StakeholderIcon role={item.secondaryInfo} className="h-3 w-3" /> {item.secondaryInfo}</>}
                            </p>
                          </div>
                      </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">{t('recentActivity.noActivity')}</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
