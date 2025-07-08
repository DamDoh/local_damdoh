
"use client";

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, ShoppingCart, Users, MessageSquare, FileText, Loader2, ArrowRight, QrCode, GitBranch } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { interpretSearchQuery, type SmartSearchInterpretation } from '@/ai/flows/query-interpreter-flow';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { APP_NAME } from '@/lib/constants';
import { Card, CardContent } from '../ui/card';
import { performSearch } from '@/lib/server-actions';
import { QrScanner } from '../QrScanner';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface SearchResult {
  id: string;
  itemId: string;
  itemCollection: 'users' | 'marketplaceItems' | 'forums' | 'agri_events' | 'knowledge_articles' | 'vti_registry';
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
        case 'vti_registry': return <GitBranch {...props} />;
        default: return <FileText {...props} />;
    }
}

const getLinkForCollection = (result: SearchResult) => {
    switch(result.itemCollection) {
        case 'users': return `/profiles/${result.itemId}`;
        case 'marketplaceItems': return `/marketplace/${result.itemId}`;
        case 'forums': return `/forums/${result.itemId}`;
        case 'agri_events': return `/agri-events/${result.itemId}`;
        case 'knowledge_articles': return `/blog/${result.itemId}`;
        case 'vti_registry': return `/traceability/batches/${result.itemId}`;
        default: return '#';
    }
}

export function UniversalSearchModal({ isOpen, onClose, initialQuery = "" }: UniversalSearchModalProps) {
  const t = useTranslations('searchPage.modal');
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
          title: t('searchError'),
          description: error.message || t('searchErrorDescription'),
          variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, toast, t]);


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
        let idToLookup;
        let type: 'user' | 'batch' | null = null;
        
        if (decodedText.includes('damdoh:user?id=')) {
          idToLookup = decodedText.split('damdoh:user?id=')[1];
          type = 'user';
        } else if (decodedText.length > 20) { // Assume it's a VTI
           idToLookup = decodedText;
           type = 'batch';
        } else {
          throw new Error(t('invalidCodeError'));
        }

        if (type === 'user') {
            const result = await getUniversalIdDataCallable({ scannedUniversalId: idToLookup });
            const profile = result.data as UserProfile;
            if (profile && profile.uid) {
                onClose();
                router.push(`/profiles/${profile.uid}`);
            } else {
                 throw new Error(t('userNotFound'));
            }
        } else if (type === 'batch') {
            onClose();
            router.push(`/traceability/batches/${idToLookup}`);
        }
      } catch (error: any) {
         toast({ title: t('scanFailed'), description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
  };

  const handleScanFailure = (error: string) => {
      setIsScanning(false);
      toast({ title: t('scanError'), description: t('scanErrorDescription'), variant: "destructive"});
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    const collection = result.itemCollection;
    if (!acc[collection]) {
      acc[collection] = [];
    }
    acc[collection].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className='p-4 border-b'>
          <DialogTitle className='flex items-center gap-2'><Sparkles className="h-5 w-5 text-primary" />{t('title')}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b bg-background/80">
          <form onSubmit={handleSubmitForm} className="flex items-center gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder={t('placeholder')}
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  className="h-11 text-base pl-10"
                  disabled={isLoading}
                  autoFocus
                />
            </div>
             <Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => setIsScanning(true)} disabled={isLoading}>
                <QrCode className="h-5 w-5" />
            </Button>
            <Button type="submit" disabled={isLoading || !currentQuery.trim()} size="lg" className="h-11">
              {isLoading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              {t('searchButton')}
            </Button>
          </form>
        </div>
        
        {isScanning && <QrScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} onClose={() => setIsScanning(false)} />}

        <ScrollArea className="flex-grow">
          <div className='p-4 space-y-4'>
             {aiInterpretation && (
                 <div className="p-3 text-xs text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                    <p><strong>{t('interpretationTitle')}:</strong> {aiInterpretation.interpretationNotes || t('interpretationNotesDefault')}</p>
                    {aiInterpretation.suggestedFilters && aiInterpretation.suggestedFilters.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            <strong>{t('filtersTitle')}:</strong>
                            {aiInterpretation.suggestedFilters.map((filter, i) => (
                                <Badge key={i} variant="secondary" className="bg-white/50">{filter.type}: {filter.value}</Badge>
                            ))}
                        </div>
                    )}
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
            ) : Object.keys(groupedResults).length > 0 ? (
                Object.entries(groupedResults).map(([collectionName, results]) => (
                    <div key={collectionName}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t(`results.${collectionName}` as any, collectionName)}</h3>
                        <div className="space-y-2">
                        {results.map(result => (
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
                        ))}
                        </div>
                    </div>
                ))
            ) : !isScanning && currentQuery.trim() && (
                 <div className='flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16'>
                    <Search className="h-12 w-12 mb-4"/>
                    <p>{t('noResults')}</p>
                    <p className="text-xs">{t('tryAgain')}</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
