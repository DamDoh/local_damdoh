
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Home, Tractor, MapPin, Leaf, Droplets, Sprout, PlusCircle, ListCollapse, DollarSign, Edit, Fish, Drumstick } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// A more detailed Farm type for this page
interface FarmDetails {
  id: string;
  name: string;
  location: string;
  farm_type: string;
  size?: string;
  description?: string;
  irrigationMethods?: string;
  // future fields
  // crops?: Crop[];
  // activityLog?: Activity[];
}

const getFarmTypeIcon = (farmType: string) => {
    const iconProps = { className: "h-5 w-5 text-muted-foreground" };
    switch (farmType?.toLowerCase()) {
        case 'crop': return <Sprout {...iconProps} />;
        case 'livestock': return <Drumstick {...iconProps} />;
        case 'mixed': return <Tractor {...iconProps} />;
        case 'aquaculture': return <Fish {...iconProps} />;
        default: return <Home {...iconProps} />;
    }
};

function FarmDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-48" />
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function FarmDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const farmId = params.farmId as string;
    
    const [farm, setFarm] = useState<FarmDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getFarmCallable = useMemo(() => httpsCallable(functions, 'getFarm'), [functions]);

    useEffect(() => {
        if (user && farmId) {
            setIsLoading(true);
            setError(null);
            
            getFarmCallable({ farmId })
                .then((result) => {
                    const farmData = result.data as FarmDetails;
                    if (farmData && farmData.name) { // Check if farmData is valid
                        setFarm(farmData);
                    } else {
                        setError("Farm not found or you do not have permission to view it.");
                    }
                })
                .catch((err) => {
                    console.error("Error fetching farm details:", err);
                    setError(err.message || "Failed to load farm details.");
                    setFarm(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [user, farmId, getFarmCallable]);

    if (isLoading) {
        return <FarmDetailSkeleton />;
    }

    if (error) {
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href="/farm-management"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Farmer's Hub</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    if (!farm) {
        return (
            <Card className="text-center">
                 <CardHeader>
                    <CardTitle>Farm Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href="/farm-management"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Farmer's Hub</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/farm-management">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farmer's Hub
                </Link>
            </Button>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                             <div className="flex items-center gap-3">
                                <Tractor className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle className="text-3xl">{farm.name}</CardTitle>
                                    <CardDescription className="text-md flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> {farm.location}
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm">
                            <Edit className="mr-2 h-4 w-4"/>
                            Edit Farm Details
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t">
                     <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-md">{getFarmTypeIcon(farm.farm_type)}</div>
                        <div>
                            <p className="text-sm text-muted-foreground">Farm Type</p>
                            <p className="font-medium capitalize">{farm.farm_type}</p>
                        </div>
                    </div>
                     {farm.size && (
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-muted rounded-md"><Leaf className="h-5 w-5 text-muted-foreground"/></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Size</p>
                                <p className="font-medium">{farm.size}</p>
                            </div>
                        </div>
                     )}
                     {farm.irrigationMethods && (
                        <div className="flex items-center gap-2">
                             <div className="p-2 bg-muted rounded-md"><Droplets className="h-5 w-5 text-muted-foreground"/></div>
                             <div>
                                <p className="text-sm text-muted-foreground">Irrigation</p>
                                <p className="font-medium">{farm.irrigationMethods}</p>
                             </div>
                        </div>
                     )}
                      {farm.description && (
                        <div className="md:col-span-2">
                             <h4 className="text-sm font-semibold mb-1">Description</h4>
                             <p className="text-sm text-muted-foreground">{farm.description}</p>
                        </div>
                      )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg flex items-center gap-2"><Sprout className="h-5 w-5"/> Crops / Livestock</CardTitle>
                        <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add New Crop</Button>
                    </CardHeader>
                    <CardContent>
                         <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                            <p>No crops or livestock added yet.</p>
                            <p className="text-xs">Use the button above to add your first entry.</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5"/> Farm Financials</CardTitle>
                         <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Transaction</Button>
                    </CardHeader>
                    <CardContent>
                       <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                            <p>Financial tracking coming soon.</p>
                            <p className="text-xs">You'll be able to log expenses and revenues here.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2"><ListCollapse className="h-5 w-5"/> Activity Log</CardTitle>
                     <CardDescription>A log of all activities related to this farm, from planting to harvest.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                        <p>The farm activity log will be displayed here.</p>
                        <p className="text-xs">This feature is under development.</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
