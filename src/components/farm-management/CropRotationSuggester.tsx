
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Lightbulb, Recycle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { suggestCropRotationAction } from '@/lib/server-actions';
import type { CropRotationOutput, CropRotationInput } from '@/lib/types';

interface CropRotationSuggesterProps {
  cropHistory: string[];
  location: string;
}

const SuggestionSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        ))}
    </div>
);

export function CropRotationSuggester({ cropHistory, location }: CropRotationSuggesterProps) {
  const t = useTranslations('CropRotationSuggester');
  const [suggestions, setSuggestions] = useState<CropRotationOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: Omit<CropRotationInput, 'language'> = {
        cropHistory,
        location,
      };
      const result = await suggestCropRotationAction(payload);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error(err);
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5 text-primary" />
            {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!suggestions && !isLoading && (
            <Button onClick={handleGetSuggestions} className="w-full">
                <Brain className="mr-2 h-4 w-4" />
                {t('buttonText')}
            </Button>
        )}
        
        {isLoading && <SuggestionSkeleton />}
        
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        
        {suggestions && (
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 border rounded-lg bg-background">
                  <h4 className="font-semibold text-base">{suggestion.cropName}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{suggestion.benefits}</p>
                  {suggestion.notes && (
                    <p className="text-xs text-primary mt-2 flex items-start gap-1.5">
                      <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{suggestion.notes}</span>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t('noSuggestions')}</p>
            )}
            <Button onClick={handleGetSuggestions} variant="outline" size="sm" className="w-full">
              <Recycle className="mr-2 h-4 w-4" />
              {t('regenerateButton')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
