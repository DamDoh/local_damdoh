
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkCheck } from "lucide-react";

export default function PinboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">My Pin Board</CardTitle>
          </div>
          <CardDescription>Your saved items from across DamDoh: marketplace listings, forum posts, talent exchange opportunities, news, and events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <BookmarkCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Pin Board Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This is where your pinned items from the Marketplace, Talent Exchange, Forums, News, and Events will appear for quick access.
            </p>
            <p className="text-muted-foreground mt-2">
              Start exploring and look for the pin icon to save interesting content!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
