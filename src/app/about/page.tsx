
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">About DamDoh</CardTitle>
          </div>
          <CardDescription>Learn more about our mission to connect the agricultural supply chain.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Info className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">About Us - Content Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This page will detail the mission, vision, and values of DamDoh, and introduce the team behind the platform.
              We are dedicated to empowering stakeholders across the agricultural value chain.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
