
"use client";

// THIS PAGE IS DEPRECATED AND WILL BE REMOVED.
// The main dashboard logic has been moved to src/app/page.tsx
// This file is kept temporarily to avoid breaking potential routing, but should be considered obsolete.

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DeprecatedHomePage() {
  return (
    <div className="p-4 md:p-6">
        <Card className="bg-destructive/10 border-destructive">
            <CardContent className="pt-6">
                <div className="flex items-center gap-4 text-destructive">
                    <AlertTriangle className="h-8 w-8"/>
                    <div>
                        <h2 className="font-bold">Page Deprecated</h2>
                        <p className="text-sm">
                            This page (`/home`) is no longer in use. The main dashboard functionality has been consolidated into the root page (`/`). 
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
