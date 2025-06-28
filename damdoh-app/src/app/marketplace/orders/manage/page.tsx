
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { Home, ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceOrder } from '@/lib/types';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

const functions = getFunctions(firebaseApp);

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';

const getStatusBadgeVariant = (status: OrderStatus) => {
    switch(status) {
        case 'pending': return 'secondary';
        case 'confirmed': return 'default';
        case 'shipped': return 'default';
        case 'completed': return 'default';
        case 'cancelled': return 'destructive';
        default: return 'outline';
    }
};

const getStatusBadgeClass = (status: OrderStatus) => {
    switch(status) {
        case 'confirmed': return 'bg-blue-600 hover:bg-blue-700';
        case 'shipped': return 'bg-indigo-600 hover:bg-indigo-700';
        case 'completed': return 'bg-green-600 hover:bg-green-700';
        default: return '';
    }
}

export default function ManageOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

    const getSellerOrders = useMemo(() => httpsCallable(functions, 'getSellerOrders'), []);
    const updateOrderStatus = useMemo(() => httpsCallable(functions, 'updateOrderStatus'), []);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getSellerOrders();
            const data = result.data as { orders: MarketplaceOrder[] };
            setOrders(data.orders || []);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: `Could not fetch orders: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    }, [getSellerOrders, toast]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchOrders();
        }
        if (!authLoading && !user) {
            setIsLoading(false);
        }
    }, [user, authLoading, fetchOrders]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
        try {
            await updateOrderStatus({ orderId, newStatus });
            toast({ title: "Status Updated", description: `Order status changed to ${newStatus}.`});
            // Refetch or update state optimistically
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
        );
    }
    
    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Unauthorized</CardTitle>
                    <CardDescription>You must be logged in to manage your orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild><Link href="/auth/signin">Sign In</Link></Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Button asChild variant="outline">
                <Link href="/"><Home className="mr-2 h-4 w-4" />Back to Dashboard</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                        Manage Your Marketplace Orders
                    </CardTitle>
                    <CardDescription>View, confirm, and update the status of orders for your products and services.</CardDescription>
                </CardHeader>
                <CardContent>
                   {orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Image 
                                                    src={order.listingImageUrl || 'https://placehold.co/64x64.png'} 
                                                    alt={order.listingName}
                                                    width={40} height={40}
                                                    className="rounded-md object-cover border"
                                                />
                                                <div>
                                                    <p className="font-medium line-clamp-1">{order.listingName}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span title={new Date(order.createdAt as string).toLocaleString()}>{order.createdAt ? formatDistanceToNow(new Date(order.createdAt as string), { addSuffix: true }) : 'N/A'}</span>
                                        </TableCell>
                                        <TableCell className="font-semibold">{order.currency} {order.totalPrice.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(order.status as OrderStatus)} className={cn(getStatusBadgeClass(order.status as OrderStatus))}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Select 
                                                defaultValue={order.status}
                                                onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                                                disabled={updatingStatus[order.id]}
                                            >
                                                <SelectTrigger className="w-[150px] h-9">
                                                    <SelectValue placeholder="Update status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                   ) : (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="font-medium">You have no orders yet.</p>
                            <p className="text-sm mt-1">When buyers order your products, they will appear here.</p>
                             <Button asChild variant="secondary" className="mt-4"><Link href="/marketplace/create">Create a New Listing</Link></Button>
                        </div>
                   )}
                </CardContent>
            </Card>
        </div>
    );
}
