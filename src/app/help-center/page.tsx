
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function HelpCenterPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">DamDoh Help Center</CardTitle>
          </div>
          <CardDescription>Find answers to your questions about using DamDoh.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <HelpCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Help Center - Content Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This section will contain FAQs, tutorials, and support articles to help you get the most out of DamDoh.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
