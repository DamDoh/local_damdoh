
"use client";

import { useState, useEffect, FormEvent, Fragment, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, User, Search, Send, Sparkles, ShoppingCart, Users, MessageSquare, Briefcase, Building, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { performSearch as performSearchFunction } from '@/lib/search-actions';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { APP_NAME } from '@/lib/constants';

interface SearchResult {
  id: string;
  itemCollection: 'users' | 'marketplaceItems' | 'forums';
  title: string;
  description: string;
  tags?: string[];
  location?: string;
}

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const getIconForCollection = (collection: SearchResult['itemCollection']) => {
    switch(collection) {
        case 'users': return <Users className="h-4 w-4" />;
        case 'marketplaceItems': return <ShoppingCart className="h-4 w-4" />;
        case 'forums': return <MessageSquare className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
}

const getLinkForCollection = (result: SearchResult) => {
    switch(result.itemCollection) {
        case 'users': return `/profiles/${result.itemId}`;
        case 'marketplaceItems': return `/marketplace/${result.itemId}`;
        case 'forums': return `/forums/${result.itemId}`;
        default: return '#';
    }
}

export function UniversalSearchModal({ isOpen, onClose, initialQuery = "" }: UniversalSearchModalProps) {
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuerySubmit = useCallback(async (queryToSubmit: string) => {
    if (!queryToSubmit.trim() || isLoading) return;
    
    setIsLoading(true);
    setSearchResults([]);
    
    try {
      const results = await performSearchFunction(queryToSubmit);
      setSearchResults(results as SearchResult[]);
    } catch (error: any) {
      console.error("Error in universal search:", error);
      toast({
          title: "Search Error",
          description: error.message || "Could not perform the search. Please try again.",
          variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, toast]);


  useEffect(() => {
    if (isOpen && initialQuery) {
      setCurrentQuery(initialQuery);
      handleQuerySubmit(initialQuery);
    } else if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setCurrentQuery("");
        setSearchResults([]);
        setIsLoading(false);
      }, 300); // Delay to allow fade-out animation
    }
  }, [isOpen, initialQuery, handleQuerySubmit]);

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleQuerySubmit(currentQuery);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className='p-4 border-b'>
          <DialogTitle className='flex items-center gap-2'><Sparkles className="h-5 w-5 text-primary" /> Universal Search</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b bg-background/80">
          <form onSubmit={handleSubmitForm} className="flex items-center gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search for people, products, services, or topics..."
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  className="h-11 text-base pl-10"
                  disabled={isLoading}
                  autoFocus
                />
            </div>
            <Button type="submit" disabled={isLoading || !currentQuery.trim()} size="lg">
              {isLoading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              Search
            </Button>
          </form>
        </div>

        <ScrollArea className="flex-grow">
          <div className='p-4 space-y-3'>
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="space-y-1.5 flex-grow">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                ))
            ) : searchResults.length > 0 ? (
                searchResults.map(result => (
                  <Link href={getLinkForCollection(result)} key={result.id} onClick={onClose} className="block">
                    <Card className="hover:border-primary/50 hover:bg-accent/50 transition-colors">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">{getIconForCollection(result.itemCollection)}</div>
                        <div className='flex-grow overflow-hidden'>
                            <p className='font-semibold truncate'>{result.title}</p>
                            <p className='text-xs text-muted-foreground truncate'>{result.description}</p>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                                <Badge variant="secondary" className="text-xs capitalize">{result.itemCollection.replace('Items', '')}</Badge>
                                {result.tags?.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
            ) : (
                <div className='flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16'>
                    <Search className="h-12 w-12 mb-4"/>
                    <p>Search for anything across the {APP_NAME} platform.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
