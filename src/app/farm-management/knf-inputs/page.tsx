
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlaskConical, ArrowLeft } from "lucide-react";

export default function KNFInputsPage() {
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
            <FlaskConical className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">KNF Agriculture Input Formulas</CardTitle>
          </div>
          <CardDescription>
            A guide to preparing various Korean Natural Farming (KNF) inputs like IMO, OHN, FAA, and WCA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <FlaskConical className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Recipes & Application Guides Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This section will provide step-by-step instructions, ingredient lists, and usage recommendations for key KNF inputs to enhance soil life and plant health.
            </p>
            <p className="text-muted-foreground mt-2">
              We will include visual guides and tips from experienced KNF practitioners.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
