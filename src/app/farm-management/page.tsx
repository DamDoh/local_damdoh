
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sprout, Home, Recycle, FlaskConical, ArrowRight } from "lucide-react";

export default function FarmManagementPage() {
  const farmFunctions = [
    {
      title: "200sqm Family Farm Model",
      description: "Learn about intensive, bio-diverse farming on a 200 square meter plot for family sustenance and surplus.",
      link: "/farm-management/family-farm",
      icon: <Home className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "small farm plan",
    },
    {
      title: "Compost Method (Farming God's Way)",
      description: "Discover the principles and steps for creating high-quality compost using the Farming God's Way methodology.",
      link: "/farm-management/compost-fgw",
      icon: <Recycle className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "compost heap",
    },
    {
      title: "KNF Agriculture Input Formulas",
      description: "Explore Korean Natural Farming (KNF) recipes and formulas for creating indigenous microorganism (IMO) inputs.",
      link: "/farm-management/knf-inputs",
      icon: <FlaskConical className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "natural farming inputs",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-3xl">Sustainable Farm Management Hub</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Access resources and guides on regenerative farming techniques to improve soil health, biodiversity, and food security.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farmFunctions.map((func) => (
          <Card key={func.title} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="items-center text-center">
              {func.icon}
              <CardTitle className="text-xl">{func.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow text-center">
              <p className="text-sm text-muted-foreground">{func.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={func.link}>
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <Card className="mt-8 bg-accent/30 border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl">More Farm Tools Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We are continuously expanding our Farm Management Hub. Future features will include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
              <li>Crop Planning & Rotation Schedules</li>
              <li>Livestock Management Records</li>
              <li>Financial Tracking & Budgeting Tools</li>
              <li>Resource Allocation Planners (Water, Feed)</li>
              <li>Integration with Market Data & Supply Chain Partners</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Stay tuned for updates as we build out this powerful part of DamDoh to support your farming success.
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
