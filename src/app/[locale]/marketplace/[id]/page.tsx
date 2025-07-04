
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, notFound, useSearchParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-utils';
import type { MarketplaceItem, UserProfile, Shop } from '@/lib/types';
import { getProfileByIdFromDB } from '@/lib/db-utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from "next/image";
import { ArrowLeft, UserCircle, ShoppingCart, DollarSign, MapPin, Building, MessageCircle, Edit, Briefcase, Star, Sparkles, Ticket, Loader2, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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

function ItemPageContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const itemId = params.id as string;
    const { user } = useAuth();
    const { toast } = useToast();
  
    const [item, setItem] = useState<MarketplaceItem | null>(null);
    const [seller, setSeller] = useState<UserProfile | null>(null);
    const [shop, setShop] = useState<Shop | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'fixed' | 'percentage' } | null>(null);
    const [isBooking, setIsBooking] = useState(false);

    const functions = getFunctions(firebaseApp);
    const getMarketplaceItemById = useMemo(() => httpsCallable(functions, 'getMarketplaceItemById'), [functions]);
    const getShopDetailsCallable = useMemo(() => httpsCallable(functions, 'getShopDetails'), [functions]);
    const validateCouponCallable = useMemo(() => httpsCallable(functions, 'validateMarketplaceCoupon'), [functions]);
    const bookAgroTourismServiceCallable = useMemo(() => httpsCallable(functions, 'bookAgroTourismService'), [functions]);
    
    useEffect(() => {
        const couponFromUrl = searchParams.get('coupon');
        if (couponFromUrl) {
            setCouponCode(couponFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!itemId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setAppliedCoupon(null);
            try {
                const itemResult = await getMarketplaceItemById({ itemId });
                const itemData = itemResult.data as MarketplaceItem | null;

                if (!itemData) throw new Error("Marketplace item not found.");
                setItem(itemData);

                const sellerProfile = await getProfileByIdFromDB(itemData.sellerId);
                setSeller(sellerProfile);
                
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
    
    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !item) return;
        setIsApplyingCoupon(true);
        setAppliedCoupon(null);
        try {
            const result = await validateCouponCallable({ couponCode, sellerId: item.sellerId });
            const data = result.data as { valid: boolean; message?: string; discountType?: 'fixed' | 'percentage'; discountValue?: number; code?: string };

            if(data.valid && data.discountType && data.discountValue && data.code){
                setAppliedCoupon({
                    code: data.code,
                    type: data.discountType,
                    discount: data.discountValue
                });
                toast({ title: "Coupon Applied!", description: `Discount of ${data.discountType === 'fixed' ? `$${data.discountValue}` : `${data.discountValue}%`} has been applied.` });
            } else {
                toast({ variant: 'destructive', title: "Invalid Coupon", description: data.message || "The coupon code could not be applied." });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || "An unexpected error occurred." });
        } finally {
            setIsApplyingCoupon(false);
        }
    };
    
    const handleBooking = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: "Authentication Required", description: "Please sign in to book this service." });
            router.push('/auth/signin');
            return;
        }
        setIsBooking(true);
        try {
            await bookAgroTourismServiceCallable({ itemId: item?.id });
            toast({ title: "Success!", description: "You have successfully booked this service. Check your profile for details." });
            // Optionally refresh item data to show updated booking count etc.
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Booking Failed", description: error.message || "An unexpected error occurred." });
        } finally {
            setIsBooking(false);
        }
    };


    const calculateDiscountedPrice = () => {
        if (!appliedCoupon || !item?.price) return item?.price;
        if (appliedCoupon.type === 'fixed') {
            return Math.max(0, item.price - appliedCoupon.discount);
        }
        if (appliedCoupon.type === 'percentage') {
            return item.price * (1 - appliedCoupon.discount / 100);
        }
        return item.price;
    };

    const discountedPrice = calculateDiscountedPrice();

    if (isLoading) return <ItemPageSkeleton />;
    if (error) return <div className="text-center py-10"><p className="text-destructive">{error}</p><Button variant="outline" asChild className="mt-4"><Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Back to Marketplace</Link></Button></div>;
    if (!item) return notFound();

    const isOwner = user?.uid === item.sellerId;
    const isAgroTourismService = item.category === 'agri-tourism-services';
    const skills: string[] = Array.isArray(item.skillsRequired) ? item.skillsRequired : (typeof item.skillsRequired === 'string' && item.skillsRequired) ? item.skillsRequired.split(',').map(s => s.trim()) : [];

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
                         <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4"/> {item.location}
                        </div>
                    </div>

                    <p className="text-muted-foreground whitespace-pre-line">{item.description}</p>
                    
                    {item.listingType === 'Service' ? (
                         <div className="space-y-4">
                            <Separator />
                             {skills.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" />Skills Required</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => <Badge key={index} variant="outline">{skill.trim()}</Badge>)}
                                    </div>
                                </div>
                             )}
                              {item.experienceLevel && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" />Experience Level</h3>
                                    <p className="text-sm text-muted-foreground">{item.experienceLevel}</p>
                                </div>
                             )}
                            <div>
                                <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-primary" />Compensation</h3>
                                <p className="text-sm text-muted-foreground">{item.compensation || 'Contact for rates'}</p>
                            </div>
                            <Separator />
                        </div>
                    ) : (
                         <div>
                            <p className="text-3xl font-light text-primary flex items-center gap-2">
                                <DollarSign className="h-7 w-7"/> 
                                {appliedCoupon && item.price && <span className="text-muted-foreground line-through text-2xl">${item.price.toFixed(2)}</span>}
                                {discountedPrice?.toFixed(2)}
                                <span className="text-lg text-muted-foreground">{item.currency} {item.perUnit && `/ ${item.perUnit}`}</span>
                            </p>
                            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                <Label htmlFor="coupon-code" className="text-sm font-medium flex items-center gap-1.5"><Ticket className="h-4 w-4" />Have a coupon code?</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input id="coupon-code" placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={isApplyingCoupon || !!appliedCoupon} />
                                    <Button onClick={handleApplyCoupon} disabled={!couponCode || isApplyingCoupon || !!appliedCoupon}>
                                        {isApplyingCoupon && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Apply
                                    </Button>
                                </div>
                                {appliedCoupon && <p className="text-xs text-green-600 mt-1">Successfully applied coupon: {appliedCoupon.code}</p>}
                            </div>
                         </div>
                    )}
                     
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
                             <>
                                <Button size="lg" className="w-full"><Edit className="mr-2 h-4 w-4" />Edit Listing</Button>
                                {isAgroTourismService && (
                                    <Button asChild size="lg" variant="secondary" className="w-full">
                                        <Link href={`/marketplace/${item.id}/manage-service`}><Settings className="mr-2 h-4 w-4" />Manage Service</Link>
                                    </Button>
                                )}
                            </>
                        ) : isAgroTourismService ? (
                            <Button size="lg" className="w-full" onClick={handleBooking} disabled={isBooking}>
                                {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CalendarIcon className="mr-2 h-4 w-4" />}
                                {isBooking ? 'Booking...' : 'Book Now'}
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" className="w-full" onClick={() => toast({title: "Coming Soon!", description: "The shopping cart and checkout process will be implemented in a future update."})}><ShoppingCart className="mr-2 h-4 w-4" />Add to Cart</Button>
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

export default function MarketplaceItemPageWrapper() {
  return (
    <Suspense fallback={<ItemPageSkeleton />}>
      <ItemPageContent />
    </Suspense>
  );
}
