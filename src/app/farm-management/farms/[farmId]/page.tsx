
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Home, Tractor, MapPin, Leaf, Droplets, Sprout, PlusCircle, ListCollapse, DollarSign, Edit, Fish, Drumstick, CalendarDays, NotebookPen, ListChecks, PackageSearch, Eye, HardHat, Weight } from 'lucide-react';
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
}

// Type for individual crop data
interface Crop {
    id: string;
    crop_type: string;
    current_stage?: string;
    planting_date?: { _seconds: number; _nanoseconds: number; }; // Firestore Timestamp structure
}

interface TraceabilityEvent {
    id: string;
    eventType: string;
    timestamp: { _seconds: number; _nanoseconds: number; };
    payload: { [key: string]: any };
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

const getEventIcon = (eventType: string) => {
    const iconProps = { className: "h-5 w-5 text-primary" };
    switch (eventType) {
        case 'PLANTED': return <Sprout {...iconProps} />;
        case 'OBSERVED': return <Eye {...iconProps} />;
        case 'INPUT_APPLIED': return <Droplets {...iconProps} />;
        case 'HARVESTED': return <Weight {...iconProps} />;
        default: return <HardHat {...iconProps} />;
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

function CropActivityLog({ farmFieldId }: { farmFieldId: string }) {
    const [events, setEvents] = useState<TraceabilityEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const functions = getFunctions(firebaseApp);
    const getEventsCallable = useMemo(() => httpsCallable(functions, 'getTraceabilityEventsByFarmField'), [functions]);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const result = await getEventsCallable({ farmFieldId });
                setEvents(result.data as TraceabilityEvent[]);
            } catch (error) {
                console.error("Error fetching activity log:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [farmFieldId, getEventsCallable]);

    if (isLoading) {
        return <div className="p-4"><Skeleton className="h-16 w-full" /></div>;
    }

    if (events.length === 0) {
        return <p className="p-4 text-xs text-muted-foreground text-center">No activities logged for this crop yet.</p>;
    }
    
    return (
        <div className="p-4 space-y-4">
            <h4 className="font-semibold text-sm">Activity Log</h4>
            <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 h-full w-0.5 bg-border -z-10"></div>
                {events.map((event) => (
                    <div key={event.id} className="relative flex items-start gap-4 mb-4">
                        <div className="absolute left-0 top-0 -translate-x-1/2 h-full flex items-center">
                           <div className="bg-background p-1 rounded-full border">
                               {getEventIcon(event.eventType)}
                           </div>
                        </div>
                        <div className="pl-4">
                            <p className="text-sm font-medium">{event.eventType}</p>
                            <p className="text-xs text-muted-foreground">{new Date(event.timestamp._seconds * 1000).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {event.payload?.observationType ? `${event.payload.observationType}: ${event.payload.details}` : JSON.stringify(event.payload)}
                            </p>
                        </div>
                    </div>
                ))}
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
    const [crops, setCrops] = useState<Crop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCrops, setIsLoadingCrops] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getFarmCallable = useMemo(() => httpsCallable(functions, 'getFarm'), [functions]);
    const getFarmCropsCallable = useMemo(() => httpsCallable(functions, 'getFarmCrops'), [functions]);

    useEffect(() => {
        if (user && farmId) {
            setIsLoading(true);
            setError(null);
            
            getFarmCallable({ farmId })
                .then((result) => {
                    const farmData = result.data as FarmDetails;
                    if (farmData && farmData.name) { 
                        setFarm(farmData);
                        // After fetching farm, fetch its crops
                        setIsLoadingCrops(true);
                        getFarmCropsCallable({ farmId })
                            .then((cropsResult) => {
                                setCrops(cropsResult.data as Crop[]);
                            })
                            .catch((cropsError) => {
                                console.error("Error fetching farm crops:", cropsError);
                            })
                            .finally(() => {
                                setIsLoadingCrops(false);
                            });
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
    }, [user, farmId, getFarmCallable, getFarmCropsCallable]);

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
                        <CardTitle className="text-lg flex items-center gap-2"><ListChecks className="h-5 w-5"/> Crops / Livestock</CardTitle>
                        <Button asChild variant="outline" size="sm">
                           <Link href={`/farm-management/farms/${farmId}/create-crop`}>
                             <PlusCircle className="mr-2 h-4 w-4"/>Add New
                           </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingCrops ? (
                            <div className="space-y-2">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ) : crops.length > 0 ? (
                           <Accordion type="single" collapsible className="w-full">
                                {crops.map(crop => (
                                    <AccordionItem value={crop.id} key={crop.id}>
                                        <AccordionTrigger className="p-3 hover:bg-accent/50 rounded-lg hover:no-underline">
                                            <div className="flex justify-between items-start w-full">
                                                <div>
                                                    <p className="font-semibold text-left">{crop.crop_type}</p>
                                                    {crop.planting_date && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                                            <CalendarDays className="h-3 w-3" />
                                                            Planted: {new Date(crop.planting_date._seconds * 1000).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                {crop.current_stage && <Badge variant="secondary">{crop.current_stage}</Badge>}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="border-t border-b">
                                                <CropActivityLog farmFieldId={crop.id} />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 pt-4 px-4">
                                                <Button asChild variant="secondary" size="sm" className="flex-1 min-w-[140px]">
                                                    <Link href={`/farm-management/farms/${farmId}/crops/${crop.id}/log-observation`}>
                                                        <NotebookPen className="mr-2 h-4 w-4"/>
                                                        Log Observation
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="default" size="sm" className="flex-1 min-w-[140px]">
                                                    <Link href={`/farm-management/farms/${farmId}/crops/${crop.id}/log-harvest?cropType=${encodeURIComponent(crop.crop_type)}`}>
                                                        <PackageSearch className="mr-2 h-4 w-4"/>
                                                        Log Harvest
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm" className="flex-1 min-w-[140px]">
                                                    <Link href={`/marketplace/create?cropId=${crop.id}&cropName=${encodeURIComponent(crop.crop_type)}`}>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        Create Listing
                                                    </Link>
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                                <p>No crops or livestock added yet.</p>
                                <p className="text-xs text-muted-foreground mt-1">Use the button above to add your first entry.</p>
                            </div>
                        )}
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
                            <p className="text-xs text-muted-foreground mt-1">You'll be able to log expenses and revenues here.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
