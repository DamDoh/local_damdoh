
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import type { MarketplaceItem, UserProfile, Shop } from '@/lib/types';
import { getProfileByIdFromDB } from '@/lib/db-utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import Image from "next/image";
import { ArrowLeft, UserCircle, ShoppingCart, DollarSign, MapPin, Building, MessageCircle, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function ItemPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-24 w-full" />
                    <div className="flex items-center gap-4 pt-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MarketplaceItemPage() {
    const params = useParams();
    const itemId = params.id as string;
    const { user } = useAuth();
  
    const [item, setItem] = useState<MarketplaceItem | null>(null);
    const [seller, setSeller] = useState<UserProfile | null>(null);
    const [shop, setShop] = useState<Shop | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getMarketplaceItemById = useMemo(() => httpsCallable(functions, 'getMarketplaceItemById'), [functions]);
    const getShopDetailsCallable = useMemo(() => httpsCallable(functions, 'getShopDetails'), [functions]);

    useEffect(() => {
        if (!itemId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch the item first
                const itemResult = await getMarketplaceItemById({ itemId });
                const itemData = itemResult.data as MarketplaceItem | null;

                if (!itemData) {
                    throw new Error("Marketplace item not found.");
                }
                setItem(itemData);

                // Then fetch seller and shop details
                const sellerProfile = await getProfileByIdFromDB(itemData.sellerId);
                setSeller(sellerProfile);
                
                // Assuming the first shop is the relevant one for now
                if(sellerProfile && sellerProfile.shops && sellerProfile.shops.length > 0) {
                     const shopResult = await getShopDetailsCallable({ shopId: sellerProfile.shops[0] });
                     setShop(shopResult.data as Shop);
                }

            } catch (err: any) {
                console.error("Error fetching item details:", err);
                setError(err.message || "Could not load the item details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [itemId, getMarketplaceItemById, getShopDetailsCallable]);


    if (isLoading) {
        return <ItemPageSkeleton />;
    }
    
    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" asChild className="mt-4">
                    <Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Back to Marketplace</Link>
                </Button>
            </div>
        )
    }

    if (!item) {
        return notFound();
    }

    const isOwner = user?.uid === item.sellerId;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeft className="mr-1 h-4 w-4"/> Back to Marketplace
            </Link>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start">
                <div className="w-full">
                    <Card className="overflow-hidden sticky top-24">
                        <div className="relative w-full aspect-square bg-muted">
                             <Image
                                src={item.imageUrl || item.imageUrls?.[0] || 'https://placehold.co/600x600.png'}
                                alt={item.name}
                                fill={true}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                                priority
                                data-ai-hint="marketplace item"
                            />
                        </div>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <Badge variant="secondary">{item.category}</Badge>
                        <h1 className="text-3xl font-bold mt-2">{item.name}</h1>
                        <p className="text-3xl font-light text-primary flex items-center gap-2 mt-2">
                           <DollarSign className="h-7 w-7"/> {item.price?.toFixed(2)} 
                           <span className="text-lg text-muted-foreground">{item.currency} {item.perUnit && `/ ${item.perUnit}`}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4"/> {item.location}
                        </div>
                    </div>

                    <p className="text-muted-foreground whitespace-pre-line">{item.description}</p>
                    
                     {seller && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">About the Seller</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4">
                               <Avatar className="h-14 w-14">
                                    <AvatarImage src={seller.avatarUrl} alt={seller.displayName} data-ai-hint="seller profile person" />
                                    <AvatarFallback>{seller.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{seller.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{seller.primaryRole}</p>
                                    {shop && (
                                        <Link href={`/marketplace/shops/${shop.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                            <Building className="h-3 w-3" /> View Shopfront
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                     )}

                    <div className="flex flex-col sm:flex-row gap-2">
                        {isOwner ? (
                             <Button size="lg" className="w-full"><Edit className="mr-2 h-4 w-4" />Edit Listing</Button>
                        ) : (
                            <>
                                <Button size="lg" className="w-full"><ShoppingCart className="mr-2 h-4 w-4" />Add to Cart</Button>
                                <Button asChild size="lg" variant="outline" className="w-full">
                                    <Link href={`/messages?with=${item.sellerId}`}><MessageCircle className="mr-2 h-4 w-4" />Contact Seller</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
