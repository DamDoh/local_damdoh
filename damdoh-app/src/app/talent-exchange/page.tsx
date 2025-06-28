
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { Briefcase, MapPin, Search, PlusCircle, Wrench, CircleDollarSign, CheckCircle, Clock } from 'lucide-react';
import type { MarketplaceItem } from '@/lib/types';
import { getAllMarketplaceItemsFromDB } from '@/lib/db-utils'; 
import { Input } from '@/components/ui/input';

function JobCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}

export default function TalentExchangePage() {
  const [listings, setListings] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const allItems = await getAllMarketplaceItemsFromDB();
        // Filter for only 'Service' type listings to act as our job board
        const serviceListings = allItems.filter(item => item.listingType === 'Service');
        setListings(serviceListings);
      } catch (error) {
        console.error("Failed to fetch service listings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter(listing =>
      listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (listing.skillsRequired && listing.skillsRequired.join(' ').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [listings, searchTerm]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-7 w-7 text-primary" />
                <CardTitle className="text-2xl">Talent Exchange</CardTitle>
              </div>
              <CardDescription>Find agricultural jobs, offer your professional services, and connect with skilled talent.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/marketplace/create?type=Service">
                <PlusCircle className="mr-2 h-4 w-4" /> Post a Job or Service
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for jobs or services (e.g., 'agronomist', 'tractor operator', 'kenya')" 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
              ) : filteredListings.length > 0 ? (
                filteredListings.map(job => (
                  <Card key={job.id} className="flex flex-col">
                    <CardHeader>
                      <Link href={`/marketplace/${job.id}`}>
                        <CardTitle className="text-lg hover:text-primary transition-colors">{job.name}</CardTitle>
                      </Link>
                      <CardDescription className="flex items-center gap-2 text-sm pt-1">
                        <MapPin className="h-4 w-4" />{job.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired?.slice(0, 3).map(skill => <div key={skill} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md flex items-center gap-1"><Wrench className="h-3 w-3"/>{skill}</div>)}
                      </div>
                       <div className="space-y-1.5 pt-2">
                        {job.compensation && <p className="text-sm font-medium flex items-center gap-1.5"><CircleDollarSign className="h-4 w-4 text-green-600"/>{job.compensation}</p>}
                        {job.experienceLevel && <p className="text-sm font-medium flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-blue-600"/>{job.experienceLevel}</p>}
                        {job.serviceAvailability && <p className="text-sm font-medium flex items-center gap-1.5"><Clock className="h-4 w-4 text-orange-600"/>{job.serviceAvailability}</p>}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/marketplace/${job.id}`}>View & Apply</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <p className="text-lg text-muted-foreground">No jobs or services found.</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search terms or be the first to post a service!</p>
                </div>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
