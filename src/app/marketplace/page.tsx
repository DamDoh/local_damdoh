
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, PlusCircle, Search, Tag, LocateFixed, DollarSign, MapPin, Tractor, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";

// Dummy data for marketplace items - replace with actual data fetching
const marketplaceItems: MarketplaceItem[] = [
  { id: 'item1', name: 'Organic Roma Tomatoes (50kg Crate)', description: 'Freshly harvested, vine-ripened organic Roma tomatoes. Perfect for sauces or direct sale. Grown sustainably.', price: 2.50, currency: 'USD', sellerId: 'farmerAlice', category: 'Fresh Produce', location: 'Green Valley, CA', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000).toISOString(), contactInfo: 'Contact seller via platform.' },
  { id: 'item2', name: 'Used Tractor - Massey Ferguson 4707', description: 'Well-maintained Massey Ferguson 4707 tractor. 1500 hours. Ideal for small to medium farms, includes loader.', price: 28000, currency: 'USD', sellerId: 'farmEquipDealer', category: 'Farm Equipment', location: 'Central Plains, TX', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 172800000).toISOString(), contactInfo: 'Call 555-AGRO-EQUIP' },
  { id: 'item3', name: 'Non-GMO Hybrid Corn Seed (20kg bags)', description: 'High-yield, drought-resistant non-GMO hybrid corn seeds. Proven performance in various climates.', price: 85, currency: 'USD', sellerId: 'seedSupplierBob', category: 'Seeds & Seedlings', location: 'Plainsville, NE', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 259200000).toISOString(), contactInfo: 'Email seeds@harvestco.com' },
  { id: 'item4', name: 'Artisanal Raw Honey (Wildflower)', description: '100% pure, raw, and unfiltered honey from local wildflowers. Available in 1kg jars. Supports local pollinators.', price: 15, currency: 'USD', sellerId: 'beekeeperBen', category: 'Artisanal Farm Products', location: 'Mountain View Apiaries, CO', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 604800000).toISOString(), contactInfo: 'DM for local pickup/shipping' },
  { id: 'item5', name: 'Organic Chicken Feed (Soy-Free)', description: 'Premium soy-free organic chicken feed. Milled locally. 25kg bags. Promotes healthy egg production.', price: 30, currency: 'USD', sellerId: 'feedMillFrank', category: 'Livestock Supplies', location: 'Rural Route, GA', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), contactInfo: 'Order online at franksfeed.com' },
];

const categories = ['All', 'Fresh Produce', 'Farm Equipment', 'Seeds & Seedlings', 'Livestock Supplies', 'Artisanal Farm Products', 'Farm Services'];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredMarketplaceItems = useMemo(() => {
    return marketplaceItems.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description.toLowerCase().includes(searchLower);
      const categoryMatch = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
      const locationMatch = locationFilter === "" || item.location.toLowerCase().includes(locationLower);
      
      return (nameMatch || descriptionMatch) && categoryMatch && locationMatch;
    });
  }, [searchTerm, categoryFilter, locationFilter]);

  const getCategoryIcon = (category: string) => {
    if (category.includes('Produce')) return <Sprout className="h-4 w-4 mr-1 inline-block text-green-600" />;
    if (category.includes('Equipment')) return <Tractor className="h-4 w-4 mr-1 inline-block text-red-600" />;
    if (category.includes('Seed')) return <Tag className="h-4 w-4 mr-1 inline-block text-yellow-600" />; // Placeholder, better icon needed
    return <Tag className="h-4 w-4 mr-1 inline-block text-gray-500" />;
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Marketplace</CardTitle>
              <CardDescription>Buy and sell agricultural products, equipment, and services within the community.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/marketplace/create">
                <PlusCircle className="mr-2 h-4 w-4" /> List New Item
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative lg:col-span-2">
              <Label htmlFor="search-marketplace" className="sr-only">Search Marketplace</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-marketplace"
                placeholder="Search for produce, equipment, seeds..." 
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
                placeholder="Filter by location (e.g., state, city)" 
                className="pl-10"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter-marketplace">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMarketplaceItems.map(item => (
              <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 rounded-lg">
                <div className="relative h-48 w-full">
                  <Image 
                    src={item.imageUrl || "https://placehold.co/300x200.png"} 
                    alt={item.name} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={`${item.category.split(' ')[0].toLowerCase()} agriculture`}
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2 flex items-center">
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <Link href={`/marketplace/${item.id}`}>
                    <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-1">{item.name}</CardTitle>
                  </Link>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <p className="text-muted-foreground line-clamp-2 h-10">{item.description}</p>
                  <div className="flex items-center text-primary font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {item.price.toFixed(2)} {item.currency}
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs">
                    <LocateFixed className="h-3 w-3 mr-1" />
                    {item.location}
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Button asChild className="w-full">
                    <Link href={`/marketplace/${item.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredMarketplaceItems.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No items found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </CardContent>
        {/* Pagination could go here */}
      </Card>
    </div>
  );
}
