
// This page is deprecated and its functionality has been merged into /marketplace/create.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";

export default function CreateTalentListingPage_DEPRECATED() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">Create Listing - Merged with Marketplace</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            The form for creating new job, service, land, or equipment rental listings is now part of the unified Marketplace creation process.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Please use the "Create New Listing" page in the Marketplace to offer your products or services.
          </p>
          <Button asChild>
            <Link href="/marketplace/create">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Create Marketplace Listing
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
