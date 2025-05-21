
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export default function IndustryNewsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Industry News & Reports</CardTitle>
          </div>
          <CardDescription>Stay informed with the latest news, research, and market reports relevant to the agricultural supply chain.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Newspaper className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">News & Reports Section Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This section will feature curated agricultural news, market analysis, research findings, and insightful reports to help you make informed decisions.
            </p>
            <p className="text-muted-foreground mt-2">
              We're working on bringing you valuable content. Check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
