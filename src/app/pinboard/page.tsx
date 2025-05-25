
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkCheck, Info } from "lucide-react";

export default function PinboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">My Pin Board</CardTitle>
          </div>
          <CardDescription>Your saved items from across DamDoh: marketplace listings, forum posts, profiles, news, and events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Info className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Pin Board Feature: Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This is where your pinned items from the Marketplace, Network, Forums, News, and Events will appear for quick access.
            </p>
            <p className="text-muted-foreground mt-2">
              We're working on enabling you to save and organize your interests from across the DamDoh platform. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
