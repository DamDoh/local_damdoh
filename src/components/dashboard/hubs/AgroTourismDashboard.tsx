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
import { MapPin, Calendar, Star, Sun, Settings } from 'lucide-react';
import type { AgroTourismDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';


const functions = getFunctions(firebaseApp);


export const AgroTourismDashboard = () => {
  const t = useTranslations('AgroTourismDashboard');
  const [dashboardData, setDashboardData] = useState<AgroTourismDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAgroTourismDashboardDataCallable = useMemo(() => httpsCallable<void, AgroTourismDashboardData>(functions, 'getAgroTourismDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAgroTourismDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Agro-Tourism dashboard data:", err);
        setError("Failed to load Agro-Tourism dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getAgroTourismDashboardDataCallable]);

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
                    <p>{t('noData')}</p>
                </CardContent>
           </Card>
      );
  }

    const { upcomingBookings, listedExperiences, guestReviews } = dashboardData;

    const getRatingStars = (rating: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                stars.push(<Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />);
            } else {
                stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
            }
        }
        return <div className="flex gap-0.5">{stars}</div>;
    };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Sun className="h-8 w-8 text-amber-500" />
        {t('title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Upcoming Bookings */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4"/> {t('bookingsTitle')}</CardTitle>
             <CardDescription>{t('bookingsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {(upcomingBookings || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.experience')}</TableHead>
                     <TableHead>{t('table.guest')}</TableHead>
                     <TableHead>{t('table.date')}</TableHead>
                     <TableHead>{t('table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(upcomingBookings || []).map((booking) => (
                     <TableRow key={booking.id}>
                       <TableCell className="font-medium">{booking.experienceTitle}</TableCell>
                       <TableCell>{booking.guestName}</TableCell>
                       <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={booking.actionLink}>{t('viewDetailsButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noBookings')}</p>
             )}
           </CardContent>
         </Card>

         {/* Listed Experiences */}
         <Card>
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-green-500"/> {t('experiencesTitle')}</CardTitle>
             <CardDescription>{t('experiencesDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {(listedExperiences || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.title')}</TableHead>
                     <TableHead>{t('table.status')}</TableHead>
                     <TableHead>{t('table.bookings')}</TableHead>
                     <TableHead>{t('table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(listedExperiences || []).map((experience) => (
                     <TableRow key={experience.id}>
                       <TableCell className="font-medium">{experience.title}</TableCell>
                       <TableCell><Badge variant={experience.status === 'Published' ? 'default' : 'secondary'}>{experience.status}</Badge></TableCell>
                       <TableCell>{experience.bookingsCount}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={experience.actionLink}><Settings className="h-4 w-4 mr-2" />{t('manageButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noExperiences')}</p>
             )}
           </CardContent>
         </Card>

          {/* Guest Reviews */}
         <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500"/> {t('reviewsTitle')}</CardTitle>
                <CardDescription>{t('reviewsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {(guestReviews || []).length > 0 ? (
                    <div className="space-y-3">
                        {(guestReviews || []).map((review) => (
                            <div key={review.id} className="text-sm p-3 border rounded-lg">
                                <div className="flex justify-between items-start">
                                    <p className="font-medium">{review.guestName} {t('on')} "{review.experienceTitle}"</p>
                                    {getRatingStars(review.rating)}
                                </div>
                                <p className="text-xs text-muted-foreground italic mt-1">"{review.comment}"</p>
                                <Button asChild variant="link" size="sm" className="px-0 pt-1">
                                    <Link href={review.actionLink}>{t('viewReviewButton')}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">{t('noReviews')}</p>
                )}
            </CardContent>
         </Card>

      </div>
    </div>
  );
};


const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-64 mb-6" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
    </div>
);