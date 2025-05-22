
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search as SearchIconLucide, MapPin, Leaf, Briefcase, Cog, Pin, PinOff, CheckCircle, Sparkles, DollarSign, Package as PackageIcon, Users, Apple, Wheat, Sprout, Wrench, Truck, TestTube2, Tractor, CircleDollarSign, GraduationCap, DraftingCompass, Warehouse, ShieldCheck, LocateFixed, Tag, LayoutGrid, Building, Handshake, Carrot, ShoppingBag, Star, Flame, Percent } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect, Suspense } from "react";
import { Label } from "@/components/ui/label";
import { LISTING_TYPE_FILTER_OPTIONS, type ListingType } from "@/lib/constants";
import { dummyMarketplaceItems } from "@/lib/dummy-data"; 
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { useToast } from "@/hooks/use-toast";
import { AllCategoriesDropdown } from "@/components/marketplace/AllCategoriesDropdown"; 
import { AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


const QUICK_ACCESS_CATEGORIES_IDS: CategoryNode['id'][] = [
  'fresh-produce-fruits', 
  'grains-cereals',
  'seeds-seedlings',
  'farm-labor-staffing',
  'equipment-rental-operation',
  'logistics-transport',
  'consultancy-advisory',
  'technical-services',
  'storage-warehousing',
  'processing-value-addition',
  'financial-insurance',
  'training-education',
];

// Placeholder data for mobile quick links and icon grid
const mobileQuickLinks = [
  { name: "Fresh Produce", href: "/marketplace?category=fresh-produce-fruits" },
  { name: "Inputs", href: "/marketplace?category=seeds-seedlings" },
  { name: "Machinery", href: "/marketplace?category=heavy-machinery-sale" },
  { name: "Services", href: "/marketplace?listingType=Service" },
  { name: "Land", href: "/marketplace?category=land-services" },
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
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | 'All'>("All");
  const [locationFilter, setLocationFilter] = useState("");
  
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
  const { toast } = useToast();

  const marketplaceItems = dummyMarketplaceItems; // Full list for filtering

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCategorySelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null || categoryId === currentCategory) { 
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const quickAccessCategories = useMemo(() => {
    return QUICK_ACCESS_CATEGORIES_IDS.map(id => 
      AGRICULTURAL_CATEGORIES.find(cat => cat.id === id)
    ).filter(Boolean) as CategoryNode[];
  }, []);

  const handleFetchLocation = () => {
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
  };

  const filteredMarketplaceItems = useMemo(() => {
    if (!isMounted) return [];

    let items = marketplaceItems.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description.toLowerCase().includes(searchLower);
      
      const categoryPass = !currentCategory || item.category === currentCategory;
      const listingTypePass = listingTypeFilter === 'All' || item.listingType === listingTypeFilter;
      
      const locationMatch = locationFilter === "" || item.location.toLowerCase().includes(locationLower);
      
      const isSustainablePass = listingTypeFilter === "Sustainable Solutions" ? item.isSustainable : true;

      return (nameMatch || descriptionMatch) && categoryPass && listingTypePass && locationMatch && isSustainablePass;
    });

    if (userCoordinates) {
      const freshProduceItems = items.filter(
        item => item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables'
      );
      const otherItems = items.filter(
        item => !(item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables')
      );
      items = [...freshProduceItems, ...otherItems];
    }

    return items;
  }, [searchTerm, currentCategory, listingTypeFilter, locationFilter, marketplaceItems, isMounted, userCoordinates]);

  const getCategoryIcon = (category: CategoryNode['id']) => {
    const catNode = AGRICULTURAL_CATEGORIES.find(c => c.id === category);
    const IconComponent = catNode?.icon || Sparkles; 
    return <IconComponent className="h-3 w-3 mr-1 inline-block" />;
  }
  
  const getCategoryName = (categoryId: CategoryNode['id']) => {
    return AGRICULTURAL_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  }

  const isCurrentHomepage = homepagePreference === pathname;

  const handleSetHomepage = () => {
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
  };

  if (!isMounted) {
    // Skeleton for desktop view
    return (
      <div className="space-y-6 hidden md:block">
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
              <div className="flex space-x-3 pb-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={`qaskel-${index}`} className="h-9 w-28 rounded-md" />
                ))}
              </div>
            </div>
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center md:items-end">
              <Skeleton className="h-10 w-48" />
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end w-full md:w-auto">
                <Skeleton className="h-10 w-full sm:col-span-2 md:col-span-1" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, index) => (
                <Card key={`itemskel-${index}`} className="rounded-lg overflow-hidden shadow-sm flex flex-col">
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
    );
  }

  const handleMobileSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search term is already updated by onChange, filtering happens in useMemo
    console.log("Mobile search submitted with term:", searchTerm);
  };

  const featuredItems = useMemo(() => {
     // For demo, take first 6 items or items matching 'fresh-produce-fruits'
    let items = filteredMarketplaceItems.filter(item => item.category === 'fresh-produce-fruits' || item.category === 'fresh-produce-vegetables').slice(0, 6);
    if (items.length < 6) {
        items = [...items, ...filteredMarketplaceItems.filter(item => item.listingType === 'Product').slice(0, 6 - items.length)];
    }
    return items.slice(0,6);
  }, [filteredMarketplaceItems]);


  return (
    <>
      {/* Mobile View - AliExpress Inspired */}
      <div className="md:hidden space-y-4 pb-16"> {/* pb-16 for bottom nav space */}
        <form onSubmit={handleMobileSearch} className="sticky top-0 z-20 bg-background p-2 shadow-sm">
          <div className="relative">
            <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products, services..." 
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
                key={link.name}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-xs px-3 text-muted-foreground hover:text-primary",
                  currentCategory === link.href.split("=")[1] && "text-primary font-semibold"
                )}
                onClick={() => handleCategorySelect(link.href.split("=")[1] || null)}
              >
                {link.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="grid grid-cols-5 gap-1 px-2 text-center">
          {mobileIconGridItems.map((item) => (
            <Link key={item.name} href={item.href} className="flex flex-col items-center p-1.5 rounded-md hover:bg-accent">
              <div className="p-2 bg-primary/10 rounded-full mb-1">
                 <item.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-[11px] text-muted-foreground leading-tight">{item.name}</span>
            </Link>
          ))}
        </div>
        
        {/* Promotional Section Example */}
        <section className="px-2 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Top Deals</h2>
            <Link href="/marketplace?filter=deals" className="text-xs text-primary hover:underline">See All</Link>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-3 pb-2">
              {featuredItems.map(item => (
                <Card key={`feat-${item.id}`} className="w-36 shrink-0 overflow-hidden rounded-md shadow-sm">
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
                        ${item.price.toFixed(2)}
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

        {/* Main Grid for Mobile */}
        <div className="px-2 pt-2">
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
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs font-medium text-foreground line-clamp-2 h-8 leading-tight mb-0.5">
                        {item.name}
                      </h3>
                      {item.listingType === 'Product' ? (
                        <div className="text-sm font-bold text-primary">
                          ${item.price.toFixed(2)}
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
                <p className="text-md text-muted-foreground">No items found.</p>
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


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                    <Link href={`/marketplace/${item.id}`} className="block mb-1">
                      <h3 className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 h-10">
                        {item.name}
                      </h3>
                    </Link>
                    
                    <Badge variant="outline" className="text-xs w-fit my-1 py-0.5 px-1.5 flex items-center capitalize">
                      {getCategoryIcon(item.category)} {getCategoryName(item.category)}
                    </Badge>

                    {item.listingType === 'Product' ? (
                      <div className="flex items-center text-lg font-semibold text-primary my-1.5">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {item.price.toFixed(2)} {item.currency}
                        {item.perUnit && <span className="text-xs text-muted-foreground ml-1.5">{item.perUnit}</span>}
                      </div>
                    ) : (
                      item.compensation && <p className="text-sm font-medium text-primary my-1.5">{item.compensation}</p>
                    )}

                    {item.aiPriceSuggestion && item.listingType === 'Product' && (
                      <div className="text-xs text-blue-600 flex items-center mb-1.5">
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
                            {item.skillsRequired.slice(0,3).map(skill => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}
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
                      <Link href={`/marketplace/${item.id}`}>View Details</Link>
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
            <div className="mb-4">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="mb-6">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, index) => (
                <Card key={`loadskel-${index}`} className="rounded-lg overflow-hidden shadow-sm flex flex-col">
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
    }>
      <MarketplaceContent />
    </Suspense>
  )
}
