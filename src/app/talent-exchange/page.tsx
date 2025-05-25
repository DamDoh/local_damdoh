// This page is deprecated and its functionality has been merged into /marketplace.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";

export default function TalentExchangePage_DEPRECATED() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">Talent Exchange - Merged with Marketplace</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            The features for listing jobs, services, land, and equipment rentals have been integrated into our unified Marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            You can now find and offer these opportunities by selecting the "Service" or appropriate product category in the Marketplace.
          </p>
          <Button asChild>
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Marketplace
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
