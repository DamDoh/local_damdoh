
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function CareersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Careers at DamDoh</CardTitle>
          </div>
          <CardDescription>Join our mission to revolutionize the agricultural supply chain.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Careers - Content Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              Interested in joining DamDoh? This page will list current job openings and information about our company culture.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
