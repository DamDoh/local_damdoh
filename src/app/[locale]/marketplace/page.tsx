
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import type { MarketplaceItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search as SearchIconLucide, MapPin, Pin, PinOff, Building, ShoppingCart, Brain, Loader2 } from "lucide-react"; 
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { getListingTypeFilterOptions, type ListingType, UNIFIED_MARKETPLACE_CATEGORY_IDS } from "@/lib/constants";
import { usePathname, useRouter } from "@/navigation";
import { useSearchParams } from 'next/navigation';
import { useHomepagePreference } from '@/hooks/useHomepagePreference';
import { AllCategoriesDropdown } from "@/components/marketplace/AllCategoriesDropdown"; 
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { performSearch, getMarketplaceRecommendationsAction } from "@/lib/server-actions";
import { ItemCard } from "@/components/marketplace/ItemCard";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-utils";

interface RecommendedItem {
  item: MarketplaceItem;
  reason: string;
}

function MarketplaceContent() {
  const t = useTranslations('Marketplace');
  const tConstants = useTranslations('constants');
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | 'All'>('All');
  const [locationFilter, setLocationFilter] = useState("");
  
  const [displayedItems, setDisplayedItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [aiRecommendations, setAiRecommendations] = useState<RecommendedItem[]>([]);
  const [isLoadingAiRecommendations, setIsLoadingAiRecommendations] = useState(true);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
  const { toast } = useToast(); 

  const listingTypeFilterOptions = getListingTypeFilterOptions(tConstants);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const filters = [];
    if (currentCategory) {
      filters.push({ type: 'category', value: currentCategory });
    }
    if (listingTypeFilter !== 'All') {
      filters.push({ type: 'listingType', value: listingTypeFilter });
    }

    const searchPayload = {
      mainKeywords: searchTerm.split(' ').filter(Boolean),
      identifiedLocation: locationFilter,
      suggestedFilters: filters,
    };

    try {
      const results = await performSearch(searchPayload);
      const mappedItems = results.map((res: any): MarketplaceItem => ({
          id: res.itemId,
          name: res.title,
          description: res.description,
          imageUrl: res.imageUrl,
          location: res.location,
          listingType: res.listingType,
          price: res.price,
          currency: res.currency,
          perUnit: res.perUnit,
          category: res.tags?.find((tag: string) => UNIFIED_MARKETPLACE_CATEGORY_IDS.includes(tag)) || res.tags?.[0] || '',
          sellerId: 'unknown',
          createdAt: (res.createdAt as any)?.toDate ? (res.createdAt as any).toDate().toISOString() : new Date().toISOString(),
          updatedAt: (res.updatedAt as any)?.toDate ? (res.updatedAt as any).toDate().toISOString() : new Date().toISOString(),
      }));
      setDisplayedItems(mappedItems);
    } catch (error) {
      console.error("Failed to perform search:", error);
      toast({
        variant: "destructive",
        title: t('errors.search.title'),
        description: t('errors.search.description'),
      });
      setDisplayedItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentCategory, listingTypeFilter, locationFilter, toast, t]);

  const fetchAiRecs = useCallback(async () => {
    if (!user) {
        setIsLoadingAiRecommendations(false);
        return;
    };
    setIsLoadingAiRecommendations(true);
    try {
        const result = await getMarketplaceRecommendationsAction(user.uid);
        setAiRecommendations(result || []);
    } catch (error) {
          console.error("Failed to fetch AI recommendations:", error);
          // Non-blocking error, so don't show a toast unless debugging
    } finally {
        setIsLoadingAiRecommendations(false);
    }
  }, [user]);

  useEffect(() => {
      if(isMounted) {
        fetchItems();
        fetchAiRecs();
      }
  }, [isMounted, fetchItems, fetchAiRecs]);

  const isCurrentHomepage = homepagePreference === pathname;

  const handleSetHomepage = useCallback(() => {
    if (isCurrentHomepage) {
      clearHomepagePreference();
      toast({ title: t('pinning.unpinnedTitle'), description: t('pinning.unpinnedDescription') });
    } else {
      setHomepagePreference(pathname);
      toast({ title: t('pinning.pinnedTitle'), description: t('pinning.pinnedDescription') });
    }
  }, [isCurrentHomepage, clearHomepagePreference, setHomepagePreference, pathname, toast, t]);
  
  if (!isMounted) return <MarketplaceSkeleton />;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button asChild variant="secondary">
                  <Link href="/marketplace/create-shop"><Building className="mr-2 h-4 w-4" />{t('createShopButton')}</Link>
              </Button>
               {user && (
                <Button asChild variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/marketplace/my-orders"><ShoppingCart className="mr-2 h-4 w-4" />{t('myOrdersButton')}</Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/marketplace/create">
                  <PlusCircle className="mr-2 h-4 w-4" />{t('createListingButton')}
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSetHomepage}>
                {isCurrentHomepage ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                {isCurrentHomepage ? t('unpinButton') : t('pinButton')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center md:items-end">
            <AllCategoriesDropdown />
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end w-full md:w-auto">
              <div className="relative sm:col-span-2 md:col-span-1">
                <Label htmlFor="search-marketplace" className="sr-only">{t('searchPlaceholder')}</Label>
                <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search-marketplace" placeholder={t('searchPlaceholder')} className="pl-10 h-10" 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Label htmlFor="location-filter-marketplace" className="sr-only">{t('locationPlaceholder')}</Label>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="location-filter-marketplace" placeholder={t('locationPlaceholder')} className="pl-10 h-10"
                  value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <Select value={listingTypeFilter} onValueChange={(value) => setListingTypeFilter(value as ListingType | 'All')}>
                <SelectTrigger id="listing-type-filter-marketplace" className="h-10">
                  <SelectValue placeholder={t('typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {listingTypeFilterOptions.map(typeOpt => (
                    <SelectItem key={typeOpt.value} value={typeOpt.value}>{typeOpt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
           {user && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><Brain className="text-primary h-5 w-5" /> {t('recommendedForYou')}</h2>
              {isLoadingAiRecommendations ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {Array.from({ length: 5 }).map((_, i) => <ItemCardSkeleton key={`skel-rec-${i}`} />)}
                 </div>
              ) : aiRecommendations.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {aiRecommendations.map(({ item, reason }) => <ItemCard key={`rec-${item.id}`} item={item} reason={reason} />)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('errors.aiRecommendations.title')}</p>
              )}
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4 mt-6">{t('discoverMore')}</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => <ItemCardSkeleton key={`skel-item-${i}`} />)}
            </div>
          ) : displayedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="text-center py-16 col-span-full border-2 border-dashed rounded-lg">
              <p className="text-lg text-muted-foreground">{t('noItemsFound.title')}</p>
              <p className="text-sm text-muted-foreground">{t('noItemsFound.hint')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ItemCardSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader className="p-0">
                <Skeleton className="w-full aspect-[4/3] rounded-t-lg"/>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
            </CardContent>
            <CardFooter className="p-2">
                    <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    );
}


function MarketplaceSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-72" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                        <Skeleton className="h-10 w-48" />
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-1/4 mb-4" />
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array.from({ length: 5 }).map((_, i) => <ItemCardSkeleton key={`skel-main-${i}`} />)}
                    </div>
                    <Skeleton className="h-6 w-1/4 my-4" />
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => <ItemCardSkeleton key={`skel-main-${i}`} />)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplaceContent />
    </Suspense>
  );
}
