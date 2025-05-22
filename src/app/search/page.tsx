
"use client"; 

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, MessageSquare, Briefcase, Package, Truck, ShieldAlert, Brain, TrendingUp, Award, Tractor, Sparkles, Info, MapPin, DollarSign, Leaf, Eye, Filter } from 'lucide-react';
import { interpretSearchQuery, type SmartSearchInterpretation } from '@/ai/flows/query-interpreter-flow';
import { Skeleton } from '@/components/ui/skeleton';

import { 
  dummyProfiles, 
  dummyMarketplaceItems, 
  dummyForumTopics,
} from '@/lib/dummy-data';
import type { UserProfile, MarketplaceItem, ForumTopic } from '@/lib/types';
import { AGRICULTURAL_CATEGORIES } from '@/lib/category-data';


function SearchResultsComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [aiInterpretation, setAiInterpretation] = useState<SmartSearchInterpretation | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

  useEffect(() => {
    if (query) {
      const fetchInterpretation = async () => {
        setIsLoadingInterpretation(true);
        try {
          const interpretation = await interpretSearchQuery({ rawQuery: query });
          setAiInterpretation(interpretation);
        } catch (error) {
          console.error("Error fetching search interpretation:", error);
          setAiInterpretation(null); 
        }
        setIsLoadingInterpretation(false);
      };
      fetchInterpretation();
    } else {
      setAiInterpretation(null);
    }
  }, [query]);

  if (!query) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">Please enter a search term to find stakeholders, products, services, and discussions.</p>
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
    item.location.toLowerCase().includes(lowerCaseQuery) ||
    (item.listingType === 'Service' && item.skillsRequired?.some(skill => skill.toLowerCase().includes(lowerCaseQuery)))
  );

  const filteredForumTopics = dummyForumTopics.filter(topic =>
    topic.title.toLowerCase().includes(lowerCaseQuery) ||
    topic.description.toLowerCase().includes(lowerCaseQuery)
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
  
  const getCategoryName = (categoryId: string) => {
    return AGRICULTURAL_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  }

  const getMarketplaceCategoryIcon = (category: string) => {
    const catNode = AGRICULTURAL_CATEGORIES.find(c => c.id === category);
    const IconComponent = catNode?.icon || Sparkles;
    return <IconComponent className="h-3 w-3 mr-1 inline-block" />;
  }

  const totalResults = filteredProfiles.length + filteredMarketplaceItems.length + filteredForumTopics.length;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Search Results for "{query}"</CardTitle>
          {totalResults > 0 ? (
             <CardDescription>{totalResults} result(s) found.</CardDescription>
          ) : (
             <CardDescription>No results found for your query. Try a different search term or broaden your search.</CardDescription>
          )}
        </CardHeader>
        {query && (
          <CardContent>
            {isLoadingInterpretation && (
              <Card className="bg-muted/30 border-primary/20 shadow-sm p-4">
                 <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-5 w-5 text-primary animate-pulse" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                <Skeleton className="h-4 w-3/4 mb-1.5" />
                <Skeleton className="h-4 w-1/2 mb-1.5" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            )}
            {aiInterpretation && !isLoadingInterpretation && (
              <Card className="bg-accent/30 border-primary/30 shadow-sm">
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-md flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> AI Search Interpretation</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong className="font-medium">Keywords:</strong> {aiInterpretation.mainKeywords.join(', ') || 'N/A'}</p>
                  {aiInterpretation.identifiedLocation && <p><strong className="font-medium">Location:</strong> {aiInterpretation.identifiedLocation}</p>}
                  {aiInterpretation.identifiedIntent && <p><strong className="font-medium">Possible Intent:</strong> <Badge variant="secondary" className="capitalize">{aiInterpretation.identifiedIntent}</Badge></p>}
                  
                  {aiInterpretation.suggestedFilters && aiInterpretation.suggestedFilters.length > 0 && (
                    <div>
                      <strong className="font-medium flex items-center gap-1.5"><Filter size={16}/>Suggested Filters:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {aiInterpretation.suggestedFilters.map((filter, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs py-0.5 px-1.5 cursor-pointer hover:bg-primary/10" onClick={() => alert(`Filter by ${filter.type}: ${filter.value} (not implemented yet)`)}>
                            {filter.type}: {filter.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiInterpretation.interpretationNotes && <p className="text-muted-foreground italic mt-2 text-xs flex items-start gap-1.5"><Info size={14} className="mt-0.5 shrink-0"/> {aiInterpretation.interpretationNotes}</p>}
                </CardContent>
              </Card>
            )}
          </CardContent>
        )}
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
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ShoppingCart className="text-primary"/> Marketplace & Services ({filteredMarketplaceItems.length})</h2>
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
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-md line-clamp-1">{item.name}</CardTitle>
                   <div className="flex flex-wrap items-center gap-1 pt-1">
                    <Badge variant={item.listingType === 'Product' ? 'default' : 'secondary'} className="text-xs capitalize">
                        {item.listingType === 'Product' ? <Package className="h-3 w-3 mr-1" /> : <Briefcase className="h-3 w-3 mr-1" />}
                        {item.listingType}
                    </Badge>
                    <Badge variant="outline" className="text-xs flex items-center capitalize">
                      {getMarketplaceCategoryIcon(item.category)} {getCategoryName(item.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow text-xs space-y-1 pt-1">
                  <p className="text-muted-foreground line-clamp-2 h-8">{item.description}</p>
                  {item.listingType === 'Product' ? (
                    <div className="flex items-center text-primary font-semibold">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {item.price.toFixed(2)} {item.currency} {item.perUnit && <span className="text-xs text-muted-foreground ml-1">{item.perUnit}</span>}
                    </div>
                  ) : (
                    item.compensation && <p className="font-medium text-primary">{item.compensation}</p>
                  )}
                   {item.aiPriceSuggestion && item.listingType === 'Product' && (
                      <div className="text-xs text-blue-600 flex items-center mt-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Price Est: ${item.aiPriceSuggestion.min} - ${item.aiPriceSuggestion.max} ({item.aiPriceSuggestion.confidence})
                      </div>
                    )}
                  <div className="flex items-center text-muted-foreground text-xs mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {item.location}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/marketplace/${item.id}`}>View Listing</Link>
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
    </div>
  );
}


export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
           <CardContent>
            <div className="p-4 border rounded-md bg-muted/50">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
        <section>
          <Skeleton className="h-6 w-1/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length:3}).map((_,i) => <Skeleton key={`sk-prof-${i}`} className="h-36"/>)}
          </div>
        </section>
         <section>
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length:3}).map((_,i) => <Skeleton key={`sk-item-${i}`} className="h-60"/>)}
          </div>
        </section>
      </div>
    }>
      <SearchResultsComponent />
    </Suspense>
  );
}
