
"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, PlusCircle, Search as SearchIconLucide, MapPin, Frown, Users } from "lucide-react"; 
import Link from "next/link";
import { getAllMarketplaceItemsFromDB } from "@/lib/db-utils";
import type { MarketplaceItem } from "@/lib/types";
import { TalentCard } from "@/components/marketplace/TalentCard";
import { useToast } from "@/hooks/use-toast";
import { STAKEHOLDER_ROLES } from "@/lib/constants";

function TalentPageSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-10 w-full lg:col-span-2" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    const [roleFilter, setRoleFilter] = useState("all");
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const result = await getAllMarketplaceItemsFromDB();
                setItems(Array.isArray(result) ? (result as MarketplaceItem[]) : []);
            } catch (error) {
                console.error("Failed to fetch marketplace items:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch available talent and services.",
                });
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItems();
    }, [toast]);

    const filteredServices = useMemo(() => {
        if (!Array.isArray(items)) return [];

        return items.filter(item => {
            if (!item || item.listingType !== 'Service') return false;

            const skillsArray: string[] = Array.isArray(item.skillsRequired)
                ? item.skillsRequired
                : (typeof item.skillsRequired === 'string' && item.skillsRequired)
                    ? item.skillsRequired.split(',').map(s => s.trim())
                    : [];

            const searchLower = searchTerm.toLowerCase();
            const locationLower = locationFilter.toLowerCase();

            const nameMatch = (item.name || '').toLowerCase().includes(searchLower);
            const descriptionMatch = (item.description || '').toLowerCase().includes(searchLower);
            const skillsMatch = skillsArray.join(' ').toLowerCase().includes(searchLower);
            const locationMatch = locationFilter === "" || (item.location || '').toLowerCase().includes(locationLower);
            const roleMatch = roleFilter === 'all' || (item.category && item.category.toLowerCase().includes(roleFilter.toLowerCase()));

            return (nameMatch || descriptionMatch || skillsMatch) && locationMatch && roleMatch;
        });
    }, [searchTerm, locationFilter, roleFilter, items]);


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
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="relative lg:col-span-2">
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
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger id="role-filter-talent" className="h-10">
                                <SelectValue placeholder={t('rolePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allRoles')}</SelectItem>
                                {STAKEHOLDER_ROLES.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {filteredServices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map(item => <TalentCard key={item.id} item={item} />)}
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
