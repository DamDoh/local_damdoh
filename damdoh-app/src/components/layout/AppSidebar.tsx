
"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const { t } = useTranslation('common');

  return (
    <div className="p-4 text-sm text-muted-foreground flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 rounded-md">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div>
            <p className="font-semibold text-destructive">{t('categoryNav.deprecationNoteTitle')}</p>
            <p className="text-xs">{t('categoryNav.deprecationNote')}</p>
        </div>
      </div>
      
      <div className="mt-4 opacity-50 pointer-events-none">
        <div className="relative flex w-full min-w-0 flex-col p-2">
            <div className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70">
                {t('categoryNav.oldMenuTitle')}
            </div>
        </div>
      </div>
    </div>
  );
}
