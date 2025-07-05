

"use client";

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, ShoppingCart, Users, MessageSquare, FileText, Loader2, ArrowRight, QrCode } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { interpretSearchQuery, type SmartSearchInterpretation } from '@/ai/flows/query-interpreter-flow';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { APP_NAME } from '@/lib/constants';
import { Card, CardContent } from '../ui/card';
import { performSearch } from '@/lib/db-utils';
import { QrScanner } from '../QrScanner';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  itemId: string;
  itemCollection: 'users' | 'marketplaceItems' | 'forums' | 'agri_events' | 'knowledge_articles';
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  location?: string;
}

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const getIconForCollection = (collection: SearchResult['itemCollection']) => {
    const props = { className: "h-5 w-5 text-muted-foreground" };
    switch(collection) {
        case 'users': return <Users {...props} />;
        case 'marketplaceItems': return <ShoppingCart {...props} />;
        case 'forums': return <MessageSquare {...props} />;
        default: return <FileText {...props} />;
    }
}

const getLinkForCollection = (result: SearchResult) => {
    switch(result.itemCollection) {
        case 'users': return `/profiles/${result.itemId}`;
        case 'marketplaceItems': return `/marketplace/${result.itemId}`;
        case 'forums': return `/forums/${result.itemId}`; // Adjust if topic/post needs different URL structure
        case 'agri_events': return `/agri-events/${result.itemId}`;
        case 'knowledge_articles': return `/blog/${result.itemId}`;
        default: return '#';
    }
}

export function UniversalSearchModal({ isOpen, onClose, initialQuery = "" }: UniversalSearchModalProps) {
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<SmartSearchInterpretation | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [isScanning, setIsScanning] = useState(false);
  const getUniversalIdDataCallable = httpsCallable(functions, 'getUniversalIdData');

  const handleQuerySubmit = useCallback(async (queryToSubmit: string) => {
    if (!queryToSubmit.trim() || isLoading) return;
    
    setIsLoading(true);
    setSearchResults([]);
    setAiInterpretation(null);
    
    try {
        const interpretation = await interpretSearchQuery({ rawQuery: queryToSubmit });
        setAiInterpretation(interpretation);
        const results = await performSearch(interpretation);
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
      setTimeout(() => {
        setCurrentQuery("");
        setSearchResults([]);
        setIsLoading(false);
        setAiInterpretation(null);
        setIsScanning(false);
      }, 300);
    }
  }, [isOpen, initialQuery, handleQuerySubmit]);

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleQuerySubmit(currentQuery);
  }

  const handleScanSuccess = async (decodedText: string) => {
      setIsScanning(false);
      setIsLoading(true);
      try {
        if (!decodedText.startsWith('damdoh:user?id=')) {
          throw new Error("Invalid DamDoh Universal ID code.");
        }
        const scannedUniversalId = decodedText.split('damdoh:user?id=')[1];
        if (!scannedUniversalId) {
           throw new Error("QR Code is malformed.");
        }
        const result = await getUniversalIdDataCallable({ scannedUniversalId });
        const profile = result.data as UserProfile;
        if (profile && profile.uid) {
            onClose(); // Close the modal
            router.push(`/profiles/${profile.uid}`); // Navigate to the profile
        } else {
            throw new Error("Could not find a user for the scanned ID.");
        }
      } catch (error: any) {
         toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
  };

  const handleScanFailure = (error: string) => {
      setIsScanning(false);
      toast({ title: "Scan Error", description: "Could not read the QR code.", variant: "destructive"});
  };

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
             <Button type="button" variant="outline" size="lg" onClick={() => setIsScanning(true)} disabled={isLoading}>
                <QrCode className="h-5 w-5" />
            </Button>
            <Button type="submit" disabled={isLoading || !currentQuery.trim()} size="lg">
              {isLoading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              Search
            </Button>
          </form>
        </div>
        
        {isScanning && <QrScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} onClose={() => setIsScanning(false)} />}

        <ScrollArea className="flex-grow">
          <div className='p-4 space-y-3'>
             {aiInterpretation && aiInterpretation.suggestedFilters && Array.isArray(aiInterpretation.suggestedFilters) && aiInterpretation.suggestedFilters.length > 0 && (
                 <div className="p-3 text-xs text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                    <p><strong>AI interpretation:</strong> {aiInterpretation.interpretationNotes}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                        <strong>Filters:</strong>
                        {aiInterpretation.suggestedFilters.map((filter, i) => (
                            <Badge key={i} variant="secondary" className="bg-white/50">{filter.type}: {filter.value}</Badge>
                        ))}
                    </div>
                 </div>
            )}
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
            ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
                searchResults.map(result => (
                  <Link href={getLinkForCollection(result)} key={result.id} onClick={onClose} className="block group">
                    <Card className="hover:border-primary/50 hover:bg-accent/50 transition-colors">
                      <CardContent className="p-3 flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-md h-12 w-12 flex items-center justify-center shrink-0">{getIconForCollection(result.itemCollection)}</div>
                        <div className='flex-grow overflow-hidden'>
                            <p className='font-semibold truncate group-hover:text-primary'>{result.title}</p>
                            <p className='text-xs text-muted-foreground truncate'>{result.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                      </CardContent>
                    </Card>
                  </Link>
                ))
            ) : !isScanning && (
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
