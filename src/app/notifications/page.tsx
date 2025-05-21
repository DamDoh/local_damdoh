
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Notifications</CardTitle>
          </div>
          <CardDescription>Stay updated with alerts from your network, marketplace, and forums.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No New Notifications</h3>
            <p className="text-muted-foreground max-w-md">
              When there's activity relevant to you—like new messages, connection requests, or important updates—you'll see it here.
            </p>
            <p className="text-muted-foreground mt-2">
              Explore the platform to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
