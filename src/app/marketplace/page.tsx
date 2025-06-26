
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search as SearchIconLucide, MapPin, Leaf, Briefcase, Pin, PinOff, CheckCircle, Sparkles, Package as PackageIcon, Users, Apple, Wheat, Sprout, Wrench, Truck, TestTube2, Tractor, CircleDollarSign, GraduationCap, DraftingCompass, Warehouse, ShieldCheck, LocateFixed, Tag, LayoutGrid, Building, Handshake, Carrot, ShoppingBag, Star, Flame, Percent, Building2, LandPlot, ChevronRight, Brain } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { LISTING_TYPE_FILTER_OPTIONS, type ListingType } from "@/lib/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { AllCategoriesDropdown } from "@/components/marketplace/AllCategoriesDropdown"; 
import { AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { getMarketplaceItemsByCategory } from "@/lib/firebase";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getMarketplaceRecommendations, type MarketplaceRecommendationInput } from "@/ai/flows/marketplace-recommendations";
import { getAllMarketplaceItemsFromDB } from "@/lib/db-utils";

// Super App Vision Note: The Marketplace is more than a list of items.
// It's a dynamic hub that uses AI to provide personalized recommendations
// and will eventually integrate directly with other modules like Financial Services
// (for "Apply Now" buttons) and Traceability (to show a product's history).
// The goal is to make trade simple, efficient, and trustworthy.

function MarketplaceContent() {
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
  const router = useRouter();
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
      } catch (error) {
        console.error("Failed to fetch marketplace items:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch marketplace items. Please try again later.",
        });
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();

    // AI Integration Point: Fetch personalized recommendations based on user context.
    const fetchAiRecommendations = async () => {
      setIsLoadingAiRecommendations(true);
      try {
        const allItems = await getAllMarketplaceItemsFromDB();
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
              const foundItem = allItems.find(item => item.id === suggested.itemId);
              if (foundItem) {
                recommendedFullItems.push(foundItem);
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

  }, [userType, toast]);
  
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
      toast({ title: "Homepage Unpinned!", description: "The Dashboard is now your default homepage." });
    } else {
      setHomepagePreference(pathname);
      toast({ title: "Marketplace Pinned!", description: "The Marketplace is now your default homepage." });
    }
  }, [isCurrentHomepage, clearHomepagePreference, setHomepagePreference, pathname, toast]);

  if (isLoading || !isMounted) return <MarketplaceSkeleton />;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Agricultural Marketplace & Services Hub</CardTitle>
              <CardDescription>Discover products, equipment, land, and professional services to support your agricultural needs.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/marketplace/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Listing
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSetHomepage}>
                {isCurrentHomepage ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                {isCurrentHomepage ? "Unpin" : "Pin"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center md:items-end">
            <AllCategoriesDropdown />
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end w-full md:w-auto">
              <div className="relative sm:col-span-2 md:col-span-1">
                <Label htmlFor="search-marketplace" className="sr-only">Search Marketplace</Label>
                <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search-marketplace" placeholder="Search products & services..." className="pl-10 h-10" 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Label htmlFor="location-filter-marketplace" className="sr-only">Filter by location</Label>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="location-filter-marketplace" placeholder="Filter by location" className="pl-10 h-10"
                  value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <Select value={listingTypeFilter} onValueChange={(value) => setListingTypeFilter(value as ListingType | 'All')}>
                <SelectTrigger id="listing-type-filter-marketplace" className="h-10">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPE_FILTER_OPTIONS.map(typeOpt => (
                    <SelectItem key={typeOpt.value} value={typeOpt.value}>{typeOpt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {aiRecommendedItems.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-1.5"><Brain className="h-5 w-5 text-primary"/>Recommended For You</h2>
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

          <h2 className="text-xl font-semibold mb-4 mt-6">Discover More</h2>
          {filteredMarketplaceItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMarketplaceItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="text-center py-16 col-span-full border-2 border-dashed rounded-lg">
              <p className="text-lg text-muted-foreground">No items found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try broadening your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const ItemCard = ({ item, reason }: { item: MarketplaceItem, reason?: string }) => (
  <Card className="rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-200 flex flex-col group">
    <Link href={`/marketplace/${item.id}`} className="block">
      <div className="relative w-full aspect-[4/3]">
        <Image 
          src={item.imageUrl || "https://placehold.co/400x300.png"} alt={item.name} fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          data-ai-hint={item.dataAiHint || `${item.category.split('-')[0]} agricultural`}
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
          <Badge variant="secondary" className="py-1 px-2 text-xs flex items-center capitalize shadow-md">
            {item.listingType === 'Product' ? <PackageIcon className="h-3 w-3 mr-1" /> : <Briefcase className="h-3 w-3 mr-1" />}
            {item.listingType}
          </Badge>
          {item.isSustainable && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 text-xs shadow-md">
              <Leaf className="h-3 w-3 mr-1" />Sustainable
            </Badge>
          )}
        </div>
      </div>
    </Link>
    <CardContent className="p-3 flex flex-col flex-grow">
      <Badge variant="outline" className="text-xs w-fit py-0.5 px-1.5 capitalize mb-2">{item.category.replace(/-/g, ' ')}</Badge>
      <Link href={`/marketplace/${item.id}`} className="block mb-1">
        <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 h-10">
          {item.name}
        </h3>
      </Link>
      {reason && <p className="text-[11px] text-muted-foreground/80 italic line-clamp-2 h-7" title={reason}>✨ {reason}</p>}
      <div className="mt-auto">
        <div className="flex items-center text-xs text-muted-foreground my-2">
          <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
        {item.listingType === 'Product' ? (
          <div className="text-lg font-bold text-primary">
            ${item.price?.toFixed(2) ?? 'Inquire'}
            {item.perUnit && <span className="text-xs text-muted-foreground font-normal ml-1.5">{item.perUnit}</span>}
          </div>
        ) : (
          item.compensation && <p className="text-sm font-medium text-primary line-clamp-1">{item.compensation}</p>
        )}
      </div>
    </CardContent>
    <CardFooter className="p-3 border-t">
      <Button asChild className="w-full h-9 text-xs" variant="outline">
        <Link href={`/marketplace/${item.id}`}>View Details</Link>
      </Button>
    </CardFooter>
  </Card>
);

const MarketplaceSkeleton = () => {
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
    
