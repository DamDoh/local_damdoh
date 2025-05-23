
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function FamilyFarmPage() {
  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farm Management Hub
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">200sqm Family Farm Model</CardTitle>
          </div>
          <CardDescription>
            Detailed guide on establishing and managing a highly productive 200 square meter family farm using bio-intensive and regenerative methods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Home className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Content & Interactive Tools Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This section will provide comprehensive information on plot design, crop selection, companion planting, soil fertility management, water conservation, and pest control specifically for a 200sqm model.
            </p>
            <p className="text-muted-foreground mt-2">
              We'll include case studies, planning tools, and resource links.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
