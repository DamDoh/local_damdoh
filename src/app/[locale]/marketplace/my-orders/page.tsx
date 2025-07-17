"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart, MoreHorizontal } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MarketplaceOrder } from '@/lib/types';
import { useTranslations } from 'next-intl';

function OrderPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-6 w-40" />
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/3"/></CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function MyOrdersPage() {
    const t = useTranslations('Marketplace.myOrders');
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    // Assuming 'getMyMarketplaceOrders' is the correct backend function name
    const getMyMarketplaceOrdersCallable = useMemo(() => httpsCallable(functions, 'getMyMarketplaceOrders'), []);
    // Assuming 'updateMarketplaceOrderStatus' is the correct backend function name for buyer/seller actions
    const updateMarketplaceOrderStatusCallable = useMemo(() => httpsCallable(functions, 'updateMarketplaceOrderStatus'), []);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getMyMarketplaceOrdersCallable();
            // Assuming the backend returns an object with an 'orders' key
            setOrders((result?.data as any)?.orders || []);
        } catch (error: any) {
            toast({ variant: "destructive", title: t('toast.errorTitle'), description: t('toast.fetchError') });
        } finally {
            setIsLoading(false);
        }
    }, [getMyMarketplaceOrdersCallable, toast, t]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else if (!authLoading) {
            setIsLoading(false); // Not logged in, stop loading
        }
    }, [user, authLoading, fetchOrders]);

    // This handler might need adjustment depending on whether this page is for buyer or seller orders.
    // Assuming this is for *buyer* orders, updating status might not be applicable or require different logic.
    // If this is for *seller* orders, the status updates should align with seller actions (e.g., confirm, ship).
    // The provided code snippet seems to assume seller orders due to the update status options.
    // Let's keep it for now but note this potential ambiguity.
    const handleStatusUpdate = async (orderId: string, newStatus: MarketplaceOrder['status']) => {
        try {
            await updateMarketplaceOrderStatusCallable({ orderId, newStatus });
            toast({ title: t('toast.successTitle'), description: t('toast.updateSuccess', { status: t(`status.${newStatus}`) }) });
            fetchOrders(); // Refresh the list
        } catch (error: any) {
            toast({ variant: "destructive", title: t('toast.failTitle'), description: error.message });
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'new': return 'default';
            case 'confirmed': return 'secondary';
            case 'shipped': return 'outline';
            case 'completed': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    if (isLoading || authLoading) {
        return <OrderPageSkeleton />;
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

    return (
        <div className="space-y-6">
            <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-6 w-6" />{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table.date')}</TableHead>
                                    {/* Assuming this is the buyer's order page - show seller, not buyer */}
                                    <TableHead>{t('table.seller')}</TableHead>
                                    <TableHead>{t('table.product')}</TableHead>
                                    <TableHead>{t('table.total')}</TableHead>
                                    <TableHead>{t('table.status')}</TableHead>
                                    {/* Actions might not be available for buyers, or different actions */}
                                    {/* <TableHead className="text-right">{t('table.actions')}</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                        {/* Assuming this is buyer's order page */}
                                        <TableCell className="flex items-center gap-2">
                                            {/* Assuming order object includes sellerProfile */}
                                            {/* <Avatar className="h-8 w-8">
                                                <AvatarImage src={order.sellerProfile?.avatarUrl} />
                                                <AvatarFallback>{order.sellerProfile?.displayName?.substring(0,1) || '?'}</AvatarFallback>
                                            </Avatar> */}
                                            {/* <span className="font-medium">{order.sellerProfile?.displayName || 'N/A'}</span> */}
                                            {/* Temporary placeholder */}
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>S</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">Seller Name Placeholder</span>
                                        </TableCell>
                                        <TableCell>{order.listingName}</TableCell>
                                        <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant={getStatusBadgeVariant(order.status)}>{t(`status.${order.status}`)}</Badge></TableCell>
                                        {/* Actions for buyer orders would differ */}
                                        {/* <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'cancelled')}>{t('actions.cancelOrder')}</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">{t('noOrders')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart, MoreHorizontal } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MarketplaceOrder } from '@/lib/types';
import { useTranslations } from 'next-intl';

function OrderPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-6 w-40" />
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/3"/></CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function MyOrdersPage() {
    const t = useTranslations('Marketplace.myOrders');
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getSellerOrdersCallable = useMemo(() => httpsCallable(functions, 'getSellerOrders'), []);
    const updateOrderStatusCallable = useMemo(() => httpsCallable(functions, 'updateOrderStatus'), []);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getSellerOrdersCallable();
            setOrders((result?.data as any)?.orders || []);
        } catch (error: any) {
            toast({ variant: "destructive", title: t('toast.errorTitle'), description: t('toast.fetchError') });
        } finally {
            setIsLoading(false);
        }
    }, [getSellerOrdersCallable, toast, t]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else if (!authLoading) {
            setIsLoading(false); // Not logged in, stop loading
        }
    }, [user, authLoading, fetchOrders]);

    const handleStatusUpdate = async (orderId: string, newStatus: MarketplaceOrder['status']) => {
        try {
            await updateOrderStatusCallable({ orderId, newStatus });
            toast({ title: t('toast.successTitle'), description: t('toast.updateSuccess', { status: t(`status.${newStatus}`) }) });
            fetchOrders(); // Refresh the list
        } catch (error: any) {
            toast({ variant: "destructive", title: t('toast.failTitle'), description: error.message });
        }
    };
    
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'new': return 'default';
            case 'confirmed': return 'secondary';
            case 'shipped': return 'outline';
            case 'completed': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    
    if (isLoading || authLoading) {
        return <OrderPageSkeleton />;
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

    return (
        <div className="space-y-6">
            <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-6 w-6" />{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.date')}</TableHead>
                                <TableHead>{t('table.buyer')}</TableHead>
                                <TableHead>{t('table.product')}</TableHead>
                                <TableHead>{t('table.total')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead className="text-right">{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length > 0 ? orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={order.buyerProfile.avatarUrl} />
                                            <AvatarFallback>{order.buyerProfile.displayName.substring(0,1)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{order.buyerProfile.displayName}</span>
                                    </TableCell>
                                    <TableCell>{order.listingName}</TableCell>
                                    <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(order.status)}>{t(`status.${order.status}`)}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'confirmed')}>{t('actions.confirm')}</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'shipped')}>{t('actions.ship')}</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'completed')}>{t('actions.complete')}</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleStatusUpdate(order.id, 'cancelled')}>{t('actions.cancel')}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">{t('noOrders')}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
