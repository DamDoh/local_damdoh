
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sprout, Home, Recycle, FlaskConical, ArrowRight, Tractor, DollarSign, Bell, PlusCircle } from "lucide-react";

export default function FarmManagementPage() {
  const resourceGuides = [
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
      title: "KNF Input Assistant",
      description: "An interactive guide to creating Korean Natural Farming inputs like IMO, FPJ, and FAA with step-by-step tracking.",
      link: "/farm-management/knf-inputs",
      icon: <FlaskConical className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "natural farming inputs",
    },
    {
      title: "Seed Starting & Seedling Care",
      description: "A guide to starting seeds indoors and caring for seedlings before transplanting.",
      link: "/farm-management/seed-starting", 
      icon: <Sprout className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "seed starting guide",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Tractor className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="text-3xl">The Farmer's Hub</CardTitle>
                <CardDescription className="text-lg">
                    Your digital toolkit for managing your entire farming business—from planning and finance to operations and sales.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* My Farms Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">My Farms</CardTitle>
            <CardDescription>Manage your agricultural assets and track their performance.</CardDescription>
          </div>
           <Button asChild>
            <Link href="/farm-management/create-farm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Farm
            </Link>
           </Button>
        </CardHeader>
        <CardContent>
          <div className="p-6 border rounded-lg shadow-inner bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">Your registered farms will be listed here.</p>
            <p className="text-xs text-muted-foreground mt-1">(Farm management features coming soon)</p>
          </div>
        </CardContent>
      </Card>

      {/* Financials & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><DollarSign className="h-5 w-5"/>Financial Overview</CardTitle>
                <CardDescription>Track expenses and revenue to understand your farm's profitability.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="p-6 border rounded-lg shadow-inner bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">A summary of your farm transactions will appear here.</p>
                    <p className="text-xs text-muted-foreground mt-1">(Financial tracking tools are under development)</p>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Bell className="h-5 w-5"/>Alerts & Insights</CardTitle>
                <CardDescription>Get personalized alerts and data-driven recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-6 border rounded-lg shadow-inner bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">Pest alerts, weather warnings, and AI-powered insights will be shown here.</p>
                     <p className="text-xs text-muted-foreground mt-1">(AI integrations are coming soon)</p>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Resource Library Section */}
       <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-semibold">Resource Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceGuides.map((func) => (
            <Card key={func.title} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="items-center text-center">
                {func.icon}
                <CardTitle className="text-lg">{func.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                <p className="text-sm text-muted-foreground">{func.description}</p>
                </CardContent>
                <CardFooter>
                <Button asChild className="w-full">
                    <Link href={func.link}>
                    View Guide <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      </div>

    </div>
  );
}
