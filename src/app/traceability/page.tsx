
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History, Fingerprint } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TraceabilityHubPage() {
  const { t } = useTranslation('common');
  const [vti, setVti] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (vti.trim()) {
      router.push(`/traceability/batches/${vti.trim()}`);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Fingerprint className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('traceabilityPage.title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('traceabilityPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder={t('traceabilityPage.inputPlaceholder')}
              value={vti}
              onChange={(e) => setVti(e.target.value)}
              className="h-12 text-lg"
            />
            <Button type="submit" size="lg" disabled={!vti.trim()}>
              <Search className="mr-2 h-5 w-5" />
              {t('traceabilityPage.trackButton')}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">{t('traceabilityPage.vtiDescription')}</p>
        </CardContent>
      </Card>
      {/* Placeholder for recent searches or tracked items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> {t('traceabilityPage.recentTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">{t('traceabilityPage.recentDescription')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
