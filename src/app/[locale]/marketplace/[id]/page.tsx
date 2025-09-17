
"use client";
import { useState, useEffect, Suspense } from 'react';
import { useParams, notFound, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-utils';
import type { MarketplaceItem, UserProfile, Shop } from '@/lib/types';
import { getProfileByIdFromDB } from '@/lib/server-actions';
import QRCode from 'qrcode.react';
import { differenceInCalendarDays } from 'date-fns';
import type { DateRange } from "react-day-picker";
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/navigation';
import { apiCall } from '@/lib/api-utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from "next/image";
import { ArrowLeft, UserCircle, ShoppingCart, DollarSign, MapPin, Building, MessageSquare, Edit, Briefcase, Star, Sparkles, Ticket, Loader2, Settings, Calendar as CalendarIcon, QrCode, CheckCircle, XCircle, GitBranch } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea'; // Corrected import
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    const t = useTranslations('Marketplace.itemView');
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
    const [isBooked, setIsBooked] = useState(false);
    
    const [date, setDate] = useState<DateRange | undefined>();
    const [guests, setGuests] = useState(1);
    
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [orderNotes, setOrderNotes] = useState("");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    
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
                // Get item details
                const itemResponse = await apiCall(`/marketplace/listings/${itemId}`);
                const itemData = itemResponse as MarketplaceItem;

                if (!itemData) throw new Error(t('notFound.description'));
                setItem(itemData);

                // Get seller profile
                const sellerProfile = await getProfileByIdFromDB(itemData.sellerId);
                setSeller(sellerProfile);
                
                // Get shop details if seller has a shop
                if(sellerProfile && Array.isArray(sellerProfile.shops) && sellerProfile.shops.length > 0) {
                     const shopResponse = await apiCall(`/marketplace/shops/${sellerProfile.shops[0]}`);
                     setShop(shopResponse as Shop);
                }

            } catch (err: any) {
                console.error("Error fetching item details:", err);
                setError(err.message || t('errors.loadItem.description'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [itemId, t]);
    
    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !item) return;
        setIsApplyingCoupon(true);
        setAppliedCoupon(null);
        try {
            const result = await apiCall('/coupons/validate', {
                method: 'POST',
                body: JSON.stringify({ couponCode, sellerId: item.sellerId }),
            });
            
            const data = result as { valid: boolean; message?: string; discountType?: 'fixed' | 'percentage'; discountValue?: number; code?: string };

            if(data.valid && data.discountType && data.discountValue && data.code){
                setAppliedCoupon({
                    code: data.code,
                    type: data.discountType,
                    discount: data.discountValue
                });
                toast({ title: t('coupon.successTitle'), description: t('coupon.successDescription', { type: data.discountType === 'fixed' ? `$${data.discountValue}` : `${data.discountValue}%` }) });
            } else {
                toast({ variant: 'destructive', title: t('coupon.failTitle'), description: data.message || t('coupon.failDescription') });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('errors.unexpected'), description: error.message || '' });
        } finally {
            setIsApplyingCoupon(false);
        }
    };
    
    const handleBooking = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: t('booking.authTitle'), description: t('booking.authDescription') });
            router.push('/auth/signin');
            return;
        }
        if (!date?.from) {
            toast({ variant: 'destructive', title: t('booking.failTitle'), description: t('booking.dateError') });
            return;
        }
        setIsBooking(true);
        try {
            const bookingDetails = {
                startDate: date.from.toISOString(),
                endDate: date.to?.toISOString() ?? date.from.toISOString(),
                guests: guests,
                totalPrice: totalBookingPrice,
                currency: item?.currency
            };
            await apiCall('/agro-tourism/bookings', {
                method: 'POST',
                body: JSON.stringify({ serviceId: item?.id, bookingDetails }),
            });
            toast({ title: t('booking.successTitle'), description: t('booking.successDescription') });
            setIsBooked(true);
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('booking.failTitle'), description: error.message || t('errors.unexpected') });
        } finally {
            setIsBooking(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!user) {
             toast({ variant: 'destructive', title: t('order.authTitle'), description: t('order.authDescription') });
             router.push('/auth/signin');
             return;
        }
        if (orderQuantity <= 0) {
            toast({ variant: 'destructive', title: t('order.quantityErrorTitle'), description: t('order.quantityErrorDescription') });
            return;
        }
        setIsPlacingOrder(true);
        try {
            await apiCall('/marketplace/orders', {
                method: 'POST',
                body: JSON.stringify({
                    listingId: item?.id,
                    quantity: orderQuantity,
                    buyerNotes: orderNotes
                }),
            });
            toast({ title: t('order.successTitle'), description: t('order.successDescription') });
            setIsOrderDialogOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('order.failTitle'), description: error.message || t('order.failDescription') });
        } finally {
            setIsPlacingOrder(false);
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

    const numberOfNights = date?.from && date?.to ? differenceInCalendarDays(date.to, date.from) : 0;
    const baseBookingPrice = (item?.price || 0) * numberOfNights;
    const serviceFee = baseBookingPrice * 0.1;
    const totalBookingPrice = baseBookingPrice + serviceFee;

    if (isLoading) return <ItemPageSkeleton />;
    if (error) return <div className="text-center py-10"><p className="text-destructive">{error}</p><Button variant="outline" asChild className="mt-4"><Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />{t('backLink')}</Link></Button></div>;
    if (!item) return notFound();

    const isOwner = user?.id === item.sellerId;
    const isAgroTourismService = item.category === 'agri-tourism-services';
    const isProduct = item.listingType === 'Product';
    const skills: string[] = Array.isArray(item.skillsRequired) ? item.skillsRequired : (typeof item.skillsRequired === 'string' && item.skillsRequired) ? item.skillsRequired.split(',').map(s => s.trim()) : [];
    const serviceQrCodeValue = `damdoh:checkin?itemId=${item.id}&userId=${user?.id}`;

    return (
      <>
        <div className="max-w-4xl mx-auto space-y-6">
             <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
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
                         {item.relatedTraceabilityId && (
                             <CardFooter className="p-3 bg-blue-50 dark:bg-blue-900/30">
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href={`/traceability/batches/${item.relatedTraceabilityId}`}>
                                        <GitBranch className="mr-2 h-4 w-4"/>
                                        {t('traceabilityButton')}
                                    </Link>
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <Badge variant="secondary">{item.category}</Badge>
                        <h1 className="text-3xl font-bold mt-2">{item.name}</h1>
                         <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4"/> {item.location?.address}
                        </div>
                    </div>

                    <p className="text-muted-foreground whitespace-pre-line">{item.description}</p>
                    
                    {item.listingType === 'Service' && !isAgroTourismService ? (
                         <div className="space-y-4">
                            <Separator />
                             {skills.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" />{t('skillsLabel')}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => <Badge key={index} variant="outline">{skill.trim()}</Badge>)}
                                    </div>
                                </div>
                             )}
                              {item.experienceLevel && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" />{t('experienceLabel')}</h3>
                                    <p className="text-sm text-muted-foreground">{item.experienceLevel}</p>
                                </div>
                             )}
                            <div>
                                <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-primary" />{t('compensationLabel')}</h3>
                                <p className="text-sm text-muted-foreground">{item.compensation || t('contactForRates')}</p>
                            </div>
                            <Separator />
                        </div>
                    ) : isAgroTourismService ? (
                        <Card className="shadow-lg">
                            {isBooked ? (
                                <CardContent className="pt-6 text-center">
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                                    <p className="font-semibold">{t('booking.bookedTitle')}</p>
                                    <p className="text-sm text-muted-foreground mb-4">{t('booking.bookedDescription')}</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full" variant="secondary"><QrCode className="mr-2 h-4 w-4" />{t('booking.ticketButton')}</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-xs">
                                            <DialogHeader>
                                                <DialogTitle className="text-center">{t('booking.modalTitle')}</DialogTitle>
                                                <DialogDescription className="text-center">{t('booking.modalDescription', { itemName: item.name })}</DialogDescription>
                                            </DialogHeader>
                                            <div className="p-4 flex flex-col items-center justify-center gap-4">
                                                <div className="p-4 bg-white rounded-lg border">
                                                    <QRCode value={serviceQrCodeValue} size={200} />
                                                </div>
                                                <p className="text-sm text-center text-muted-foreground">{t('booking.modalScan')}</p>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            ) : (
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold">${item.price?.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">/ {t('booking.perNight')}</p>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="grid grid-cols-2 border rounded-lg cursor-pointer">
                                                <div className="p-2 border-r">
                                                    <Label className="text-xs font-semibold">{t('booking.checkIn')}</Label>
                                                    <p>{date?.from ? format(date.from, "LLL dd, y") : t('booking.addDate')}</p>
                                                </div>
                                                <div className="p-2">
                                                    <Label className="text-xs font-semibold">{t('booking.checkOut')}</Label>
                                                    <p>{date?.to ? format(date.to, "LLL dd, y") : t('booking.addDate')}</p>
                                                </div>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={date?.from}
                                                selected={date}
                                                onSelect={setDate}
                                                numberOfMonths={1}
                                                disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <div>
                                        <Label htmlFor="guests" className="text-xs font-semibold">{t('booking.guests')}</Label>
                                        <Input id="guests" type="number" min="1" value={guests} onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)} />
                                    </div>
                                    <Button size="lg" className="w-full" onClick={handleBooking} disabled={isBooking || !date?.from}>
                                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CalendarIcon className="mr-2 h-4 w-4" />}
                                        {isBooking ? t('booking.reservingButton') : t('booking.reserveButton')}
                                    </Button>
                                    {numberOfNights > 0 && (
                                        <div className="text-sm space-y-1">
                                            <p className="text-center text-muted-foreground">{t('booking.notCharged')}</p>
                                            <div className="flex justify-between"><span>${item.price?.toFixed(2)} x {numberOfNights} {t('booking.nights', { count: numberOfNights })}</span><span>${baseBookingPrice.toFixed(2)}</span></div>
                                            <div className="flex justify-between"><span>{t('booking.serviceFee')}</span><span>${serviceFee.toFixed(2)}</span></div>
                                            <Separator className="my-1"/>
                                            <div className="flex justify-between font-bold"><span>{t('booking.total')}</span><span>${totalBookingPrice.toFixed(2)}</span></div>
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ) : (
                         <div>
                            <p className="text-3xl font-light text-primary flex items-center gap-2">
                                <DollarSign className="h-7 w-7"/> 
                                {appliedCoupon && item.price && <span className="text-muted-foreground line-through text-2xl">${item.price.toFixed(2)}</span>}
                                {discountedPrice?.toFixed(2)}
                                <span className="text-lg text-muted-foreground">{item.currency} {item.perUnit && `/ ${item.perUnit}`}</span>
                            </p>
                            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                <Label htmlFor="coupon-code" className="text-sm font-medium flex items-center gap-1.5"><Ticket className="h-4 w-4" />{t('coupon.label')}</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input id="coupon-code" placeholder={t('coupon.placeholder')} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={isApplyingCoupon || !!appliedCoupon} />
                                    <Button onClick={handleApplyCoupon} disabled={!couponCode || isApplyingCoupon || !!appliedCoupon}>
                                        {isApplyingCoupon && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('coupon.applyButton')}
                                    </Button>
                                </div>
                                {appliedCoupon && <p className="text-xs text-green-600 mt-1">{t('coupon.appliedText', { code: appliedCoupon.code })}</p>}
                            </div>
                         </div>
                    )}
                     
                     {seller && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('aboutSeller')}</CardTitle>
                            </CardHeader> 
                            <CardContent className="flex items-center gap-4">
                               <Avatar className="h-14 w-14">
                                    <AvatarImage src={seller.avatarUrl || ''} alt={seller.displayName} data-ai-hint="seller profile person" />
                                    <AvatarFallback>{seller.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{seller.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{seller.primaryRole}</p>
                                    {shop && (
                                        <Link href={`/marketplace/shops/${shop.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                            <Building className="h-3 w-3" /> {t('viewShopfront')}
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                     )}

                    <div className="flex flex-col sm:flex-row gap-2">
                         {isOwner ? (
                             <>
                                <Button size="lg" className="w-full"><Link href={`/marketplace/${item.id}/edit`}><Edit className="mr-2 h-4 w-4" />{t('editListing')}</Link></Button>
                                {isAgroTourismService && (
                                    <Button asChild size="lg" variant="secondary" className="w-full">
                                        <Link href={`/marketplace/${item.id}/manage-service`}><Settings className="mr-2 h-4 w-4" />{t('manageService')}</Link>
                                    </Button>
                                )}
                            </>
                        ) : isAgroTourismService ? null 
                        : isProduct ? (
                            <Button size="lg" className="w-full" onClick={() => setIsOrderDialogOpen(true)}>
                                <ShoppingCart className="mr-2 h-4 w-4" />{t('buyNowButton')}
                            </Button>
                        ) : (
                             <Button asChild size="lg" className="w-full">
                                <Link href={`/messages?with=${item.sellerId}`}><MessageSquare className="mr-2 h-4 w-4" />{t('contactForService')}</Link>
                            </Button>
                        )}
                        {!isOwner && !isProduct && !isAgroTourismService && (
                            <Button asChild size="lg" variant="outline" className="w-full">
                                <Link href={`/messages?with=${item.sellerId}`}><MessageSquare className="mr-2 h-4 w-4" />{t('contactSeller')}</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('order.title', { itemName: item.name })}</DialogTitle>
                    <DialogDescription>{t('order.description')}</DialogDescription> 
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">{t('order.quantityLabel')}</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={orderQuantity}
                            onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                            min="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">{t('order.notesLabel')}</Label>
                        <Textarea
                            id="notes" 
                            placeholder={t('order.notesPlaceholder')}
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>{t('order.cancelButton')}</Button>
                    <Button onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                        {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isPlacingOrder ? t('order.placingButton') : t('order.confirmButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </>
    )
}

export default function MarketplaceItemPageWrapper() {
  return (
    <Suspense fallback={<ItemPageSkeleton />}>
      <ItemPageContent />
    </Suspense>
  );
}
