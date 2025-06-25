
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types"; // Changed from Product to MarketplaceItem
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search as SearchIconLucide, MapPin, Leaf, Briefcase, Pin, PinOff, CheckCircle, Sparkles, Package as PackageIcon, Users, Apple, Wheat, Sprout, Wrench, Truck, TestTube2, Tractor, CircleDollarSign, GraduationCap, DraftingCompass, Warehouse, ShieldCheck, LocateFixed, Tag, LayoutGrid, Building, Handshake, Carrot, ShoppingBag, Star, Flame, Percent, Building2, LandPlot, ChevronRight, Brain } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { Label } from "@/components/ui/label"; // Corrected import path
import { LISTING_TYPE_FILTER_OPTIONS, type ListingType } from "@/lib/constants";
import { dummyMarketplaceItems } from "@/lib/dummy-data"; 
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { AllCategoriesDropdown } from "@/components/marketplace/AllCategoriesDropdown"; 
import { AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { getMarketplaceItemsByCategory } from "@/lib/firebase";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getMarketplaceRecommendations, type MarketplaceRecommendationInput, type MarketplaceRecommendationOutput } from "@/ai/flows/marketplace-recommendations";


const ALL_QUICK_ACCESS_CATEGORIES_IDS: CategoryNode['id'][] = [
  'fresh-produce-fruits', 
  'grains-cereals',
  'seeds-seedlings',
  'fertilizers-soil',
  'farm-tools-small-equip',
  'heavy-machinery-sale',
  'farm-labor-staffing',
  'equipment-rental-operation',
  'logistics-transport',
  'consultancy-advisory',
  'technical-repair-services', // Corrected category ID from technical-services
  'storage-warehousing',
  'processing-value-addition-services', // Corrected category ID from processing-value-addition
  'financial-services', // Corrected category ID from financial-insurance
  'land-services',
];

const CONSUMER_PRODUCE_CATEGORY_IDS: CategoryNode['id'][] = [
  'fresh-produce-fruits',
  'fresh-produce-vegetables',
  'grains-cereals',
  'livestock-poultry',
  'dairy-alternatives',
  'processed-packaged',
];

const FARMER_INTEREST_CATEGORY_IDS: CategoryNode['id'][] = [
  'seeds-seedlings', 'fertilizers-soil', 'pest-control-products', 'farm-tools-small-equip', 'heavy-machinery-sale', 
  'farm-labor-staffing', 'equipment-rental-operation', 'land-services', 'technical-repair-services', // Corrected
  'agronomy-consultancy' // Corrected
]; 

const TRADER_INTEREST_CATEGORY_IDS: CategoryNode['id'][] = [
  'fresh-produce-fruits', 'fresh-produce-vegetables', 'grains-cereals', 'livestock-poultry', 
  'logistics-transport', 'storage-warehousing', 'processing-value-addition-services', // Corrected
  'financial-services' // Corrected
];


const mobileIconGridItems = [
  { name: "Fruits", icon: Apple, href: "/marketplace?category=fresh-produce-fruits", dataAiHint: "apple fruit" },
  { name: "Vegetables", icon: Carrot, href: "/marketplace?category=fresh-produce-vegetables", dataAiHint: "carrot vegetable" },
  { name: "Grains", icon: Wheat, href: "/marketplace?category=grains-cereals", dataAiHint: "wheat grain" },
  { name: "Fertilizers", icon: ShoppingBag, href: "/marketplace?category=fertilizers-soil", dataAiHint: "fertilizer bag" },
  { name: "Equipment", icon: Tractor, href: "/marketplace?category=heavy-machinery-sale", dataAiHint: "farm tractor" },
];


function MarketplaceContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | 'All'>('All');
  const [locationFilter, setLocationFilter] = useState("");
  
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
  const [items, setItems] = useState<MarketplaceItem[]>([]); // State for fetched items, typed as MarketplaceItem

  // Conceptual: State to hold the list of MarketplaceItem objects fetched from the backend.
  // const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [aiRecommendedItems, setAiRecommendedItems] = useState<MarketplaceItem[]>([]);
  const [isLoadingAiRecommendations, setIsLoadingAiRecommendations] = useState(false);
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

    // Conceptual: Initiate data fetching for marketplace items here.
    // Call a function like `fetchMarketplaceItems()` to get the list from Firebase/Backend.
    const fetchItems = async () => {
      // Pass currentCategory (which can be string | null) correctly
      const { items: fetchedItems } = await getMarketplaceItemsByCategory(currentCategory || undefined);
      setItems(fetchedItems as MarketplaceItem[]); 
    };

    fetchItems();

    const typeParam = searchParams.get('listingType');
    if (typeParam && (typeParam === 'Product' || typeParam === 'Service')) {
        setListingTypeFilter(typeParam as ListingType);
    }

    const fetchAiRecommendations = async () => {
      setIsLoadingAiRecommendations(true);
      try {
        const mockUserContextForAISuggestions: MarketplaceRecommendationInput = {
          stakeholderRole: userType === 'farmer' ? "Farmer" : userType === 'trader' ? "Trader" : "Consumer",
          recentSearches: userType === 'farmer' ? ["organic fertilizer", "irrigation"] : userType === 'trader' ? ["bulk maize", "shipping"] : ["fresh tomatoes"],
          viewedCategories: userType === 'farmer' ? ["fertilizers-soil"] : userType === 'trader' ? ["grains-cereals"] : ["fresh-produce-vegetables"],
          currentLocation: "Kenya" 
        };
        const recommendationsOutput = await getMarketplaceRecommendations(mockUserContextForAISuggestions);
        
        const recommendedFullItems: MarketplaceItem[] = [];
        const reasons: Record<string, string> = {};

        recommendationsOutput.suggestedItems.forEach(suggested => {
          const foundItem = dummyMarketplaceItems.find(item => item.id === suggested.itemId);
          if (foundItem) {
            recommendedFullItems.push(foundItem);
            reasons[foundItem.id] = suggested.reason;
          } else {
            console.warn(`AI suggested item ID "${suggested.itemId}" not found in dummyMarketplaceItems.`);
          }
        });
        setAiRecommendedItems(recommendedFullItems.slice(0, 5)); 
        setAiRecommendationReasons(reasons);

      } catch (error) {
        console.error("Error fetching AI marketplace recommendations:", error);
        toast({ variant: "destructive", title: "Could not fetch AI recommendations" });
      }
      setIsLoadingAiRecommendations(false);
    };

    fetchAiRecommendations();

  }, [searchParams, userType, toast, currentCategory]);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null || categoryId === currentCategory) { 
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentCategory, pathname, router, searchParams]);
  
  const quickAccessCategories: CategoryNode[] = useMemo(() => {
    let relevantCategoryIds: CategoryNode['id'][] = ALL_QUICK_ACCESS_CATEGORIES_IDS;
    if (userType === 'consumer') {
      relevantCategoryIds = CONSUMER_PRODUCE_CATEGORY_IDS;
    } else if (userType === 'farmer') {
      relevantCategoryIds = FARMER_INTEREST_CATEGORY_IDS;
    } else if (userType === 'trader') {
      relevantCategoryIds = TRADER_INTEREST_CATEGORY_IDS;
    }
    return AGRICULTURAL_CATEGORIES.filter(cat => relevantCategoryIds.includes(cat.id)).slice(0, 8); 
  }, [userType]);
  
  const mobileQuickLinks = useMemo(() => {
    let baseLinks: { id: string; name: string; href: string; icon: React.ElementType }[] = [
      { id: 'mq_fresh', name: "Fresh Produce", href: "/marketplace?category=fresh-produce-fruits", icon: Apple },
      { id: 'mq_inputs', name: "Inputs", href: "/marketplace?category=seeds-seedlings", icon: ShoppingBag },
      { id: 'mq_machinery', name: "Machinery", href: "/marketplace?category=heavy-machinery-sale", icon: Tractor },
      { id: 'mq_services', name: "Services", href: "/marketplace?listingType=Service", icon: Briefcase },
      { id: 'mq_land', name: "Land", href: "/marketplace?category=land-services", icon: LandPlot },
    ];

    if (userType === 'consumer') {
      return baseLinks.filter(link => 
         CONSUMER_PRODUCE_CATEGORY_IDS.some(consumerCatId => link.href.includes(consumerCatId)) ||
         link.href.includes('listingType=Product') 
      ).slice(0,5); 
    } else if (userType === 'farmer') {
      return [
        { id: 'mq_inputs_f', name: "Inputs", href: "/marketplace?category=seeds-seedlings", icon: ShoppingBag },
        { id: 'mq_machinery_f', name: "Machinery", href: "/marketplace?category=heavy-machinery-sale", icon: Tractor },
        { id: 'mq_land_f', name: "Land", href: "/marketplace?category=land-services", icon: LandPlot },
        { id: 'mq_labor_f', name: "Labor", href: "/marketplace?category=farm-labor-staffing", icon: Users },
        { id: 'mq_tech_f', name: "Tech Services", href: "/marketplace?category=technical-repair-services", icon: Wrench },
      ];
    } else if (userType === 'trader') {
       return [
        { id: 'mq_produce_t', name: "Produce", href: "/marketplace?category=fresh-produce-fruits", icon: Apple },
        { id: 'mq_grains_t', name: "Grains", href: "/marketplace?category=grains-cereals", icon: Wheat },
        { id: 'mq_logistics_t', name: "Logistics", href: "/marketplace?category=logistics-transport", icon: Truck },
        { id: 'mq_storage_t', name: "Storage", href: "/marketplace?category=storage-warehousing", icon: Warehouse },
        { id: 'mq_finance_t', name: "Finance", href: "/marketplace?category=financial-services", icon: CircleDollarSign },
      ];
    }
    return baseLinks;
  }, [userType]);


  const handleFetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      toast({ variant: "destructive", title: "Geolocation Not Supported", description: "Your browser does not support geolocation." });
      return;
    }

    setIsFetchingLocation(true);
    setLocationStatus("Fetching your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationStatus("Showing items near you. Fresh produce prioritized.");
        toast({ title: "Location Found!", description: "Displaying nearby listings." });
        setIsFetchingLocation(false);
      },
      (error) => {
        let message = "Could not get location. Showing general listings.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable permissions. Showing general listings.";
        }
        setLocationStatus(message);
        toast({ variant: "destructive", title: "Location Error", description: message });
        setUserCoordinates(null); 
        setIsFetchingLocation(false);
      }
    );
  }, [toast]);

  const filteredMarketplaceItems = useMemo(() => {
    if (!isMounted) return [];

    let filtered = items.filter(item => { 
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description.toLowerCase().includes(searchLower);
      
      const categoryPass = !currentCategory || item.category === currentCategory;
      const listingTypePass = listingTypeFilter === 'All' || item.listingType === listingTypeFilter;
      
      const locationMatch = locationFilter === "" || item.location.toLowerCase().includes(locationLower);
      
      return (nameMatch || descriptionMatch) && categoryPass && listingTypePass && locationMatch;
    });

    if (!currentCategory) {
      if (userType === 'consumer') {
        filtered = filtered.filter(item => CONSUMER_PRODUCE_CATEGORY_IDS.includes(item.category as CategoryNode['id']));
      } else if (userType === 'farmer') {
        filtered = filtered.filter(item => FARMER_INTEREST_CATEGORY_IDS.includes(item.category as CategoryNode['id']));
      } else if (userType === 'trader') {
        filtered = filtered.filter(item => TRADER_INTEREST_CATEGORY_IDS.includes(item.category as CategoryNode['id']));
      }
    }

    if (userCoordinates) { 
      const freshProduceItems = filtered.filter(
        item => item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables'
      );
      const otherItems = filtered.filter(
        item => !(item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables')
      );
      const freshProduceIds = new Set(freshProduceItems.map(fp => fp.id));
      return [...freshProduceItems, ...otherItems.filter(item => !freshProduceIds.has(item.id))];
    }
    return filtered;
  }, [searchTerm, currentCategory, listingTypeFilter, locationFilter, items, isMounted, userCoordinates, userType]); 

  const getCategoryIcon = (category: CategoryNode['id']) => {
    const catNode = AGRICULTURAL_CATEGORIES.find(c => c.id === category);
    const IconComponent = catNode?.icon || Sparkles; 
 return <IconComponent className="h-3 w-3 mr-1.5 inline-block shrink-0" />;
  }
  
  const getCategoryName = (categoryId: CategoryNode['id']) => {
    return AGRICULTURAL_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  }

  const isCurrentHomepage = homepagePreference === pathname;

  const handleSetHomepage = useCallback(() => {
    if (isCurrentHomepage) {
      clearHomepagePreference();
      toast({
        title: "Homepage Unpinned!",
        description: "The Dashboard is now your default homepage.",
      });
    } else {
      setHomepagePreference(pathname);
      toast({
        title: "Marketplace Pinned!",
        description: "The Marketplace is now your default homepage.",
      });
    }
  }, [isCurrentHomepage, clearHomepagePreference, setHomepagePreference, pathname, toast]);

  const { featuredProductsTitle, featuredProductsItems } = useMemo(() => {
    if (!isMounted) return { featuredProductsTitle: "Featured Products", featuredProductsItems: [] };
    
    let title = "Featured Products";
    let productsSource = filteredMarketplaceItems;

    if (userCoordinates) { 
        const fresh = productsSource.filter(item => item.listingType === 'Product' && (item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables'));
        const others = productsSource.filter(item => item.listingType === 'Product' && !(item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables'));
        const freshIds = new Set(fresh.map(f => f.id));
        productsSource = [...fresh, ...others.filter(o => !freshIds.has(o.id))];
    }

    let filteredFeaturedProducts = [];

    if (userType === 'farmer') {
      title = "Featured Inputs & Equipment";
      filteredFeaturedProducts = productsSource.filter(item => 
        item.listingType === 'Product' && 
        (item.category === 'seeds-seedlings' || item.category === 'fertilizers-soil' || item.category === 'farm-tools-small-equip' || item.category === 'heavy-machinery-sale')
      );
    } else if (userType === 'trader') {
      title = "Tradable Commodities";
      filteredFeaturedProducts = productsSource.filter(item => 
        item.listingType === 'Product' && 
        (item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables' || item.category === 'grains-cereals')
      );
    } else { 
      filteredFeaturedProducts = productsSource.filter(item => item.listingType === 'Product');
    }
    return { featuredProductsTitle: title, featuredProductsItems: filteredFeaturedProducts.slice(0, 6) };
  }, [filteredMarketplaceItems, isMounted, userCoordinates, userType]);

  const { featuredServicesTitle, featuredServicesItems } = useMemo(() => {
    if (!isMounted || userType === 'consumer') return { featuredServicesTitle: "Recommended Services", featuredServicesItems: [] };
    
    let title = "Recommended Services";
    let filteredFeaturedServices = [];

    if (userType === 'farmer') {
      title = "Key Farmer Services";
      filteredFeaturedServices = filteredMarketplaceItems.filter(item => 
        item.listingType === 'Service' && 
        (item.category === 'farm-labor-staffing' || item.category === 'equipment-rental-operation' || item.category === 'technical-repair-services' || item.category === 'land-services')
      );
    } else if (userType === 'trader') {
      title = "Logistics & Trade Services";
      filteredFeaturedServices = filteredMarketplaceItems.filter(item => 
        item.listingType === 'Service' && 
        (item.category === 'logistics-transport' || item.category === 'storage-warehousing' || item.category === 'financial-services')
      );
    } else {
       filteredFeaturedServices = filteredMarketplaceItems.filter(item => item.listingType === 'Service');
    }
    return { featuredServicesTitle: title, featuredServicesItems: filteredFeaturedServices.slice(0, 6) };
  }, [filteredMarketplaceItems, isMounted, userType]);


  if (!isMounted) {
    const showServicesSkeleton = userType !== 'consumer';
    return (
      <>
        {/* Mobile Skeleton */}
        <div className="md:hidden space-y-4 pb-16">
          <div className="sticky top-0 z-20 bg-background p-2 shadow-sm">
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
          <ScrollArea className="w-full whitespace-nowrap px-2">
            <div className="flex space-x-3 pb-1">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={`mqs-${i}`} className="h-9 w-24 rounded-md" />)}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="grid grid-cols-5 gap-2 px-2 text-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Link key={`igs-${i}`} href="#" className="flex flex-col items-center p-2 rounded-lg">
                <Skeleton className="h-10 w-10 mb-1.5" />
                <Skeleton className="h-3 w-12" />
              </Link>
            ))}
          </div>
           <section className="px-2 space-y-2">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-3 pb-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={`fs-${i}`} className="w-36 h-48 rounded-md" />)}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
           {showServicesSkeleton && (
             <section className="px-2 space-y-2 mt-6">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-3 pb-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={`fss-${i}`} className="w-36 h-48 rounded-md" />)}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
           )}
          <div className="px-2 pt-2">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={`mgs-${i}`} className="h-56 rounded-lg" />)}
            </div>
          </div>
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden md:block space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-2 mt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4"> 
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex space-x-3 pb-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Skeleton key={`qaskel-${index}`} className="h-9 w-28 rounded-md" />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
              <div className="mb-2 flex flex-col md:flex-row gap-4 items-center md:items-end"> 
                <Skeleton className="h-10 w-48" /> 
                <Skeleton className="h-10 w-36" /> 
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end w-full md:w-auto">
                  <Skeleton className="h-10 w-full sm:col-span-2 md:col-span-1" /> 
                  <Skeleton className="h-10 w-full" /> 
                  <Skeleton className="h-10 w-full" /> 
                </div>
              </div>
              <Skeleton className="h-4 w-1/3 mb-4" /> 

              <section className="mb-6">
                <Skeleton className="h-6 w-1/4 mb-3" />
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex space-x-4 pb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Card key={`fskel-prod-${i}`} className="w-52 shrink-0">
                        <Skeleton className="w-full aspect-[4/3] rounded-t-lg" />
                        <CardContent className="p-3 space-y-1.5">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-5 w-1/3" />
                        </CardContent>
                        <CardFooter className="p-3 border-t">
                          <Skeleton className="h-8 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>

              {showServicesSkeleton && (
                <section className="mb-6">
                  <Skeleton className="h-6 w-1/4 mb-3" />
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                         <Card key={`fskel-serv-${i}`} className="w-52 shrink-0">
                          <Skeleton className="w-full aspect-[4/3] rounded-t-lg" />
                          <CardContent className="p-3 space-y-1.5">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-5 w-1/3" />
                          </CardContent>
                          <CardFooter className="p-3 border-t">
                            <Skeleton className="h-8 w-full" />
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </section>
              )}
              
              <Skeleton className="h-6 w-1/4 mb-3" /> 
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {Array.from({ length: 18 }).map((_, index) => (
                  <Card key={`itemskel-initial-${index}`} className="rounded-lg overflow-hidden shadow-sm flex flex-col">
                    <Skeleton className="w-full aspect-[4/3]" />
                    <div className="p-3 flex flex-col flex-grow">
                      <Skeleton className="h-5 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2 my-1" />
                      <Skeleton className="h-6 w-1/3 my-1.5" />
                      <Skeleton className="h-8 w-full mb-2" />
                      <Skeleton className="h-4 w-full mt-auto pt-1" />
                    </div>
                    <div className="p-3 border-t mt-auto">
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }


  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden space-y-4 pb-16"> 
        <form onSubmit={(e) => e.preventDefault()} className="sticky top-0 z-20 bg-background p-2 shadow-sm">
          <div className="relative">
            <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products & services..." 
              className="pl-10 h-10 rounded-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <ScrollArea className="w-full whitespace-nowrap px-2">
          <div className="flex space-x-3 pb-1">
            {mobileQuickLinks.map((link) => (
              <Button
                key={link.id}
                variant={((currentCategory && link.href.includes(`category=${currentCategory}`)) || (listingTypeFilter !== "All" && link.href.includes(`listingType=${listingTypeFilter}`))) ? "default" : "outline"}
                size="sm" 
                className={cn(
                  "flex items-center gap-1.5 text-muted-foreground hover:text-primary font-normal text-xs h-9 px-3", 
                  ((currentCategory && link.href.includes(`category=${currentCategory}`)) || (listingTypeFilter !== "All" && link.href.includes(`listingType=${listingTypeFilter}`)))
                  && "bg-primary/10 text-primary font-semibold"
                )}
                onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (link.href.includes("listingType")) {
                        const typeParam = link.href.split("listingType=")[1];
                        params.set('listingType', typeParam);
                        params.delete('category'); 
                        setListingTypeFilter(typeParam as ListingType | 'All');
                    } else if (link.href.includes("category")) {
                        const categoryParam = link.href.split("category=")[1];
                         if (categoryParam === currentCategory) { 
                            params.delete('category');
                        } else {
                            params.set('category', categoryParam);
                        }
                        params.delete('listingType');
                        setListingTypeFilter("All"); 
                    }
                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                }}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="grid grid-cols-5 gap-2 px-2 text-center">
          {mobileIconGridItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="flex flex-col items-center p-2 rounded-lg hover:bg-accent/50 text-center"
              onClick={(e) => { e.preventDefault(); handleCategorySelect(item.href.split("=")[1]); }}
            >
              <item.icon className="h-6 w-6 text-primary mb-1.5" />
              <span className="text-[11px] text-foreground font-medium leading-snug line-clamp-2 h-[28px]">{item.name}</span>
            </Link>
          ))}
        </div>
        
        {aiRecommendedItems.length > 0 && (
          <section className="px-2 space-y-2 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-1.5"><Brain className="h-5 w-5 text-primary"/>Recommended For You</h2>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-3 pb-2">
                {isLoadingAiRecommendations ? 
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={`aiskel-mob-${i}`} className="w-36 h-48 rounded-md" />) :
                  aiRecommendedItems.map(item => (
                  <Card key={`ai-rec-mob-${item.id}`} className="w-36 shrink-0 overflow-hidden rounded-md shadow-sm">
                    <Link href={`/marketplace/${item.id}`} className="block">
                      <div className="relative w-full aspect-square">
                        <Image 
                          src={item.imageUrl || "https://placehold.co/150x150.png"} 
                          alt={item.name} 
                          fill={true}
                          sizes="33vw"
                          style={{objectFit:"cover"}}
                          data-ai-hint={item.dataAiHint || "product agriculture"}
                        />
                      </div>
                      <div className="p-1.5">
                        <p className="text-[11px] font-medium text-foreground line-clamp-2 h-7 leading-tight">{item.name}</p>
                        {item.listingType === 'Product' ? (
                            <p className="text-xs font-bold text-primary mt-0.5">
                            ${item.price?.toFixed(2) ?? 'N/A'}
                            {item.perUnit && <span className="text-[10px] text-muted-foreground font-normal ml-0.5">{item.perUnit}</span>}
                            </p>
                        ) : (
                            item.compensation && <p className="text-xs font-medium text-primary mt-0.5 line-clamp-1">{item.compensation}</p>
                        )}
                         {aiRecommendationReasons[item.id] && <p className="text-[9px] text-muted-foreground italic line-clamp-1 mt-0.5" title={aiRecommendationReasons[item.id]}>✨ {aiRecommendationReasons[item.id]}</p>}
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {featuredProductsItems.length > 0 && (
          <section className="px-2 space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{featuredProductsTitle}</h2>
                <Link href={`/marketplace?listingType=Product${userType ? `&userType=${userType}` : ''}${currentCategory ? `&category=${currentCategory}` : ''}`} className="text-xs text-primary hover:underline flex items-center">
                  See All <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-3 pb-2">
                {featuredProductsItems.map(item => (
                  <Card key={`feat-prod-${item.id}`} className="w-36 shrink-0 overflow-hidden rounded-md shadow-sm">
                    <Link href={`/marketplace/${item.id}`} className="block">
                      <div className="relative w-full aspect-square">
                        <Image 
                          src={item.imageUrl || "https://placehold.co/150x150.png"} 
                          alt={item.name} 
                          fill={true}
                          sizes="33vw"
                          style={{objectFit:"cover"}}
                          data-ai-hint={item.dataAiHint || "product agriculture"}
                        />
                      </div>
                      <div className="p-1.5">
                        <p className="text-[11px] font-medium text-foreground line-clamp-2 h-7 leading-tight">{item.name}</p>
                        <p className="text-xs font-bold text-primary mt-0.5">
                          ${item.price?.toFixed(2) ?? 'N/A'}
                          {item.perUnit && <span className="text-[10px] text-muted-foreground font-normal ml-0.5">{item.perUnit}</span>}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {featuredServicesItems.length > 0 && (
          <section className="px-2 space-y-2 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{featuredServicesTitle}</h2>
                <Link href={`/marketplace?listingType=Service${userType ? `&userType=${userType}` : ''}${currentCategory ? `&category=${currentCategory}` : ''}`} className="text-xs text-primary hover:underline flex items-center">
                  See All <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-3 pb-2">
                {featuredServicesItems.map(item => (
                  <Card key={`feat-serv-${item.id}`} className="w-36 shrink-0 overflow-hidden rounded-md shadow-sm">
                     <Link href={`/marketplace/${item.id}`} className="block">
                      <div className="relative w-full aspect-square">
                        <Image 
                          src={item.imageUrl || "https://placehold.co/150x150.png"} 
                          alt={item.name} 
                          fill={true}
                          sizes="25vw"
                          style={{objectFit:"cover"}}
                          data-ai-hint={item.dataAiHint || "service agriculture"}
                        />
                      </div>
                      <div className="p-1.5">
                        <p className="text-[11px] font-medium text-foreground line-clamp-2 h-7 leading-tight">{item.name}</p>
                        {item.compensation && <p className="text-xs font-medium text-primary mt-1 line-clamp-1">{item.compensation}</p>}
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        <div className="px-2 pt-4">
          <h2 className="text-lg font-semibold mb-2">Discover More</h2>
           {filteredMarketplaceItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredMarketplaceItems.map(item => (
                <Card key={item.id} className="rounded-lg overflow-hidden shadow-sm flex flex-col">
                   <Link href={`/marketplace/${item.id}`} className="block">
                    <div className="relative w-full aspect-square">
                      <Image 
                        src={item.imageUrl || "https://placehold.co/200x200.png"} 
                        alt={item.name} 
                        fill={true}
                        sizes="50vw"
                        style={{objectFit:"cover"}}
                        data-ai-hint={item.dataAiHint || `${item.category.split('-')[0]} agricultural`}
                      />
                      {userCoordinates && (item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables') && (
                         <Badge variant="secondary" className="absolute top-1 left-1 bg-green-100 text-green-700 border-green-300 text-[9px] py-0.5 px-1">
                          <Sprout className="h-2.5 w-2.5 mr-0.5" />
                          Fresh & Nearby
                        </Badge>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs font-medium text-foreground line-clamp-2 h-8 leading-tight mb-0.5">
                        {item.name}
                      </h3>
                      {item.listingType === 'Product' ? (
                        <div className="text-sm font-bold text-primary">
                          ${item.price?.toFixed(2) ?? 'N/A'}
                          {item.perUnit && <span className="text-[10px] text-muted-foreground font-normal ml-0.5">{item.perUnit}</span>}
                        </div>
                      ) : (
                        item.compensation && <p className="text-xs font-medium text-primary line-clamp-1">{item.compensation}</p>
                      )}
                       <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.location}</p>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
            ) : (
            <div className="text-center py-10 col-span-full">
                <p className="text-md text-muted-foreground">No items found matching your criteria.</p>
            </div>
            )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block space-y-6">
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
                  {isCurrentHomepage ? "Unpin Homepage" : "Pin as Homepage"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-3 pb-2">
                  {quickAccessCategories.map((cat) => {
                    if (!cat) return null; 
                    const Icon = cat.icon || Sparkles;
                    const isActive = currentCategory === cat.id;
                    return (
                      <Button
                        key={cat.id}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 text-xs",
                          isActive ? "border-primary ring-2 ring-primary" : ""
                        )}
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        <Icon className="mr-1.5 h-4 w-4" />
                        {cat.name}
                      </Button>
                    );
                  })}
                   <Button
                        key="clear-quick-cat"
                        variant={"outline"}
                        size="sm"
                        className={cn("h-9 text-xs", !currentCategory && quickAccessCategories.length > 0 && "bg-accent")}
                        onClick={() => handleCategorySelect(null)}
                      >
                        View All
                      </Button>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            <div className="mb-2 flex flex-col md:flex-row gap-4 items-center md:items-end">
              <AllCategoriesDropdown />
              <Button 
                  variant="outline" 
                  onClick={handleFetchLocation} 
                  disabled={isFetchingLocation}
                  className="h-10"
                >
                  <LocateFixed className={cn("mr-2 h-4 w-4", isFetchingLocation && "animate-pulse")} />
                  {isFetchingLocation ? "Fetching Location..." : "Use Current Location"}
              </Button>
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end w-full md:w-auto">
                <div className="relative sm:col-span-2 md:col-span-1">
                  <Label htmlFor="search-marketplace" className="sr-only">Search Marketplace</Label>
                  <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search-marketplace"
                    placeholder="Search products & services..." 
                    className="pl-10 h-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Label htmlFor="location-filter-marketplace" className="sr-only">Filter by location</Label>
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="location-filter-marketplace"
                    placeholder="Filter by location string" 
                    className="pl-10 h-10"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
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
            {locationStatus && <p className="text-sm text-muted-foreground mb-4 text-center md:text-left">{locationStatus}</p>}
            
            {aiRecommendedItems.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-1.5"><Brain className="h-5 w-5 text-primary"/>Recommended For You</h2>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex space-x-4 pb-2">
                  {isLoadingAiRecommendations ? 
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={`aiskel-desk-${i}`} className="w-52 shrink-0">
                          <Skeleton className="w-full aspect-[4/3] rounded-t-lg" />
                          <CardContent className="p-3 space-y-1.5"> <Skeleton className="h-4 w-3/4" /> <Skeleton className="h-3 w-1/2" /> <Skeleton className="h-5 w-1/3" /> </CardContent>
                          <CardFooter className="p-3 border-t"> <Skeleton className="h-8 w-full" /> </CardFooter>
                        </Card>
                    )) :
                    aiRecommendedItems.map(item => (
                      <Card key={`ai-rec-desk-${item.id}`} className="w-52 shrink-0 overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                        <Link href={`/marketplace/${item.id}`} className="block">
                          <div className="relative w-full aspect-[4/3]">
                            <Image 
                              src={item.imageUrl || "https://placehold.co/200x150.png"} 
                              alt={item.name} 
                              fill={true} sizes="25vw" style={{objectFit:"cover"}}
                              data-ai-hint={item.dataAiHint || "product agriculture"}
                            />
                          </div>
                          <div className="p-2.5">
                            <h3 className="text-xs font-medium text-foreground line-clamp-2 h-8 leading-tight">{item.name}</h3>
                            {item.listingType === 'Product' ? (
                                <p className="text-sm font-bold text-primary mt-1">
                                ${item.price?.toFixed(2) ?? 'N/A'} {item.currency}
                                {item.perUnit && <span className="text-[10px] text-muted-foreground font-normal ml-0.5">{item.perUnit}</span>}
                                </p>
                            ) : (
                                item.compensation && <p className="text-sm font-medium text-primary mt-1 line-clamp-1">{item.compensation}</p>
                            )}
                            {aiRecommendationReasons[item.id] && <p className="text-[10px] text-muted-foreground/80 italic line-clamp-2 mt-0.5 h-7" title={aiRecommendationReasons[item.id]}>✨ {aiRecommendationReasons[item.id]}</p>}
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.location}</p>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            )}


            {featuredProductsItems.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">{featuredProductsTitle}</h2>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex space-x-4 pb-2">
                    {featuredProductsItems.map(item => (
                      <Card key={`desktop-feat-prod-${item.id}`} className="w-52 shrink-0 overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                        <Link href={`/marketplace/${item.id}`} className="block">
                          <div className="relative w-full aspect-[4/3]">
                            <Image 
                              src={item.imageUrl || "https://placehold.co/200x150.png"} 
                              alt={item.name} 
                              fill={true}
                              sizes="25vw"
                              style={{objectFit:"cover"}}
                              data-ai-hint={item.dataAiHint || "product agriculture"}
                            />
                          </div>
                          <div className="p-2.5">
                            <h3 className="text-xs font-medium text-foreground line-clamp-2 h-8 leading-tight">{item.name}</h3>
                            <p className="text-sm font-bold text-primary mt-1">
                              ${item.price?.toFixed(2) ?? 'N/A'} {item.currency}
                              {item.perUnit && <span className="text-[10px] text-muted-foreground font-normal ml-0.5">{item.perUnit}</span>}
                            </p>
                             <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.location}</p>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            )}

            {featuredServicesItems.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">{featuredServicesTitle}</h2>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex space-x-4 pb-2">
                    {featuredServicesItems.map(item => (
                      <Card key={`desktop-feat-serv-${item.id}`} className="w-52 shrink-0 overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                         <Link href={`/marketplace/${item.id}`} className="block">
                          <div className="relative w-full aspect-[4/3]">
                            <Image 
                              src={item.imageUrl || "https://placehold.co/150x150.png"} 
                              alt={item.name} 
                              fill={true}
                              sizes="25vw"
                              style={{objectFit:"cover"}}
                              data-ai-hint={item.dataAiHint || "service agriculture"}
                            />
                          </div>
                          <div className="p-2.5">
                            <h3 className="text-xs font-medium text-foreground line-clamp-2 h-8 leading-tight">{item.name}</h3>
                            {item.compensation && <p className="text-sm font-medium text-primary mt-1 line-clamp-1">{item.compensation}</p>}
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.location}</p>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            )}

            <h2 className="text-xl font-semibold mb-4 mt-6">Discover More</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Conceptual: Iterate over a list of MarketplaceItem objects here */}
              {/* Replace with actual iteration over the fetched `marketplaceItems` state */}
              {/* {marketplaceItems.map(item => ( */}
              {filteredMarketplaceItems.map(item => (
                <Card key={item.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  <div className="relative w-full aspect-[4/3]">
                    <Image 
                      src={item.imageUrl || "https://placehold.co/400x300.png"} 
                      alt={item.name} 
                      fill={true}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16.6vw"
                      style={{objectFit:"cover"}}
                      data-ai-hint={item.dataAiHint || `${item.category.split('-')[0]} agricultural`}
                    />
                    {userCoordinates && (item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables') && (
                        <Badge variant="secondary" className="absolute top-2 left-2 bg-green-100 text-green-700 border-green-300 text-xs py-1 px-1.5">
                          <Sprout className="h-3 w-3 mr-1" />
                          Fresh & Nearby
                        </Badge>
                      )}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
                      <Badge variant="secondary" className="py-1 px-2 text-xs flex items-center capitalize">
                        {item.listingType === 'Product' ? <PackageIcon className="h-3 w-3 mr-1" /> : <Briefcase className="h-3 w-3 mr-1" />}
                        {item.listingType}
                      </Badge>
                      {item.isSustainable && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />Sustainable
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    {/* Conceptual: Clicking this Link navigates to the detail page */}
                    <Link href={`/marketplace/${item.id}`} className="block mb-1">
                      <h3 className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 h-10">
                        {item.name}
                         {/* Conceptual: Display AI generated quick reply for farmers - e.g. "Good price" */}
                      </h3>
                    </Link>
                    <Badge variant="outline" className="text-xs w-fit my-1 py-0.5 px-1.5 flex items-center capitalize">
                        <span className="flex items-center">{getCategoryIcon(item.category as CategoryNode['id'])} {getCategoryName(item.category as CategoryNode['id'])}</span>
                    </Badge>

                    {item.listingType === 'Product' ? (
                      <div className="flex items-center text-lg font-semibold text-primary my-1.5">
                        ${item.price?.toFixed(2) ?? 'N/A'} {item.currency}
                        {item.perUnit && <span className="text-xs text-muted-foreground ml-1.5">{item.perUnit}</span>}
                      </div>
                    ) : (
                      item.compensation && <p className="text-sm font-medium text-primary my-1.5">{item.compensation}</p>
                    )}

                    {item.aiPriceSuggestion && item.listingType === 'Product' && (
                      <div className="text-xs text-blue-600 flex items-center mt-0.5 mb-1.5"> 
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Price Est: ${item.aiPriceSuggestion.min} - ${item.aiPriceSuggestion.max} ({item.aiPriceSuggestion.confidence})
                      </div>
                    )}
                    
                    {item.sellerVerification === 'Verified' && (
                      <Badge variant="outline" className="text-xs w-fit border-green-500 text-green-600 py-0.5 px-1.5 mb-1.5">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Verified Seller
                      </Badge>
                    )}

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 h-8">
                      {item.description}
                    </p>
                    
                    {item.listingType === 'Service' && item.skillsRequired && item.skillsRequired.length > 0 && (
                      <div className="mb-2">
                          <h4 className="text-xs font-semibold mb-0.5">Skills:</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.skillsRequired.slice(0,3).map((skill: string) => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}
                          </div>
                      </div>
                    )}

                    <div className="flex items-center text-muted-foreground text-xs mt-auto pt-1">
                      <MapPin className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                  <div className="p-3 border-t mt-auto">
                    <Button asChild className="w-full h-9 text-xs" variant="outline">
                       {/* Conceptual: Button to navigate to the item detail page */}
                      <Link href={`/marketplace/${item.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            {filteredMarketplaceItems.length === 0 && (
              <div className="text-center py-10 col-span-full">
                <p className="text-lg text-muted-foreground">No items found matching your criteria.</p>
                <p className="text-sm text-muted-foreground">Broaden your search or check back for new listings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
           <CardContent>
              {/* Skeleton for Mobile */}
              <div className="md:hidden space-y-4 pb-16">
                <Skeleton className="h-10 w-full rounded-full" />
                <div className="flex space-x-3 px-2 pb-1"><Skeleton className="h-9 w-24 rounded-md" /><Skeleton className="h-9 w-24 rounded-md" /><Skeleton className="h-9 w-24 rounded-md" /></div>
                <div className="grid grid-cols-5 gap-2 px-2 text-center">{Array.from({ length: 5 }).map((_, i) => (<div key={`igs-sk-${i}`} className="flex flex-col items-center p-2"><Skeleton className="h-10 w-10 mb-1.5" /><Skeleton className="h-3 w-12" /></div>))}</div>
                <div className="px-2 space-y-2"><Skeleton className="h-6 w-1/3 mb-2" /><div className="flex space-x-3 pb-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={`fs-sk-${i}`} className="w-36 h-48 rounded-md" />)}</div></div>
                <div className="px-2 pt-2"><Skeleton className="h-6 w-1/2 mb-2" /><div className="grid grid-cols-2 gap-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={`mgs-sk-${i}`} className="h-56 rounded-lg" />)}</div></div>
              </div>
              {/* Skeleton for Desktop */}
              <div className="hidden md:block">
                <div className="mb-4"><div className="flex space-x-3 pb-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={`qaskel-dk-${i}`} className="h-9 w-28 rounded-md" />)}</div></div>
                <div className="mb-2 flex flex-col md:flex-row gap-4 items-center md:items-end"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-36" /><div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div></div>
                <Skeleton className="h-4 w-1/3 mb-4" />
                <div className="mb-6"><Skeleton className="h-6 w-1/4 mb-3" /><div className="flex space-x-4 pb-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={`fskel-dk-prod-${i}`} className="w-52 h-64 rounded-md" />)}</div></div>
                <Skeleton className="h-6 w-1/4 mb-3" /> 
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={`itemskel-dk-${i}`} className="h-72 rounded-lg" />)}</div>
              </div>
          </CardContent>
        </Card>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  )
}
    