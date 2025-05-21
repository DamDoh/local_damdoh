
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function AgriEventsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Agri-Business Events</CardTitle>
          </div>
          <CardDescription>Discover upcoming conferences, workshops, webinars, and trade shows in the agricultural sector.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <CalendarDays className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Events Calendar Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              Find and list agricultural events here. Network, learn, and showcase your products and services to the agri-business community.
            </p>
            <p className="text-muted-foreground mt-2">
              Stay tuned for updates on our events platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
