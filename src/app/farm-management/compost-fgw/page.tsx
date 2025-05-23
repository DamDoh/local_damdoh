
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Recycle, ArrowLeft } from "lucide-react";

export default function CompostFGWPage() {
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
            <Recycle className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Compost Method (Farming God's Way)</CardTitle>
          </div>
          <CardDescription>
            Learn the principles and practical steps for creating nutrient-rich compost following the Farming God's Way guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Recycle className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Detailed Guide & Tutorials Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This section will cover material selection, heap construction, turning schedules, moisture management, and troubleshooting common composting issues based on the Farming God's Way approach.
            </p>
             <p className="text-muted-foreground mt-2">
              Look out for video tutorials and downloadable guides.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
