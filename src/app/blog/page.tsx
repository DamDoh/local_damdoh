
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rss } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Rss className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">DamDoh Blog</CardTitle>
          </div>
          <CardDescription>Insights, news, and updates from the DamDoh team and community.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Rss className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Blog - Content Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              Stay updated with the latest articles, success stories, and industry insights on the DamDoh blog.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
