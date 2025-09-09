
"use client";

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, ShoppingCart, Users, MessageSquare, FileText, Loader2, ArrowRight, QrCode, GitBranch } from 'lucide-react';
import Link from 'next/link';

import { interpretSearchQuery } from '@/lib/server-actions';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { performSearch } from '@/lib/server-actions';
import { QrScanner } from '../QrScanner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { SmartSearchInterpretation } from '@/lib/types';
import { Dialog, DialogHeader, DialogContent } from '../ui/dialog';

interface SearchResult {
  id: string;
  itemId: string;
  itemCollection: 'users' | 'marketplaceItems' | 'forums' | 'agri_events' | 'knowledge_articles' | 'vti_registry';
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  location?: any;
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
  const t = useTranslations('searchPage');
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<SmartSearchInterpretation | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [isScanning, setIsScanning] = useState(false);

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
          title: t('modal.searchError'),
          description: error.message || t('modal.searchErrorDescription'),
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
      
      const vtiRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (vtiRegex.test(decodedText)) {
          onClose(); // Close the search modal
          router.push(`/traceability/batches/${decodedText}`);
      } else if (decodedText.includes('damdoh:user')) {
          const url = new URL(decodedText);
          const userId = url.searchParams.get('id');
          if (userId) {
              onClose();
              router.push(`/profiles/${userId}`);
          }
      } else {
           toast({ title: t('modal.invalidCodeError'), variant: "destructive"});
      }
  };

  const handleScanFailure = (error: string) => {
      setIsScanning(false);
      toast({ title: t('modal.scanError'), description: t('modal.scanErrorDescription'), variant: "destructive"});
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
          <DialogTitle className='flex items-center gap-2'><Sparkles className="h-5 w-5 text-primary" />{t('modal.title')}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b bg-background/80">
          <form onSubmit={handleSubmitForm} className="flex items-center gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder={t('modal.placeholder')}
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
              {t('modal.searchButton')}
            </Button>
          </form>
        </div>
        
        {isScanning && <QrScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} onClose={() => setIsScanning(false)} />}

        <ScrollArea className="flex-grow">
          <div className='p-4 space-y-4'>
             {aiInterpretation && (
                 <div className="p-3 text-xs text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                    <p><strong>{t('modal.interpretationTitle')}:</strong> {aiInterpretation.interpretationNotes || t('modal.interpretationNotesDefault')}</p>
                    {aiInterpretation.suggestedFilters && aiInterpretation.suggestedFilters.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            <strong>{t('modal.filtersTitle')}:</strong>
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
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t(`modal.results.${collectionName}` as any, collectionName)}</h3>
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
                    <p>{t('modal.noResults')}</p>
                    <p className="text-xs">{t('modal.tryAgain')}</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
