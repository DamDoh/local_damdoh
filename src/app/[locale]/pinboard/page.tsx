
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkCheck, Info } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PinboardPage() {
  const t = useTranslations('pinboardPage');
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
          </div>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Info className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">{t('comingSoonTitle')}</h3>
            <p className="text-muted-foreground max-w-md">
              {t('comingSoonDescription')}
            </p>
            <p className="text-muted-foreground mt-2">
              {t('stayTuned')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
