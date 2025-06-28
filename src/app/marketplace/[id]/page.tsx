
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem, UserProfile } from "@/lib/types";
import Image from "next/image";
import { MapPin, PackageIcon, Briefcase, CheckCircle, Sparkles, ShieldCheck, FileText, Link as LinkIcon, Wrench, CalendarDays, CircleDollarSign, ShoppingBag, ArrowLeft, MessageCircle, Ticket, Loader2, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { getMarketplaceItemByIdFromDB, getProfileByIdFromDB } from "@/lib/db-utils"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { FINANCIAL_SERVICE_TYPES, INSURANCE_SERVICE_TYPES } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-utils";
import { Share2, ClipboardCopy } from "lucide-react";


// Function to get the category icon (can be reused from marketplace page)
const getCategoryIcon = (category: CategoryNode['id']) => {
  const catNode = AGRICULTURAL_CATEGORIES.find(c => c.id === category);
  const IconComponent = catNode?.icon || Sparkles; // Fallback icon
  return <IconComponent className="h-3 w-3 mr-1 inline-block" />;
}

// Function to get the category name (can be reused from marketplace page)
const getCategoryName = (categoryId: CategoryNode['id']) => {
  return AGRICULTURAL_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
}

function ItemDetailSkeleton() {
  return (
    <div className="space-y-6">
       <Skeleton className="h-8 w-48" />
       <Card className="max-w-4xl mx-auto">
        <Skeleton className="w-full aspect-video rounded-t-lg" />
         <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
         </CardHeader>
         <CardContent className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
         </CardContent>
         <CardFooter>
            <Skeleton className="h-10 w-full" />
         </CardFooter>
       </Card>
    </div>
  );
}


export default function MarketplaceItemDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ type: 'fixed' | 'percentage'; value: number } | null>(null);

  const functions = getFunctions(firebaseApp);
  const validateCouponCallable = useMemo(() => httpsCallable(functions, 'validateMarketplaceCoupon'), [functions]);
  const createOrderCallable = useMemo(() => httpsCallable(functions, 'createMarketplaceOrder'), [functions]);

  useEffect(() => {
    if (!id) {
      setError("Invalid listing ID.");
      setIsLoading(false);
      return;
    }
  
    const fetchItemData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedItem = await getMarketplaceItemByIdFromDB(id);
        if (fetchedItem) {
          setItem(fetchedItem);
          if (fetchedItem.sellerId) {
            const fetchedSeller = await getProfileByIdFromDB(fetchedItem.sellerId);
            setSeller(fetchedSeller);
          }
        } else {
            setItem(null);
        }
      } catch (err) {
        console.error(`Error fetching marketplace item with ID ${id}:`, err);
        setError("Failed to load listing.");
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemData();
  }, [id]);
  
  const handleOrder = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to place an order." });
        router.push("/auth/signin");
        return;
    }
    if (!item) return;

    setIsOrdering(true);
    try {
        const finalPrice = calculateDiscountedPrice();
        const result = await createOrderCallable({
            listingId: item.id,
            quantity: quantity,
            finalPrice: finalPrice,
        });

        toast({
            title: "Order Placed Successfully!",
            description: "Your order has been sent to the seller.",
        });
        setIsDialogOpen(false);
        // Maybe redirect to an "My Orders" page in the future
        // router.push(`/orders/${(result.data as any).orderId}`);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Order Failed", description: error.message || "Could not place your order." });
    } finally {
        setIsOrdering(false);
    }
  };


  const handleCouponApply = async () => {
    if (!couponCode.trim() || !item?.sellerId) return;
    setIsValidatingCoupon(true);
    setAppliedDiscount(null);
    try {
        const result = await validateCouponCallable({ couponCode, sellerId: item.sellerId });
        const data = result.data as any;
        if (data.valid) {
            setAppliedDiscount({ type: data.discountType, value: data.discountValue });
            toast({ title: "Coupon Applied!", description: `Discount of ${data.discountValue}${data.discountType === 'percentage' ? '%' : ` ${item.currency}`} applied successfully.` });
        } else {
            toast({ variant: "destructive", title: "Invalid Coupon", description: data.message });
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not validate coupon." });
    } finally {
        setIsValidatingCoupon(false);
    }
  };
  
  const calculateDiscountedPrice = () => {
    if (!item?.price) return 0;
    let singleItemPrice = item.price;

    if (appliedDiscount) {
       if (appliedDiscount.type === 'fixed') {
            singleItemPrice = Math.max(0, item.price - appliedDiscount.value);
        }
        if (appliedDiscount.type === 'percentage') {
            singleItemPrice = item.price * (1 - appliedDiscount.value / 100);
        }
    }
    return singleItemPrice * quantity;
  };
  
  const handleShareItem = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "A shareable link to this listing has been copied to your clipboard." });
  };


  if (isLoading) {
    return <ItemDetailSkeleton />;
  }

  if (error) {
    return <div className="text-center text-destructive">{error}</div>;
  }

  if (!item) {
    notFound();
  }
  
  let callToActionText = "View Details";
  let callToActionVariant: "default" | "outline" | "destructive" = "default";
  let CallToActionIcon = LinkIcon;
  let showContactSellerButton = true;
  
  if (item.listingType === 'Product') {
    callToActionText = "Buy Now";
    CallToActionIcon = ShoppingBag;
    callToActionVariant = "default";
  }
  else if (item.listingType === 'Service' && item.serviceType) {
     if (FINANCIAL_SERVICE_TYPES.includes(item.serviceType as any) || INSURANCE_SERVICE_TYPES.includes(item.serviceType as any)) {
       callToActionText = "Initiate Application";
       CallToActionIcon = CircleDollarSign;
       callToActionVariant = "default";
       showContactSellerButton = false; 
     } else {
       callToActionText = item.availabilityStatus === 'Available' ? "Request Quote or Book" : "Inquire Availability";
       CallToActionIcon = Briefcase;
       callToActionVariant = "default";
     }
  }

  const finalPrice = calculateDiscountedPrice();

  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4"/> Back to Marketplace
      </Link>

      <Card className="max-w-4xl mx-auto overflow-hidden">
        <div className="relative w-full aspect-video">
          <Image
            src={item.imageUrl || "https://placehold.co/800x450.png"}
            alt={item.name}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
            style={{ objectFit: "cover" }}
             data-ai-hint={item.dataAiHint || `${item.listingType.toLowerCase()} agricultural`}
          />
           <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
               <Badge variant="secondary" className="py-1 px-2 text-sm flex items-center capitalize shadow-sm">
                {item.listingType === 'Product' ? <PackageIcon className="h-4 w-4 mr-1" /> : <Briefcase className="h-4 w-4 mr-1" />}
                 {item.listingType}
               </Badge>
               {item.isSustainable && item.listingType === 'Product' && (
                 <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 text-sm shadow-sm">
                   <CheckCircle className="h-4 w-4 mr-1" />Sustainable
                 </Badge>
               )}
            </div>
        </div>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                    <CardTitle className="text-3xl font-bold">{item.name}</CardTitle>
                    <CardDescription className="text-lg text-primary flex items-center mt-1">
                        <Badge variant="outline" className="text-sm w-fit py-1 px-2 flex items-center capitalize mr-2">
                        {getCategoryIcon(item.category as any)} {getCategoryName(item.category as CategoryNode['id'])}
                        </Badge>
                        {item.listingType === 'Product' ? (
                            <div>
                            {item.price ? `$${item.price.toFixed(2)}` : 'Price Inquire'}
                            {item.perUnit && <span className="text-base text-muted-foreground font-normal ml-1.5">{item.perUnit}</span>}
                            </div>
                        ) : (
                        item.compensation && <span className="text-base font-medium">{item.compensation}</span>
                        )}
                    </CardDescription>
                </div>
                <div className="mt-2 sm:mt-0">
                    <Button variant="outline" size="sm" onClick={handleShareItem}>
                        <Share2 className="mr-2 h-4 w-4"/>Share
                    </Button>
                </div>
            </div>
           {item.aiPriceSuggestion && item.listingType === 'Product' && (
             <div className="text-sm text-blue-600 flex items-center mt-2">
               <Sparkles className="h-4 w-4 mr-1" />
               AI Price Est: ${item.aiPriceSuggestion.min} - ${item.aiPriceSuggestion.max} ({item.aiPriceSuggestion.confidence})
             </div>
           )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-2 shrink-0" />
              <span>{item.location}</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
          
           {item.listingType === 'Product' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <h4 className="text-md font-semibold flex items-center gap-1.5"><PackageIcon className="h-4 w-4 text-muted-foreground"/>Product Details</h4>
                    <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                       {item.stockQuantity && <li>Quantity Available: {item.stockQuantity} {item.perUnit || ''}</li>}
                       {item.price && <li>Price: ${item.price.toFixed(2)} {item.currency} {item.perUnit}</li>}
                       {item.isSustainable && <li>Sustainable Product: Yes</li>}
                       {Array.isArray(item.certifications) && item.certifications.length > 0 && (
                           <li>Certifications: {item.certifications.join(', ')}</li>
                       )}
                    </ul>
                 </div>
                  {item.relatedTraceabilityId && (
                      <div className="space-y-2">
                         <h4 className="text-md font-semibold flex items-center gap-1.5"><GitBranch className="h-4 w-4 text-muted-foreground"/>Traceability</h4>
                         <p className="text-sm text-muted-foreground">This product is linked to a traceable batch. View its full journey from farm to market.</p>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/traceability/batches/${item.relatedTraceabilityId}`}>
                                <GitBranch className="mr-2 h-4 w-4" /> View Report
                            </Link>
                          </Button>
                      </div>
                  )}
             </div>
           )}

           {item.listingType === 'Service' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-md font-semibold flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-muted-foreground"/>Service Details</h4>
                   <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                      {item.serviceType && <li>Service Type: <span className="capitalize">{item.serviceType.replace(/_/g, ' ')}</span></li>}
                       {item.priceDisplay && <li>Pricing: {item.priceDisplay}</li>}
                      {item.compensation && <li>Compensation/Rate: {item.compensation}</li>}
                      {item.availabilityStatus && <li>Availability: {item.availabilityStatus}</li>}
                       {item.serviceArea && <li>Service Area: {item.serviceArea}</li>}
                       {item.experienceLevel && <li>Experience Level: {item.experienceLevel}</li>}
                   </ul>
                </div>
                 {item.skillsRequired && item.skillsRequired.length > 0 && (
                      <div className="space-y-2">
                          <h4 className="text-md font-semibold flex items-center gap-1.5"><Wrench className="h-4 w-4 text-muted-foreground"/>Skills / Keywords</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.skillsRequired.map(skill => <Badge key={skill} variant="secondary" className="text-sm py-0.5 px-2">{skill}</Badge>)}
                          </div>
                      </div>
                    )}
                 {(item.relatedServiceDetailId || item.relatedFinancialProductId) && (
                     <div className="space-y-2">
                         <h4 className="text-md font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4 text-muted-foreground"/>Additional Information</h4>
                         <Button variant="outline" size="sm">View Service Details (Coming Soon)</Button>
                     </div>
                 )}
             </div>
           )}

          <Separator />
          
          <div className="space-y-2" id="inquire-order">
            <h3 className="text-lg font-semibold flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-muted-foreground"/>Contact &amp; Next Steps</h3>
            <p className="text-muted-foreground text-sm">{item.contactInfo}</p>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full md:w-auto mt-4" variant={callToActionVariant}>
                        <CallToActionIcon className="mr-2 h-4 w-4"/>
                        {callToActionText}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Your Order</DialogTitle>
                        <DialogDescription>Review your order details before confirming.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4">
                            <Image src={item.imageUrl || "https://placehold.co/80x80.png"} alt={item.name} width={80} height={80} className="rounded-md border" />
                            <div>
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">Seller: {seller?.name}</p>
                                <p className="text-sm font-bold text-primary">${item.price?.toFixed(2)} {item.perUnit}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="coupon-code-modal">Coupon Code</Label>
                                <Input id="coupon-code-modal" placeholder="Optional" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleCouponApply} disabled={isValidatingCoupon}>
                                    {isValidatingCoupon && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                    Apply Coupon
                                </Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${(item.price! * quantity).toFixed(2)}</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `$${appliedDiscount.value.toFixed(2)}`})</span>
                                    <span>-${(item.price! * quantity - finalPrice).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${finalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleOrder} disabled={isOrdering}>
                            {isOrdering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Purchase
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

              {showContactSellerButton && (
                 <Button variant="outline" className="w-full md:w-auto md:ml-2 mt-2 md:mt-4" asChild>
                   <Link href={`/messages?with=${item.sellerId}`}>
                     <MessageCircle className="mr-2 h-4 w-4" /> Contact Seller
                   </Link>
                 </Button>
              )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
            <div className="flex items-center gap-3">
                {seller ? (
                  <>
                    <Avatar>
                      <AvatarImage src={seller.photoURL} alt={seller.name} data-ai-hint="profile agriculture person" />
                      <AvatarFallback>{seller.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm text-muted-foreground">Seller</p>
                        <Link href={`/profiles/${seller.id}`} className="font-semibold text-foreground hover:underline">{seller.name}</Link>
                    </div>
                  </>
                ) : (
                    <>
                     <Skeleton className="h-10 w-10 rounded-full" />
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                     </div>
                    </>
                )}
            </div>
            {seller && (
                <Button variant="secondary" size="sm" asChild>
                    <Link href={`/profiles/${seller.id}`}>View Profile</Link>
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
