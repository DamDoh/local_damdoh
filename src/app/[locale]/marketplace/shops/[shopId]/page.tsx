
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import type { Shop, MarketplaceItem, UserProfile } from '@/lib/types';
import { getProfileByIdFromDB } from '@/lib/db-utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from "next/image";
import { ItemCard } from '@/components/marketplace/ItemCard';
import { Building, ArrowLeft, MessageSquare, Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';

function ShopPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-48" />
            <Card className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="pt-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-5 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="w-52 space-y-2">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ShopFrontPage() {
    const t = useTranslations('Marketplace.shopPage');
    const params = useParams();
    const shopId = params.shopId as string;
    const { user } = useAuth();
  
    const [shop, setShop] = useState<Shop | null>(null);
    const [owner, setOwner] = useState<UserProfile | null>(null);
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getShopDetails = useMemo(() => httpsCallable(functions, 'getShopDetails'), [functions]);
    const getListingsBySeller = useMemo(() => httpsCallable(functions, 'getListingsBySeller'), [functions]);

    useEffect(() => {
        if (!shopId) return;

        const fetchShopData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const shopResult = await getShopDetails({ shopId });
                const shopData = shopResult.data as Shop | null;

                if (!shopData) {
                    throw new Error(t('errorNotFound'));
                }
                setShop(shopData);

                const [ownerProfile, listingsResult] = await Promise.all([
                    getProfileByIdFromDB(shopData.ownerId),
                    getListingsBySeller({ sellerId: shopData.ownerId })
                ]);

                setOwner(ownerProfile);
                setItems(((listingsResult.data as { items: MarketplaceItem[] })?.items) || []);

            } catch (err: any) {
                console.error("Error fetching shop data:", err);
                setError(err.message || t('errorLoad'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchShopData();
    }, [shopId, getShopDetails, getListingsBySeller, t]);

    if (isLoading) {
        return <ShopPageSkeleton />;
    }

    if (error) {
        return (
            <Card className="text-center p-8">
                <CardTitle className="text-destructive">{t('errorTitle')}</CardTitle>
                <CardDescription>{error}</CardDescription>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />{t('backLink')}</Link>
                </Button>
            </Card>
        );
    }
    
    if (!shop) {
        return notFound();
    }

    const isOwner = user?.uid === shop.ownerId;

    return (
        <div className="space-y-8">
            <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
            </Link>

            <Card className="overflow-hidden">
                 <div className="relative h-48 bg-muted">
                    <Image 
                        src={shop.bannerUrl || `https://placehold.co/1200x300.png?text=${encodeURIComponent(shop.name)}`}
                        alt={`${shop.name} banner`}
                        fill
                        style={{objectFit: 'cover'}}
                        priority
                        data-ai-hint="business banner storefront"
                    />
                 </div>
                 <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-background border rounded-md -mt-12 shadow-md">
                                <Building className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl md:text-3xl">{shop.name}</CardTitle>
                                <CardDescription>{t('ownedBy')} <Link href={`/profiles/${shop.ownerId}`} className="text-primary hover:underline">{owner?.displayName || t('loadingOwner')}</Link></CardDescription>
                            </div>
                        </div>
                         <div className="flex gap-2 w-full sm:w-auto">
                            {isOwner ? (
                                <Button className="w-full sm:w-auto"><Edit className="mr-2 h-4 w-4" />{t('editShopButton')}</Button>
                            ) : (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href={`/messages?with=${shop.ownerId}`}>
                                        <MessageCircle className="mr-2 h-4 w-4" /> {t('contactButton')}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground max-w-2xl">{shop.description}</p>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-semibold mb-4">{t('listingsTitle', { shopName: shop.name })} ({items.length})</h2>
                {items.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {items.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                         <CardDescription>{t('noListings')}</CardDescription>
                    </Card>
                )}
            </div>
        </div>
    );
}
