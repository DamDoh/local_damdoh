
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";
import Link from 'next/link';

// This is the root not-found page. It should not use i18n hooks
// as it exists outside the [locale] segment and thus has no
// NextIntlClientProvider context.
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Alert className="max-w-md text-center border-border shadow-lg">
            <div className="flex justify-center mb-4">
              <Frown className="h-12 w-12 text-destructive" />
            </div>
            <AlertTitle className="text-2xl font-bold">Page Not Found</AlertTitle>
            <AlertDescription className="mt-2 text-muted-foreground">
              Sorry, the page you are looking for does not exist or has been moved.
            </AlertDescription>
            <Button asChild className="mt-6">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </Alert>
        </div>
      </body>
    </html>
  );
}
