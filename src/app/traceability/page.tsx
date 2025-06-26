"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History, Fingerprint } from "lucide-react";

export default function TraceabilityHubPage() {
  const [vti, setVti] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (vti.trim()) {
      router.push(`/traceability/batches/${vti.trim()}`);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Fingerprint className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">Product Traceability</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Follow the journey of your food from farm to fork. Enter a Vibrant Traceability ID (VTI) to view a product's history.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter VTI..."
              value={vti}
              onChange={(e) => setVti(e.target.value)}
              className="h-12 text-lg"
            />
            <Button type="submit" size="lg" disabled={!vti.trim()}>
              <Search className="mr-2 h-5 w-5" />
              Track
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">A VTI is a unique ID assigned to a batch of products when harvested, allowing you to trace its journey through the supply chain.</p>
        </CardContent>
      </Card>
      {/* Placeholder for recent searches or tracked items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> My Recently Tracked Batches</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">Recently tracked items will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
