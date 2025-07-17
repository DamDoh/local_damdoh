"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";
import Link from 'next/link'; // Use the standard Link for the root 404 page
import { useTranslations } from "next-intl";

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');
  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Alert className="max-w-md text-center border-border shadow-lg">
            <div className="flex justify-center mb-4">
              <Frown className="h-12 w-12 text-destructive" />
            </div>
            <AlertTitle className="text-2xl font-bold">{t('title')}</AlertTitle>
            <AlertDescription className="mt-2 text-muted-foreground">
              {t('description')}
            </AlertDescription>
            <Button asChild className="mt-6">
              <Link href="/">{t('goHomeButton')}</Link>
            </Button>
          </Alert>
        </div>
      </body>
    </html>
  );
}
