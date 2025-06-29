
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search as SearchIconLucide, MapPin, Pin, PinOff, Building, Brain } from "lucide-react"; 
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { LISTING_TYPE_FILTER_OPTIONS, type ListingType } from "@/lib/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { AllCategoriesDropdown } from "@/components/marketplace/AllCategoriesDropdown"; 
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getMarketplaceRecommendations, type MarketplaceRecommendationInput } from "@/ai/flows/marketplace-recommendations";
import { getAllMarketplaceItemsFromDB } from "@/lib/db-utils";
import { ItemCard } from "@/components/marketplace/ItemCard";
import { useTranslation } from "react-i18next";

function MarketplaceContent() {
  const { t } = useTranslation('common');
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | 'All'>('All');
  const [locationFilter, setLocationFilter] = useState("");
  
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [aiRecommendedItems, setAiRecommendedItems] = useState<MarketplaceItem[]>([]);
  const [isLoadingAiRecommendations, setIsLoadingAiRecommendations] = useState(true);
  const [aiRecommendationReasons, setAiRecommendationReasons] = useState<Record<string, string>>({});

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const userType = searchParams.get('userType') as 'consumer' | 'farmer' | 'trader' | null;

  const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
  const { toast } = useToast(); 

  useEffect(() => {
    setIsMounted(true);

    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const result = await getAllMarketplaceItemsFromDB();
        setItems(result as MarketplaceItem[]);
        return result as MarketplaceItem[]; // Return for chaining
      } catch (error) {
        console.error("Failed to fetch marketplace items:", error);
        toast({ variant: "destructive", title: t('error'), description: t('marketplacePage.errorLoading') });
        setItems([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchAiRecommendations = async (allItems: MarketplaceItem[]) => {
      if (allItems.length === 0) {
        setIsLoadingAiRecommendations(false);
        return;
      }
      setIsLoadingAiRecommendations(true);
      try {
        const mockUserContext: MarketplaceRecommendationInput = {
          stakeholderRole: userType === 'farmer' ? "Farmer" : userType === 'trader' ? "Trader" : "Consumer",
          recentSearches: userType === 'farmer' ? ["organic fertilizer", "irrigation"] : userType === 'trader' ? ["bulk maize", "shipping"] : ["fresh tomatoes"],
          viewedCategories: userType === 'farmer' ? ["fertilizers-soil"] : userType === 'trader' ? ["grains-cereals"] : ["fresh-produce-vegetables"],
          currentLocation: t('marketplacePage.aiLocationContext')
        };
        const recommendationsOutput = await getMarketplaceRecommendations(mockUserContext);
        
        const recommendedFullItems: MarketplaceItem[] = [];
        const reasons: Record<string, string> = {};

        if (recommendationsOutput && Array.isArray(recommendationsOutput.suggestedItems)) {
            recommendationsOutput.suggestedItems.forEach(suggested => {
              const foundItem = allItems.find(item => item.id === suggested.itemId);
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
        toast({ variant: "destructive", title: t('marketplacePage.errorAi') });
      } finally {
        setIsLoadingAiRecommendations(false);
      }
    };
    
    fetchItems().then((fetchedItems) => {
        fetchAiRecommendations(fetchedItems);
    });
  }, [userType, toast, t]);
  
  const filteredMarketplaceItems = useMemo(() => {
    if (!isMounted) return [];
    
    return items.filter(item => { 
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description.toLowerCase().includes(searchLower);
      const categoryPass = !currentCategory || item.category === currentCategory;
      const listingTypePass = listingTypeFilter === 'All' || item.listingType === listingTypeFilter;
      const locationMatch = locationFilter === "" || item.location.toLowerCase().includes(locationLower);
      return (nameMatch || descriptionMatch) && categoryPass && listingTypePass && locationMatch;
    });
  }, [searchTerm, currentCategory, listingTypeFilter, locationFilter, items, isMounted]); 

  const isCurrentHomepage = homepagePreference === pathname;
  const handleSetHomepage = useCallback(() => {
    if (isCurrentHomepage) {
      clearHomepagePreference();
      toast({ title: t('marketplacePage.unpinnedTitle'), description: t('marketplacePage.unpinnedDescription') });
    } else {
      setHomepagePreference(pathname);
      toast({ title: t('marketplacePage.pinnedTitle'), description: t('marketplacePage.pinnedDescription') });
    }
  }, [isCurrentHomepage, clearHomepagePreference, setHomepagePreference, pathname, toast, t]);

  if (isLoading || !isMounted) return <MarketplaceSkeleton />;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{t('marketplacePage.title')}</CardTitle>
              <CardDescription>{t('marketplacePage.description')}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button asChild variant="secondary">
                  <Link href="/marketplace/create-shop"><Building className="mr-2 h-4 w-4" /> {t('marketplacePage.createShopButton')}</Link>
              </Button>
              <Button asChild>
                <Link href="/marketplace/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> {t('marketplacePage.createListingButton')}
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSetHomepage}>
                {isCurrentHomepage ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                {isCurrentHomepage ? t('unpin') : t('pin')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center md:items-end">
            <AllCategoriesDropdown />
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end w-full md:w-auto">
              <div className="relative sm:col-span-2 md:col-span-1">
                <Label htmlFor="search-marketplace" className="sr-only">{t('marketplacePage.searchLabel')}</Label>
                <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search-marketplace" placeholder={t('marketplacePage.searchPlaceholder')} className="pl-10 h-10" 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Label htmlFor="location-filter-marketplace" className="sr-only">{t('marketplacePage.locationLabel')}</Label>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="location-filter-marketplace" placeholder={t('marketplacePage.locationPlaceholder')} className="pl-10 h-10"
                  value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <Select value={listingTypeFilter} onValueChange={(value) => setListingTypeFilter(value as ListingType | 'All')}>
                <SelectTrigger id="listing-type-filter-marketplace" className="h-10">
                  <SelectValue placeholder={t('marketplacePage.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPE_FILTER_OPTIONS.map(typeOpt => (
                    <SelectItem key={typeOpt.value} value={typeOpt.value}>{t(`listingTypes.${typeOpt.value}`, typeOpt.label)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {aiRecommendedItems.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-1.5"><Brain className="h-5 w-5 text-primary"/>{t('marketplacePage.recommendationsTitle')}</h2>
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

          <h2 className="text-xl font-semibold mb-4 mt-6">{t('marketplacePage.discoverTitle')}</h2>
          {filteredMarketplaceItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMarketplaceItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="text-center py-16 col-span-full border-2 border-dashed rounded-lg">
              <p className="text-lg text-muted-foreground">{t('marketplacePage.notFoundTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('marketplacePage.notFoundDescription')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const MarketplaceSkeleton = () => {
    const { t } = useTranslation('common');
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
           <CardContent>
              <div className="mb-6 flex flex-col md:flex-row gap-4 items-center md:items-end">
                <Skeleton className="h-10 w-48" />
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end w-full md:w-auto">
                  <Skeleton className="h-10 w-full sm:col-span-2 md:col-span-1" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              
              <section className="mb-8">
                <Skeleton className="h-6 w-1/4 mb-3" />
                <div className="flex space-x-4 pb-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={`fskel-prod-${i}`} className="w-52 h-72 rounded-lg" />)}
                </div>
              </section>
              
              <Skeleton className="h-6 w-1/4 mb-4" /> 
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, index) => <Skeleton key={`itemskel-initial-${index}`} className="h-80 rounded-lg" />)}
              </div>
            </CardContent>
        </Card>
      </div>
    );
};

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplaceContent />
    </Suspense>
  )
}
