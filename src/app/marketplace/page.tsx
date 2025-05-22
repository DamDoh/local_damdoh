
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem, MarketplaceCategory } from "@/lib/types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Tag, LocateFixed, DollarSign, MapPin, Cog, Leaf, ShoppingBag, Pin, PinOff, CheckCircle, Sparkles, ShieldCheck, TrendingUp } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { MARKETPLACE_FILTER_OPTIONS, type MarketplaceCategoryType } from "@/lib/constants";
import { dummyMarketplaceItems } from "@/lib/dummy-data"; 
import { usePathname } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { useToast } from "@/hooks/use-toast";


export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MarketplaceCategoryType | 'All' | 'Sustainable Solutions'>("All");
  const [locationFilter, setLocationFilter] = useState("");
  
  const pathname = usePathname();
  const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
  const { toast } = useToast();

  const marketplaceItems = dummyMarketplaceItems;

  const filteredMarketplaceItems = useMemo(() => {
    return marketplaceItems.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description.toLowerCase().includes(searchLower);
      
      let categoryPass = false;
      if (categoryFilter === 'All') {
        categoryPass = true;
      } else if (categoryFilter === 'Sustainable Solutions') {
        categoryPass = item.isSustainable === true;
      } else {
        categoryPass = item.category === categoryFilter;
      }
      
      const locationMatch = locationFilter === "" || item.location.toLowerCase().includes(locationLower);
      
      return (nameMatch || descriptionMatch) && categoryPass && locationMatch;
    });
  }, [searchTerm, categoryFilter, locationFilter, marketplaceItems]);

  const getCategoryIcon = (category: MarketplaceCategory) => {
    const iconProps = {className: "h-4 w-4 mr-1 inline-block"};
    switch (category) {
      case 'Agricultural Produce': return <Leaf {...iconProps} />;
      case 'Inputs & Supplies': return <ShoppingBag {...iconProps} />;
      case 'Machinery & Business Services': return <Cog {...iconProps} />;
      default: return <Tag {...iconProps} />;
    }
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
              <CardTitle className="text-2xl">AI-Powered Agricultural Trade Hub</CardTitle>
              <CardDescription>Source products, inputs, machinery, and services. Connect with farmers, traders, and suppliers globally for smart, sustainable trade.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="relative lg:col-span-1">
              <Label htmlFor="search-marketplace" className="sr-only">Search Marketplace</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-marketplace"
                placeholder="Search (e.g., 'organic coffee', 'cold storage', 'tractors')" 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Label htmlFor="location-filter-marketplace" className="sr-only">Filter by location</Label>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location-filter-marketplace"
                placeholder="Filter by location (e.g., port city, region, 'global')" 
                className="pl-10"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as MarketplaceCategoryType | 'All' | 'Sustainable Solutions')}>
              <SelectTrigger id="category-filter-marketplace">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {MARKETPLACE_FILTER_OPTIONS.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Placeholder for AI Product Recommendations - to be built out later */}
          {/* <div className="mb-8 p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
            <h3 className="text-lg font-semibold text-primary mb-2 flex items-center"><Sparkles className="mr-2 h-5 w-5" /> AI Recommended For You</h3>
            <p className="text-sm text-muted-foreground">Based on your activity and preferences, you might be interested in...</p>
             (Future: Map through AI recommended products here) 
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMarketplaceItems.map(item => (
              <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 rounded-lg">
                <div className="relative h-48 w-full">
                  <Image 
                    src={item.imageUrl || "https://placehold.co/300x200.png"} 
                    alt={item.name} 
                    fill={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{objectFit:"cover"}}
                    data-ai-hint={item.dataAiHint || `${item.category.split(' ')[0].toLowerCase()} agricultural`}
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <Badge variant="secondary" className="flex items-center">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </Badge>
                    {item.isSustainable && (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />Sustainable
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <Link href={`/marketplace/${item.id}`}>
                    <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-1">{item.name}</CardTitle>
                  </Link>
                  {item.sellerVerification === 'Verified' && (
                     <Badge variant="outline" className="text-xs w-fit border-green-500 text-green-600">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Verified Seller
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <p className="text-muted-foreground line-clamp-2 h-10">{item.description}</p>
                  <div className="flex items-center text-primary font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {item.price.toFixed(2)} {item.currency} {item.perUnit && <span className="text-xs text-muted-foreground ml-1">{item.perUnit}</span>}
                  </div>
                  {item.aiPriceSuggestion && (
                    <div className="text-xs text-blue-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      AI Price Est: ${item.aiPriceSuggestion.min} - ${item.aiPriceSuggestion.max} ({item.aiPriceSuggestion.confidence})
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground text-xs">
                    <LocateFixed className="h-3 w-3 mr-1" />
                    {item.location}
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Button asChild className="w-full">
                    <Link href={`/marketplace/${item.id}`}>View Details & Contact</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredMarketplaceItems.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No items found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Broaden your search or check back for new listings.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
