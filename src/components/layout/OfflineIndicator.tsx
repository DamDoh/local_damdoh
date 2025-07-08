
"use client";

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';

export function OfflineIndicator() {
  const { isOnline, pendingActionCount, isSyncing } = useOfflineSync();
  const t = useTranslations('OfflineIndicator');

  const getTooltipContent = () => {
    if (isSyncing) return t('tooltip.syncing', { count: pendingActionCount });
    if (isOnline) {
      return pendingActionCount > 0
        ? t('tooltip.onlinePending', { count: pendingActionCount })
        : t('tooltip.onlineSynced');
    }
    return t('tooltip.offline', { count: pendingActionCount });
  };
  
  const Icon = isOnline ? (isSyncing ? Loader2 : Wifi) : WifiOff;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-20 right-4 z-50 md:bottom-4 print:hidden">
            <Button
                variant="outline"
                size="icon"
                className={cn(
                    "h-12 w-12 rounded-full shadow-lg border-2",
                    isOnline ? "border-green-500 bg-green-50/80 text-green-700 dark:bg-green-900/80 dark:text-green-300" : "border-destructive/50 bg-destructive/10 text-destructive",
                    isSyncing && "animate-pulse"
                )}
            >
                <Icon className={cn("h-6 w-6", isSyncing && "animate-spin")} />
                {pendingActionCount > 0 && !isSyncing && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1">
                        {pendingActionCount}
                    </Badge>
                )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="mb-2">
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
