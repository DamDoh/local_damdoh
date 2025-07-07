"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, Landmark, Info } from "lucide-react";
import { useTranslations } from "next-intl";

export default function WalletPage() {
  const t = useTranslations('walletPage');
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <WalletIcon className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
          </div>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <Landmark className="h-16 w-16 text-muted-foreground/50" />
              <Info className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">{t('underDevelopmentTitle')}</h3>
            <p className="text-muted-foreground max-w-md">
              {t('underDevelopmentDescription')}
            </p>
            <ul className="text-muted-foreground list-disc list-inside mt-2 text-left max-w-sm mx-auto">
              <li>{t('feature1')}</li>
              <li>{t('feature2')}</li>
              <li>{t('feature3')}</li>
              <li>{t('feature4')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('stayTuned')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}