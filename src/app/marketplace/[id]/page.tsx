
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem, UserProfile } from "@/lib/types";
import Image from "next/image";
import { MapPin, PackageIcon, Briefcase, CheckCircle, Sparkles, Tag, ShieldCheck, FileText, Link as LinkIcon, Wrench, CalendarDays, CircleDollarSign, ShoppingBag, ArrowLeft, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { getMarketplaceItemByIdFromDB, getProfileByIdFromDB } from "@/lib/db-utils"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { FINANCIAL_SERVICE_TYPES, INSURANCE_SERVICE_TYPES } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


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
  
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // After fetching the item, fetch the seller's profile
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

  if (isLoading) {
    return <ItemDetailSkeleton />;
  }

  if (error) {
    return <div className="text-center text-destructive">{error}</div>;
  }

  // Use notFound() hook from Next.js if the item is not found after loading
  if (!item) {
    notFound();
  }

  let callToActionText = "View Details";
  let callToActionVariant: "default" | "outline" | "destructive" = "default";
  let CallToActionIcon = LinkIcon;
  let showContactSellerButton = true;
  
  // For 'Product': Standard purchase flow initiation
  if (item.listingType === 'Product') {
    callToActionText = "Inquire or Place Order";
    CallToActionIcon = ShoppingBag;
    callToActionVariant = "default";
  }
  // For 'Service': Action depends on the specific service type
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
          <CardTitle className="text-3xl font-bold">{item.name}</CardTitle>
          <CardDescription className="text-lg text-primary flex items-center">
             <Badge variant="outline" className="text-sm w-fit py-1 px-2 flex items-center capitalize mr-2">
              {getCategoryIcon(item.category as any)} {getCategoryName(item.category as CategoryNode['id'])}
            </Badge>
            {item.listingType === 'Product' ? (
               <>
                {item.price ? `$${item.price.toFixed(2)}` : 'Price Inquire'}
                {item.perUnit && <span className="text-base text-muted-foreground font-normal ml-1.5">{item.perUnit}</span>}
               </>
            ) : (
              item.compensation && <span className="text-base font-medium">{item.compensation}</span>
            )}
          </CardDescription>
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
                         <h4 className="text-md font-semibold flex items-center gap-1.5"><Tag className="h-4 w-4 text-muted-foreground"/>Traceability</h4>
                         <p className="text-sm text-muted-foreground">This product is linked to a traceable batch.</p>
                         <Button variant="outline" size="sm">View Traceability History (Coming Soon)</Button>
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
            <h3 className="text-lg font-semibold flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-muted-foreground"/>Contact & Next Steps</h3>
            <p className="text-muted-foreground text-sm">{item.contactInfo}</p>
              <Button className="w-full md:w-auto mt-4" variant={callToActionVariant}>
                 <CallToActionIcon className="mr-2 h-4 w-4"/>
                 {callToActionText}
              </Button>

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
                      <AvatarImage src={seller.avatarUrl} alt={seller.name} data-ai-hint="profile agriculture person" />
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
