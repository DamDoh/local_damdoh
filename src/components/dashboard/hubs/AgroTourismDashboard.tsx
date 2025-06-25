// src/components/dashboard/hubs/AgroTourismDashboard.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase'; // Assuming firebaseApp is exported from here
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { MapPin, Calendar, Star } from 'lucide-react';
import { AgroTourismDashboardData } from '@/lib/types'; // Import the interface


// Assume mock getAgroTourismDashboardData is available via firebase functions
const functions = getFunctions(firebaseApp);
const getAgroTourismDashboardDataCallable = httpsCallable<void, AgroTourismDashboardData>(functions, 'getAgroTourismDashboardData');


export const AgroTourismDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AgroTourismDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the mock Firebase function
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
      <h1 className="text-3xl font-bold mb-6">Agro-Tourism Operator Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Upcoming Bookings */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4"/> Upcoming Bookings</CardTitle>
             <CardDescription>Your scheduled agro-tourism experiences.</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.upcomingBookings.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Experience</TableHead>
                     <TableHead>Guest Name</TableHead>
                     <TableHead>Date</TableHead>
                     <TableHead>Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.upcomingBookings.map((booking) => (
                     <TableRow key={booking.id}>
                       <TableCell className="font-medium">{booking.experienceTitle}</TableCell>
                       <TableCell>{booking.guestName}</TableCell>
                       <TableCell>{booking.date}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={booking.actionLink}>View Details</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
             )}
           </CardContent>
         </Card>

         {/* Listed Experiences */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-green-500"/> Listed Experiences</CardTitle>
             <CardDescription>Manage your agro-tourism offerings.</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.listedExperiences.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Title</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Bookings</TableHead>
                     <TableHead>Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.listedExperiences.map((experience) => (
                     <TableRow key={experience.id}>
                       <TableCell className="font-medium">{experience.title}</TableCell>
                       <TableCell>{experience.location}</TableCell>
                       <TableCell><Badge variant="secondary">{experience.status}</Badge></TableCell>
                       <TableCell>{experience.bookingsCount}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={experience.actionLink}>Manage</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">No agro-tourism experiences listed yet.</p>
             )}
           </CardContent>
         </Card>

          {/* Guest Reviews */}
         <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500"/> Guest Reviews</CardTitle>
                <CardDescription>Latest feedback from your guests.</CardDescription>
            </CardHeader>
            <CardContent>
                {dashboardData.guestReviews.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.guestReviews.map((review) => (
                            <div key={review.id} className="text-sm p-2 border rounded-lg">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{review.guestName} on "{review.experienceTitle}"</p>
                                    {getRatingStars(review.rating)}
                                </div>
                                <p className="text-xs text-muted-foreground italic mt-1">"{review.comment}"</p>
                                <Button asChild variant="link" size="sm" className="px-0 pt-1">
                                    <Link href={review.actionLink}>View Review</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground">No guest reviews yet.</p>
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
        <Skeleton className="h-64 w-full rounded-lg" />
         <Skeleton className="h-32 w-full rounded-lg md:col-span-1" />
    </div>
);
```

```typescript
// src/lib/types.ts
// (Add this interface definition to your existing types.ts file)

export interface AgroTourismDashboardData {
    listedExperiences: {
        id: string;
        title: string;
        location: string;
        status: 'Active' | 'Draft' | 'Paused';
        bookingsCount: number;
        actionLink: string;
    }[];
    upcomingBookings: {
        id: string;
        experienceTitle: string;
        guestName: string;
        date: string;
        actionLink: string;
    }[];
    guestReviews: {
        id: string;
        guestName: string;
        experienceTitle: string;
        rating: number; // e.g., 1-5
        comment: string;
        actionLink: string;
    }[];
}
```

```typescript
// firebase/functions/src/hubs.ts
// (Add this mock function to your existing hubs.ts file)

import * as functions from "firebase-functions";

// Assume other imports and function definitions exist above

// Mock data for the AgroTourismDashboard
const mockAgroTourismData = {
    listedExperiences: [
        {
            id: "exp1",
            title: "Farm to Table Tour",
            location: "Green Valley Farm",
            status: "Active" as 'Active' | 'Draft' | 'Paused',
            bookingsCount: 15,
            actionLink: "/dashboard/agrotourism/experiences/exp1",
        },
        {
            id: "exp2",
            title: "Organic Farming Workshop",
            location: "Sunny Acres",
            status: "Active" as 'Active' | 'Draft' | 'Paused',
            bookingsCount: 8,
            actionLink: "/dashboard/agrotourism/experiences/exp2",
        },
         {
            id: "exp3",
            title: "Seasonal Harvest Festival",
            location: "Riverbend Orchards",
            status: "Paused" as 'Active' | 'Draft' | 'Paused',
            bookingsCount: 2,
            actionLink: "/dashboard/agrotourism/experiences/exp3",
        },
    ],
    upcomingBookings: [
        {
            id: "book1",
            experienceTitle: "Farm to Table Tour",
            guestName: "Alice Johnson",
            date: "2023-11-15",
            actionLink: "/dashboard/agrotourism/bookings/book1",
        },
        {
            id: "book2",
            experienceTitle: "Organic Farming Workshop",
            guestName: "Bob Williams",
            date: "2023-11-20",
            actionLink: "/dashboard/agrotourism/bookings/book2",
        },
    ],
    guestReviews: [
        {
            id: "review1",
            guestName: "Charlie Davis",
            experienceTitle: "Farm to Table Tour",
            rating: 5,
            comment: "Amazing experience! Learned so much.",
            actionLink: "/dashboard/agrotourism/reviews/review1",
        },
        {
            id: "review2",
            guestName: "Diana Miller",
            experienceTitle: "Organic Farming Workshop",
            rating: 4,
            comment: "Very informative, though slightly long.",
            actionLink: "/dashboard/agrotourism/reviews/review2",
        },
    ],
};


export const getAgroTourismDashboardData = functions.https.onCall((data, context) => {
    // You would typically add authentication and validation here
    // For this mock, we just return the data

    console.log("Fetching mock Agro-Tourism dashboard data");

    return mockAgroTourismData;
});

// Ensure other functions are still exported
// export const yourOtherFunction = functions.https.onCall(...);