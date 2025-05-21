
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout } from "lucide-react";

export default function FarmManagementPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Farm Management Dashboard</CardTitle>
          </div>
          <CardDescription>Tools and resources to help you manage your farm operations efficiently.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Sprout className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Farm Management Tools Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This section will provide features for crop planning, livestock management, financial tracking, resource allocation, and integration with market data and supply chain partners.
            </p>
            <p className="text-muted-foreground mt-2">
              Stay tuned for updates as we build out this powerful part of DamDoh.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
