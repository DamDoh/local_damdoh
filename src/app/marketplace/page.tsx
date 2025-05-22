
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, MapPin, Leaf, Briefcase, LandPlot, Cog, Pin, PinOff, CheckCircle, Sparkles, ShieldCheck, TrendingUp, DollarSign, Package as PackageIcon, Tractor } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect, Suspense } from "react";
import { Label } from "@/components/ui/label";
import { LISTING_TYPE_FILTER_OPTIONS, type ListingType } from "@/lib/constants";
import { dummyMarketplaceItems } from "@/lib/dummy-data"; 
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { useToast } from "@/hooks/use-toast";
// import { CategoryNavigation } from "@/components/marketplace/CategoryNavigation"; // Removed
import { AllCategoriesDropdown } from "@/components/marketplace/AllCategoriesDropdown"; // Added
import { AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";


function MarketplaceContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | 'All'>("All");
  const [locationFilter, setLocationFilter] = useState("");
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
  const { toast } = useToast();

  const marketplaceItems = dummyMarketplaceItems;

  const handleCategorySelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null || categoryId === currentCategory) { 
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };


  useEffect(() => {
    // Optional: Sync categoryQuery from URL to a local state if needed
  }, [currentCategory]);

  const filteredMarketplaceItems = useMemo(() => {
    return marketplaceItems.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description.toLowerCase().includes(searchLower);
      
      const categoryPass = !currentCategory || item.category === currentCategory;
      const listingTypePass = listingTypeFilter === 'All' || item.listingType === listingTypeFilter;
      
      const locationMatch = locationFilter === "" || item.location.toLowerCase().includes(locationLower);
      
      return (nameMatch || descriptionMatch) && categoryPass && listingTypePass && locationMatch;
    });
  }, [searchTerm, currentCategory, listingTypeFilter, locationFilter, marketplaceItems]);

  const getCategoryIcon = (category: CategoryNode['id']) => {
    const catNode = AGRICULTURAL_CATEGORIES.find(c => c.id === category);
    const Icon = catNode?.icon || Sparkles;
    return <Icon className="h-3 w-3 mr-1 inline-block" />;
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
                {isCurrentHomepage ? "Unpin Homepage" : "Pin as Homepage"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* New Filter Bar */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center md:items-end">
            <AllCategoriesDropdown />
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end w-full md:w-auto">
              <div className="relative sm:col-span-2 md:col-span-1">
                <Label htmlFor="search-marketplace" className="sr-only">Search Marketplace</Label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  placeholder="Filter by location" 
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMarketplaceItems.map(item => (
              <Card key={item.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col">
                <div className="relative w-full aspect-[4/3]">
                  <Image 
                    src={item.imageUrl || "https://placehold.co/400x300.png"} 
                    alt={item.name} 
                    fill={true}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{objectFit:"cover"}}
                    data-ai-hint={item.dataAiHint || `${item.category.split('-')[0]} agricultural`}
                  />
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
                      <TrendingUp className="h-3 w-3 mr-1" />
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
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div>Loading marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  )
}
