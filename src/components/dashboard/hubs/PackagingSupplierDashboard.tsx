
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Box, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { PackagingSupplierDashboardData } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export const PackagingSupplierDashboard = () => {
    const [dashboardData, setDashboardData] = useState<PackagingSupplierDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getPackagingData = useMemo(() => httpsCallable(functions, 'getPackagingSupplierDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getPackagingData();
                setDashboardData(result.data as PackagingSupplierDashboardData);
            } catch (error) {
                console.error("Error fetching packaging supplier dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getPackagingData]);
    
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <Card><CardContent className="pt-6 text-center text-destructive"><p>{error}</p></CardContent></Card>;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No dashboard data available.</p>
            </div>
        );
    }

    const { incomingOrders, inventory } = dashboardData;
    
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'New': return 'default';
            case 'Processing': return 'secondary';
            case 'Shipped': return 'outline';
            default: return 'outline';
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Packaging Supplier Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <Card className="lg:col-span-2">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Package className="h-4 w-4" />
                           Incoming Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {(incomingOrders || []).length > 0 ? (
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Customer</TableHead>
                                       <TableHead>Product</TableHead>
                                       <TableHead>Quantity</TableHead>
                                       <TableHead>Status</TableHead>
                                       <TableHead className="text-right">Action</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {(incomingOrders || []).map(order => (
                                       <TableRow key={order.id}>
                                           <TableCell className="font-medium">{order.customerName}</TableCell>
                                           <TableCell>{order.product}</TableCell>
                                           <TableCell>{order.quantity.toLocaleString()}</TableCell>
                                           <TableCell><Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge></TableCell>
                                           <TableCell className="text-right">
                                               <Button asChild variant="outline" size="sm">
                                                   <Link href={order.actionLink}>View Order</Link>
                                               </Button>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                        ) : (
                           <p className="text-sm text-center text-muted-foreground py-4">No new orders.</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card>
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Box className="h-4 w-4" />
                           Inventory Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(inventory || []).length > 0 ? (
                            (inventory || []).map(item => {
                                const needsRestock = item.stock < item.reorderLevel;
                                return (
                                <div key={item.id} className={`p-2 border rounded-lg ${needsRestock ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'bg-background'}`}>
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="font-medium">{item.item}</p>
                                        <p className={needsRestock ? 'font-bold text-amber-600' : ''}>{item.stock.toLocaleString()}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Reorder at {item.reorderLevel.toLocaleString()}</p>
                                    {needsRestock && <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 mt-1"><AlertTriangle className="h-3 w-3" />Low Stock</p>}
                                </div>
                                )
                            })
                       ) : (
                           <p className="text-sm text-center text-muted-foreground py-4">No inventory data.</p>
                       )}
                    </CardContent>
                     <CardFooter>
                         <Button asChild className="w-full">
                           <Link href="/marketplace/create?category=packaging-solutions">List New Product</Link>
                         </Button>
                     </CardFooter>
                </Card>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div>
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-lg lg:col-span-2" />
            <Skeleton className="h-64 rounded-lg" />
        </div>
    </div>
);
