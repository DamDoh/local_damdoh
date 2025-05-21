
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CommunityGuidelinesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Community Guidelines</CardTitle>
          </div>
          <CardDescription>Our commitment to a safe and respectful environment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Community Guidelines - Content Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This page will detail our community guidelines to ensure DamDoh remains a productive, safe, and respectful platform for all agricultural stakeholders.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
