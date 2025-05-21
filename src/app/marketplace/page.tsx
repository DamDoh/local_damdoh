import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, PlusCircle, Search, Tag, LocateFixed, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Dummy data for marketplace items - replace with actual data fetching
const marketplaceItems: MarketplaceItem[] = [
  { id: 'item1', name: 'Organic Tomatoes (Bulk)', description: 'Freshly harvested, vine-ripened organic tomatoes. Perfect for sauces or direct sale. Min order 50kg.', price: 2.50, currency: 'USD', sellerId: 'user1', category: 'Produce', location: 'Green Valley, CA', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 86400000).toISOString(), contactInfo: 'Contact seller via platform.' },
  { id: 'item2', name: 'Used Tractor - John Deere 5075E', description: 'Well-maintained John Deere 5075E tractor. 1200 hours. All services up to date. Great for small to medium farms.', price: 25000, currency: 'USD', sellerId: 'user2', category: 'Equipment', location: 'Central City, TX', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 172800000).toISOString(), contactInfo: 'Call 555-1234' },
  { id: 'item3', name: 'Non-GMO Corn Seeds (10kg bags)', description: 'High-yield, drought-resistant non-GMO corn seeds. Suitable for various climates.', price: 75, currency: 'USD', sellerId: 'user3', category: 'Seeds', location: 'Plainsville, NE', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 259200000).toISOString(), contactInfo: 'Email seeds@example.com' },
  { id: 'item4', name: 'Artisanal Honey (Raw & Unfiltered)', description: '100% pure, raw, and unfiltered honey from local wildflowers. Available in 1kg jars.', price: 15, currency: 'USD', sellerId: 'user4', category: 'Artisanal Products', location: 'Mountain View, CO', imageUrl: 'https://placehold.co/300x200.png', createdAt: new Date(Date.now() - 604800000).toISOString(), contactInfo: 'DM for orders' },
];

const categories = ['All', 'Produce', 'Equipment', 'Seeds', 'Livestock', 'Services', 'Artisanal Products'];

export default function MarketplacePage() {
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
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search marketplace..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More Filters</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketplaceItems.map(item => (
              <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 rounded-lg">
                <div className="relative h-48 w-full">
                  <Image src={item.imageUrl || "https://placehold.co/300x200.png"} alt={item.name} layout="fill" objectFit="cover" data-ai-hint="market product agriculture" />
                  <Badge variant="secondary" className="absolute top-2 right-2">{item.category}</Badge>
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
          {marketplaceItems.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No items found in the marketplace.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </CardContent>
        {/* Pagination could go here */}
      </Card>
    </div>
  );
}
