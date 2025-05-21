
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, PlusCircle, Search, Tag, LocateFixed, DollarSign, MapPin, Tractor, Sprout, Package, Truck, Building, Leaf, ShoppingBag, Banknote, Cog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";

export type MarketplaceCategory = 'Agricultural Produce' | 'Inputs & Supplies' | 'Machinery & Business Services';

const marketplaceCategories: Array<{ value: MarketplaceCategory | 'All', label: string }> = [
  { value: 'All', label: 'All Categories' },
  { value: 'Agricultural Produce', label: 'Agricultural Produce' },
  { value: 'Inputs & Supplies', label: 'Inputs & Supplies' },
  { value: 'Machinery & Business Services', label: 'Machinery & Business Services' },
];

// Dummy data for marketplace items - agriculture supply chain focus
const marketplaceItems: MarketplaceItem[] = [
  { id: 'item1', name: 'Bulk Organic Quinoa (10 Tons)', description: 'High-altitude, Fair Trade certified organic quinoa from Peru. Ready for export. Seeking direct buyers or processors.', price: 3200, currency: 'USD', perUnit: '/ton', sellerId: 'quinoaCoopPeru', category: 'Agricultural Produce', location: 'Andes Region, Peru', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), contactInfo: 'Contact via DamDoh platform.', dataAiHint: "quinoa grains" },
  { id: 'item2', name: 'Refrigerated Trucking Services (Cross-Border)', description: 'Reliable cold chain logistics for perishable goods. Servicing US-Canada-Mexico routes. GPS tracked, temp-controlled fleet.', price: 0.85, currency: 'USD', perUnit: '/mile (estimate)', sellerId: 'coolHaulLogistics', category: 'Machinery & Business Services', location: 'Servicing North America', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 172800000).toISOString(), contactInfo: 'Request quote via profile.', dataAiHint: "truck logistics" },
  { id: 'item3', name: 'Certified Organic Fertilizer (NPK 5-3-2)', description: 'Bulk supply of OMRI listed organic fertilizer. Ideal for vegetable and fruit crops. Pelletized for easy application.', price: 650, currency: 'USD', perUnit: '/ton', sellerId: 'ecoGrowInputs', category: 'Inputs & Supplies', location: 'Global Shipping', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 259200000).toISOString(), contactInfo: 'inquiries@ecogrow.com', dataAiHint: "fertilizer bag" },
  { id: 'item4', name: 'Mobile Seed Cleaning & Sorting Unit', description: 'High-capacity mobile seed cleaning and optical sorting machine for sale. Gently used, excellent condition. Improves seed quality and reduces waste.', price: 45000, currency: 'USD', perUnit: 'unit', sellerId: 'seedTechResale', category: 'Machinery & Business Services', location: 'Midwest, USA', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 604800000).toISOString(), contactInfo: 'Book via platform.', dataAiHint: "seed cleaning machine" },
  { id: 'item5', name: 'Fresh Harvested Tomatoes (500kg)', description: 'Vine-ripened Roma tomatoes, perfect for processing or fresh market. Sustainably grown. Available for immediate pickup.', price: 1.20, currency: 'USD', perUnit: '/kg', sellerId: 'sunnyAcresFarm', category: 'Agricultural Produce', location: 'Local Farm Region, CA', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), contactInfo: 'Contact for viewing.', dataAiHint: "tomatoes harvest" },
  { id: 'item6', name: 'Agricultural Business Plan Consulting', description: 'Expert consulting for developing bankable business plans, feasibility studies, and grant proposals for agribusinesses.', price: 150, currency: 'USD', perUnit: '/hour', sellerId: 'agriPlanExperts', category: 'Machinery & Business Services', location: 'Remote', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), contactInfo: 'info@agriplan.com', dataAiHint: "business meeting" },
];


export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MarketplaceCategory | 'All'>("All");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredMarketplaceItems = useMemo(() => {
    return marketplaceItems.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description.toLowerCase().includes(searchLower);
      const categoryMatch = categoryFilter === 'All' || item.category === categoryFilter;
      const locationMatch = locationFilter === "" || item.location.toLowerCase().includes(locationLower);
      
      return (nameMatch || descriptionMatch) && categoryMatch && locationMatch;
    });
  }, [searchTerm, categoryFilter, locationFilter]);

  const getCategoryIcon = (category: MarketplaceCategory) => {
    const iconProps = {className: "h-4 w-4 mr-1 inline-block"};
    switch (category) {
      case 'Agricultural Produce': return <Leaf {...iconProps} />;
      case 'Inputs & Supplies': return <ShoppingBag {...iconProps} />;
      case 'Machinery & Business Services': return <Cog {...iconProps} />; // Or Banknote, Tractor
      default: return <Tag {...iconProps} />;
    }
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Agricultural Supply Chain Marketplace</CardTitle>
              <CardDescription>Source products, equipment, and services or list your offerings to the agri-food community.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/marketplace/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Listing
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="relative lg:col-span-1">
              <Label htmlFor="search-marketplace" className="sr-only">Search Marketplace</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-marketplace"
                placeholder="Search (e.g., 'coffee beans', 'cold storage')" 
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
                placeholder="Filter by location (e.g., port city, region)" 
                className="pl-10"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as MarketplaceCategory | 'All')}>
              <SelectTrigger id="category-filter-marketplace">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {marketplaceCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
                    fill={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{objectFit:"cover"}}
                    data-ai-hint={item.dataAiHint || `${item.category.split(' ')[0].toLowerCase()} agricultural`}
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
                    {item.price.toFixed(2)} {item.currency} {item.perUnit && <span className="text-xs text-muted-foreground ml-1">{item.perUnit}</span>}
                  </div>
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
