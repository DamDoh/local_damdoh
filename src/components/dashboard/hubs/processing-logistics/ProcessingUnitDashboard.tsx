
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Sliders, Package, Trash2, TrendingUp, AlertTriangle, Box, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ProcessingUnitDashboardData } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ProcessingUnitDashboard = () => {
    const [dashboardData, setDashboardData] = useState<ProcessingUnitDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getProcessingUnitData = useMemo(() => httpsCallable(functions, 'getProcessingUnitDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getProcessingUnitData();
                setDashboardData(result.data as ProcessingUnitDashboardData);
            } catch (error) {
                console.error("Error fetching processing unit dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getProcessingUnitData]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Could not load dashboard data.</p>
            </div>
        );
    }

    const { yieldOptimization, inventory, wasteReduction, packagingOrders, packagingInventory } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Processing Unit Operations</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Yield Optimization</CardTitle>
                        <Sliders className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{yieldOptimization.currentYield}%</div>
                        <p className="text-xs text-muted-foreground">Potential: {yieldOptimization.potentialYield}%</p>
                        <p className="text-xs mt-2">{yieldOptimization.suggestion}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Waste Reduction Insight</CardTitle>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wasteReduction.currentRate}%</div>
                        <p className="text-xs text-muted-foreground">{wasteReduction.insight}</p>
                    </CardContent>
                </Card>
                
                <Card className="lg:row-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Box className="h-4 w-4" />
                            Packaging Inventory
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {packagingInventory?.length > 0 ? (
                           packagingInventory.map((item, index) => (
                               <div key={index} className="text-sm p-2 bg-background rounded-md border">
                                   <p className="font-medium">{item.packagingType}</p>
                                   <p className="text-xs">In Stock: {item.unitsInStock.toLocaleString()}</p>
                                   <p className="text-xs text-muted-foreground">Reorder Level: {item.reorderLevel.toLocaleString()}</p>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">No packaging inventory tracked.</p>
                       )}
                    </CardContent>
                     <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="/marketplace?category=packaging-solutions">Source Packaging</Link>
                        </Button>
                    </CardFooter>
                </Card>

                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package />
                            Raw Material Inventory
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {inventory?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quality</TableHead>
                                        <TableHead className="text-right">Quantity (tons)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.product}</TableCell>
                                            <TableCell><Badge variant="outline">{item.quality}</Badge></TableCell>
                                            <TableCell className="text-right font-semibold">{item.tons}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No inventory data available.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Truck />
                           Packaging Orders
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        {packagingOrders?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Delivery Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packagingOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.supplierName}</TableCell>
                                            <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                                            <TableCell><Badge variant={order.status === 'Pending' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={order.actionLink}>View</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">No packaging orders found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div>
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
