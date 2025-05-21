
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { TalentListing, TalentCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Briefcase, MapPin, CalendarDays, Sparkles, HardHat, Tractor, Users, Leaf, LandPlot, Wrench, Pin } from "lucide-react"; 
import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { TALENT_FILTER_OPTIONS, TALENT_LISTING_TYPE_FILTER_OPTIONS, type TalentListingType } from "@/lib/constants";
import { dummyTalentListings, dummyUsersData } from "@/lib/dummy-data"; 
import { usePathname } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { useToast } from "@/hooks/use-toast";


export default function TalentExchangePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TalentCategory | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<TalentListingType | 'All'>("All"); 

  const talentListings = dummyTalentListings;

  const pathname = usePathname();
  const { setHomepagePreference, homepagePreference } = useHomepagePreference();
  const { toast } = useToast();

  const filteredTalentListings = useMemo(() => {
    return talentListings.filter(listing => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = listing.title.toLowerCase().includes(searchLower);
      const descriptionMatch = listing.description.toLowerCase().includes(searchLower);
      const skillsMatch = listing.skillsRequired?.some(skill => skill.toLowerCase().includes(searchLower));

      const categoryPass = categoryFilter === 'All' || listing.category === categoryFilter;
      const typePass = typeFilter === 'All' || listing.type === typeFilter;
      
      return (nameMatch || descriptionMatch || skillsMatch) && categoryPass && typePass;
    });
  }, [searchTerm, categoryFilter, typeFilter, talentListings]);

  const getCategoryIcon = (category?: TalentCategory) => {
    const iconProps = {className: "h-3 w-3 mr-1"};
    switch (category) {
      case 'Jobs & Recruitment': return <Briefcase {...iconProps} />;
      case 'Land & Tenancies': return <LandPlot {...iconProps} />;
      case 'Equipment Rentals & Services': return <Wrench {...iconProps} />; 
      default: return <Sparkles {...iconProps} />;
    }
  }

  const handleSetHomepage = () => {
    setHomepagePreference(pathname);
    toast({
      title: "Homepage Set!",
      description: "Talent Exchange is now your default homepage.",
    });
  };

  const isCurrentHomepage = homepagePreference === pathname;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Agri-Talent & Services Exchange</CardTitle>
              <CardDescription>Discover jobs, land, equipment rentals, and specialized services across the agricultural supply chain.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild>
                <Link href="/talent-exchange/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> Offer Job / List Service
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSetHomepage} disabled={isCurrentHomepage}>
                <Pin className="mr-2 h-4 w-4" /> {isCurrentHomepage ? "Homepage Pinned" : "Set as Homepage"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Label htmlFor="search-talent" className="sr-only">Search Talent Exchange</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-talent"
                placeholder="Search (e.g., 'agronomist', 'land for lease', 'drone')" 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TalentCategory | 'All')}>
              <SelectTrigger id="category-filter-talent">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {TALENT_FILTER_OPTIONS.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TalentListingType | 'All')}>
              <SelectTrigger id="type-filter-talent">
                <SelectValue placeholder="Filter by Listing Type (Job/Service)" />
              </SelectTrigger>
              <SelectContent>
                {TALENT_LISTING_TYPE_FILTER_OPTIONS.map(typeOpt => (
                  <SelectItem key={typeOpt.value} value={typeOpt.value}>{typeOpt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTalentListings.map(listing => (
              <Card key={listing.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Link href={`/talent-exchange/${listing.id}`}>
                      <CardTitle className="text-lg hover:text-primary transition-colors">{listing.title}</CardTitle>
                    </Link>
                    <Badge variant={listing.type === 'Job' ? 'default' : 'secondary'} className="flex items-center gap-1 shrink-0">
                      {listing.type === 'Job' ? <Briefcase className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                      {listing.type}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground gap-1 pt-1">
                    {getCategoryIcon(listing.category)} {listing.category}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-1 pt-1">
                    <Users className="h-4 w-4" />
                    <span>Listed by: <Link href={`/profiles/${listing.listerId}`} className="text-primary hover:underline">{dummyUsersData[listing.listerId]?.name || listing.listerId}</Link></span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" /> {listing.location}
                  </div>
                  {listing.compensation && (
                    <p className="text-sm font-medium text-primary">{listing.compensation}</p>
                  )}
                  {listing.skillsRequired && listing.skillsRequired.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold mb-1">Key Skills/Expertise:</h4>
                      <div className="flex flex-wrap gap-1">
                        {listing.skillsRequired.map(skill => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Posted: {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/talent-exchange/${listing.id}`}>View Details & Connect</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredTalentListings.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No talent listings found.</p>
              <p className="text-sm text-muted-foreground">Adjust filters or be the first to list an opportunity or service.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
