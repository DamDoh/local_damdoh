
"use client"; // Top-level component needs to be client for Suspense if children use hooks like useSearchParams

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, MessageSquare, ClipboardList, Briefcase, MapPin, DollarSign, Leaf, Package, Truck, ShieldAlert, Brain, TrendingUp, Award, Tractor, LandPlot, Wrench, Sparkles } from 'lucide-react';

import { 
  dummyProfiles, 
  dummyMarketplaceItems, 
  dummyForumTopics, 
  dummyTalentListings,
  dummyUsersData 
} from '@/lib/dummy-data';
import type { UserProfile, MarketplaceItem, ForumTopic, TalentListing, TalentCategory } from '@/lib/types';

function SearchResultsComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  if (!query) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">Please enter a search term to find stakeholders, products, discussions, and services.</p>
      </div>
    );
  }

  const lowerCaseQuery = query.toLowerCase();

  const filteredProfiles = dummyProfiles.filter(p => 
    p.name.toLowerCase().includes(lowerCaseQuery) ||
    p.role.toLowerCase().includes(lowerCaseQuery) ||
    (p.profileSummary && p.profileSummary.toLowerCase().includes(lowerCaseQuery)) ||
    p.location.toLowerCase().includes(lowerCaseQuery)
  );

  const filteredMarketplaceItems = dummyMarketplaceItems.filter(item =>
    item.name.toLowerCase().includes(lowerCaseQuery) ||
    item.description.toLowerCase().includes(lowerCaseQuery) ||
    item.category.toLowerCase().includes(lowerCaseQuery) ||
    item.location.toLowerCase().includes(lowerCaseQuery)
  );

  const filteredForumTopics = dummyForumTopics.filter(topic =>
    topic.title.toLowerCase().includes(lowerCaseQuery) ||
    topic.description.toLowerCase().includes(lowerCaseQuery)
  );

  const filteredTalentListings = dummyTalentListings.filter(listing =>
    listing.title.toLowerCase().includes(lowerCaseQuery) ||
    listing.description.toLowerCase().includes(lowerCaseQuery) ||
    (listing.skillsRequired && listing.skillsRequired.some(skill => skill.toLowerCase().includes(lowerCaseQuery))) ||
    listing.category.toLowerCase().includes(lowerCaseQuery) ||
    listing.location.toLowerCase().includes(lowerCaseQuery)
  );

  const getForumIcon = (iconName?: string) => {
    const iconProps = { className: "h-5 w-5 text-primary" };
    switch (iconName) {
      case 'Leaf': return <Leaf {...iconProps} />;
      case 'ShieldAlert': return <ShieldAlert {...iconProps} />;
      case 'Brain': return <Brain {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      case 'Tractor': return <Tractor {...iconProps} />;
      case 'Package': return <Package {...iconProps} />;
      case 'Truck': return <Truck {...iconProps} />;
      default: return <MessageSquare {...iconProps} />;
    }
  };

  const getTalentCategoryIcon = (category?: TalentCategory) => {
    const iconProps = {className: "h-4 w-4 mr-1"};
    switch (category) {
      case 'Jobs & Recruitment': return <Briefcase {...iconProps} />;
      case 'Land & Tenancies': return <LandPlot {...iconProps} />;
      case 'Equipment Rentals & Services': return <Wrench {...iconProps} />; 
      default: return <Sparkles {...iconProps} />;
    }
  }

  const totalResults = filteredProfiles.length + filteredMarketplaceItems.length + filteredForumTopics.length + filteredTalentListings.length;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Search Results for "{query}"</CardTitle>
          {totalResults > 0 ? (
             <CardDescription>{totalResults} result(s) found.</CardDescription>
          ) : (
             <CardDescription>No results found. Try a different search term.</CardDescription>
          )}
        </CardHeader>
      </Card>

      {filteredProfiles.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Users className="text-primary"/> Profiles ({filteredProfiles.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile: UserProfile) => (
              <Card key={profile.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile agriculture person"/>
                    <AvatarFallback>{profile.name.substring(0,1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-md">{profile.name}</CardTitle>
                    <CardDescription className="text-xs">{profile.role} - {profile.location}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-xs text-muted-foreground line-clamp-2">{profile.profileSummary}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/profiles/${profile.id}`}>View Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {filteredMarketplaceItems.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ShoppingCart className="text-primary"/> Marketplace Items ({filteredMarketplaceItems.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplaceItems.map((item: MarketplaceItem) => (
              <Card key={item.id} className="flex flex-col">
                 <div className="relative h-40 w-full">
                  <Image 
                    src={item.imageUrl || "https://placehold.co/300x200.png"} 
                    alt={item.name} 
                    fill={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{objectFit:"cover"}}
                    className="rounded-t-lg"
                    data-ai-hint={item.dataAiHint || "marketplace item agriculture"}
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md line-clamp-1">{item.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs w-fit mt-1">{item.category}</Badge>
                </CardHeader>
                <CardContent className="flex-grow text-xs space-y-1">
                  <p className="text-muted-foreground line-clamp-2 h-8">{item.description}</p>
                  <div className="flex items-center text-primary font-semibold">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {item.price.toFixed(2)} {item.currency} {item.perUnit && <span className="text-xs text-muted-foreground ml-1">{item.perUnit}</span>}
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {item.location}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/marketplace/${item.id}`}>View Item</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {filteredForumTopics.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MessageSquare className="text-primary"/> Forum Topics ({filteredForumTopics.length})</h2>
          <div className="space-y-3">
            {filteredForumTopics.map((topic: ForumTopic) => (
              <Card key={topic.id}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-accent/20 rounded-md hidden sm:block">
                       {getForumIcon(topic.icon)}
                    </div>
                    <div className="flex-grow">
                      <Link href={`/forums/${topic.id}`}>
                        <CardTitle className="text-md hover:text-primary transition-colors">{topic.title}</CardTitle>
                      </Link>
                      <CardDescription className="mt-1 text-xs line-clamp-2">{topic.description}</CardDescription>
                       <p className="text-xs text-muted-foreground mt-1">{topic.postCount} contributions</p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="ml-auto shrink-0">
                      <Link href={`/forums/${topic.id}`}>Join Discussion</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {filteredTalentListings.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ClipboardList className="text-primary"/> Services & Skills ({filteredTalentListings.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTalentListings.map((listing: TalentListing) => (
              <Card key={listing.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md line-clamp-1">{listing.title}</CardTitle>
                    <Badge variant={listing.type === 'Job' ? 'default' : 'secondary'} className="text-xs flex items-center gap-1 shrink-0">
                      {listing.type === 'Job' ? <Briefcase className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                      {listing.type}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs flex items-center gap-1 pt-1">
                     {getTalentCategoryIcon(listing.category)} {listing.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-xs space-y-1">
                  <p className="text-muted-foreground line-clamp-2 h-8">{listing.description}</p>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" /> {listing.location}
                  </div>
                  {listing.compensation && (
                    <p className="font-medium text-primary">{listing.compensation}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/talent-exchange/${listing.id}`}>View Listing</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


export default function SearchPage() {
  return (
    // Suspense is required by Next.js here because SearchResultsComponent uses useSearchParams
    // For more info: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
    <Suspense fallback={<div className="text-center py-10">Loading search results...</div>}>
      <SearchResultsComponent />
    </Suspense>
  );
}
