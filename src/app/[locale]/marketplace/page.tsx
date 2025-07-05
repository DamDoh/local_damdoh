
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search as SearchIconLucide, MapPin, Pin, PinOff, Building, ShoppingCart } from "lucide-react"; 
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { getListingTypeFilterOptions, type ListingType, UNIFIED_MARKETPLACE_CATEGORY_IDS } from "@/lib/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { AllCategoriesDropdown } from "@/components/marketplace/AllCategoriesDropdown"; 
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getMarketplaceRecommendations, type MarketplaceRecommendationInput } from "@/ai/flows/marketplace-recommendations";
import { getAllMarketplaceItemsFromDB, performSearch } from "@/lib/db-utils";
import { Brain } from "lucide-react";
import { ItemCard } from "@/components/marketplace/ItemCard";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-utils";

function MarketplaceContent() {
  const t = useTranslations('marketplacePage');
  const tConstants = useTranslations('constants');
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | 'All'>('All');
  const [locationFilter, setLocationFilter] = useState("");
  
  const [displayedItems, setDisplayedItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [allItemsForAI, setAllItemsForAI] = useState<MarketplaceItem[]>([]);
  const [aiRecommendedItems, setAiRecommendedItems] = useState<MarketplaceItem[]>([]);
  const [isLoadingAiRecommendations, setIsLoadingAiRecommendations] = useState(true);
  const [aiRecommendationReasons, setAiRecommendationReasons] = useState<Record<string, string>>({});

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const userType = searchParams.get('userType') as 'consumer' | 'farmer' | 'trader' | null;

  const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
  const { toast } = useToast(); 

  const listingTypeFilterOptions = getListingTypeFilterOptions(tConstants);

  // Effect to fetch ALL items once, just for AI recommendations.
  useEffect(() => {
    setIsMounted(true);
    const fetchAllForAI = async () => {
        const result = await getAllMarketplaceItemsFromDB();
        const allFetchedItems = Array.isArray(result) ? (result as MarketplaceItem[]) : [];
        setAllItemsForAI(allFetchedItems);
    }
    fetchAllForAI();
  }, []);

  // Effect to generate AI recommendations once all items are fetched.
  useEffect(() => {
    if (allItemsForAI.length === 0) {
        setIsLoadingAiRecommendations(false);
        return;
    }
    const fetchAiRecommendations = async () => {
        setIsLoadingAiRecommendations(true);
        try {
            const mockUserContext: MarketplaceRecommendationInput = {
            stakeholderRole: userType === 'farmer' ? "Farmer" : userType === 'trader' ? "Trader" : "Consumer",
            recentSearches: userType === 'farmer' ? ["organic fertilizer", "irrigation"] : userType === 'trader' ? ["bulk maize", "shipping"] : ["fresh tomatoes"],
            viewedCategories: userType === 'farmer' ? ["fertilizers-soil"] : userType === 'trader' ? ["grains-cereals"] : ["fresh-produce-vegetables"],
            currentLocation: "Kenya" 
            };
            const recommendationsOutput = await getMarketplaceRecommendations(mockUserContext);
            
            const recommendedFullItems: MarketplaceItem[] = [];
            const reasons: Record<string, string> = {};

            if (recommendationsOutput && Array.isArray(recommendationsOutput.suggestedItems)) {
                recommendationsOutput.suggestedItems.forEach(suggested => {
                const foundItem = allItemsForAI.find(item => item && item.id === suggested.itemId);
                if (foundItem) {
                    recommendedFullItems.push(foundItem as MarketplaceItem);
                    reasons[foundItem.id] = suggested.reason;
                }
                });
            }
            setAiRecommendedItems(recommendedFullItems.slice(0, 5)); 
            setAiRecommendationReasons(reasons);
        } catch (error) {
            console.error("Error fetching AI marketplace recommendations:", error);
            toast({ variant: "destructive", title: "Could not fetch AI recommendations" });
        } finally {
            setIsLoadingAiRecommendations(false);
        }
    };
    fetchAiRecommendations();
  }, [allItemsForAI, userType, toast]);
  
  // Effect to perform search when filters change
  useEffect(() => {
    if (!isMounted) return;

    const fetchFilteredItems = async () => {
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
            category: res.tags?.find((t: string) => UNIFIED_MARKETPLACE_CATEGORY_IDS.includes(t)) || res.tags?.[0] || '',
            sellerId: 'unknown',
            createdAt: res.createdAt?.toDate ? res.createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: res.updatedAt?.toDate ? res.updatedAt.toDate().toISOString() : new Date().toISOString(),
        }));
        setDisplayedItems(mappedItems);
      } catch (error) {
        console.error("Failed to perform search:", error);
        toast({
          variant: "destructive",
          title: "Search Error",
          description: "Could not fetch marketplace items.",
        });
        setDisplayedItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredItems();
  }, [isMounted, searchTerm, currentCategory, listingTypeFilter, locationFilter, toast]);

  const isCurrentHomepage = homepagePreference === pathname;
  const handleSetHomepage = useCallback(() => {
    if (isCurrentHomepage) {
      clearHomepagePreference();
      toast({ title: "Homepage Unpinned!", description: "The Dashboard is now your default homepage." });
    } else {
      setHomepagePreference(pathname);
      toast({ title: "Marketplace Pinned!", description: "The Marketplace is now your default homepage." });
    }
  }, [isCurrentHomepage, clearHomepagePreference, setHomepagePreference, pathname, toast]);

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
                  <Link href="/marketplace/my-orders"><ShoppingCart className="mr-2 h-4 w-4" />My Received Orders</Link>
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

          {aiRecommendedItems.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-1.5"><Brain className="h-5 w-5 text-primary"/>{t('recommendedForYou')}</h2>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 pb-2">
                {isLoadingAiRecommendations ? 
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={`aiskel-desk-${i}`} className="w-52 h-72 rounded-lg" />) :
                  aiRecommendedItems.map(item => <ItemCard key={`ai-rec-${item.id}`} item={item} reason={aiRecommendationReasons[item.id]} />)}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}

          <h2 className="text-xl font-semibold mb-4 mt-6">{t('discoverMore')}</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-52 space-y-2">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                ))}
            </div>
          ) : displayedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="text-center py-16 col-span-full border-2 border-dashed rounded-lg">
              <p className="text-lg text-muted-foreground">{t('noItemsFound')}</p>
              <p className="text-sm text-muted-foreground">{t('noItemsHint')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MarketplaceSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
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
                        {Array.from({ length: 5 }).map((_, i) => (
                             <Card key={i} className="w-52">
                                <CardHeader className="p-0">
                                    <Skeleton className="w-full h-32 rounded-t-lg"/>
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
                        ))}
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
