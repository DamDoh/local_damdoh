
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, PlusCircle, Search as SearchIconLucide, MapPin, Users } from "lucide-react"; 
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import { ItemCard } from "@/components/marketplace/ItemCard";
import { useToast } from "@/hooks/use-toast";
import { AGRICULTURAL_CATEGORIES } from "@/lib/category-data";
import { performSearch } from "@/lib/server-actions";

function TalentPageSkeleton() {
    const t = useTranslations('talentExchangePage');
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-10 w-full lg:col-span-1" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <Skeleton className="h-56 w-full" />
                        <Skeleton className="h-56 w-full" />
                        <Skeleton className="h-56 w-full" />
                        <Skeleton className="h-56 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TalentExchangePage() {
    const t = useTranslations('talentExchangePage');
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const serviceCategories = useMemo(() => AGRICULTURAL_CATEGORIES.filter(cat => cat.parent === 'services'), []);

    const fetchServices = useCallback(async () => {
      setIsLoading(true);
      const filters: { type: string, value: string }[] = [{ type: 'listingType', value: 'Service' }];
      if (categoryFilter !== 'all') {
        filters.push({ type: 'category', value: categoryFilter });
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
            listingType: 'Service',
            compensation: res.compensation,
            experienceLevel: res.experienceLevel,
            skillsRequired: res.skillsRequired,
            category: res.tags?.find((tag: string) => serviceCategories.some(sc => sc.id === tag)) || '',
            sellerId: 'unknown', // This field is not in the search index, so we default it
            createdAt: (res.createdAt as any)?.toDate ? (res.createdAt as any).toDate().toISOString() : new Date().toISOString(),
            updatedAt: (res.updatedAt as any)?.toDate ? (res.updatedAt as any).toDate().toISOString() : new Date().toISOString(),
        }));
        setItems(mappedItems);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        toast({
            variant: "destructive",
            title: t('toast.error.title'),
            description: t('toast.error.description'),
        });
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }, [searchTerm, locationFilter, categoryFilter, serviceCategories, toast, t]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    if (isLoading) {
        return <TalentPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-7 w-7 text-primary" />
                                <CardTitle className="text-2xl">{t('title')}</CardTitle>
                            </div>
                            <CardDescription>{t('description')}</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/marketplace/create?listingType=Service"><PlusCircle className="mr-2 h-4 w-4" />{t('listServiceButton')}</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div className="relative">
                            <Label htmlFor="search-talent" className="sr-only">{t('searchPlaceholder')}</Label>
                            <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="search-talent" placeholder={t('searchPlaceholder')} className="pl-10 h-10" 
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Label htmlFor="location-filter-talent" className="sr-only">{t('locationPlaceholder')}</Label>
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="location-filter-talent" placeholder={t('locationPlaceholder')} className="pl-10 h-10"
                                value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger id="category-filter-talent" className="h-10">
                                <SelectValue placeholder={t('categoryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allCategories')}</SelectItem>
                                {serviceCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <div className="flex items-center gap-2">
                                            {cat.icon && <cat.icon className="h-4 w-4 text-muted-foreground" />}
                                            <span>{cat.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {items.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {items.map(item => <ItemCard key={item.id} item={item} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">{t('noResultsTitle')}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{t('noResultsDescription')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
