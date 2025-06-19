
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
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-3xl">Sustainable Farm Management Hub</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Access resources and guides on regenerative farming techniques to improve soil health, biodiversity, and food security.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* This grid now correctly displays the farm function cards */}
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

      {/* Conceptual Section for Traceability (Product Batches) */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Your Product Batches (Traceability)</CardTitle>
          <CardDescription>Track your harvested product batches and their associated events.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Conceptual Data Flow & State Management Comments for Batches */}
          {/* Conceptual Data Fetching for Batches */}
          {/*
            // Conceptual Data Flow for Batches:
            // - Batch data (`batches: Batch[]`) would be fetched from a backend source (e.g., Firestore collection 'batches').
            // - This data would be filtered to only include batches linked to the current user's `farmerId`.
            // - A state variable (`batches`) would hold the array of batch objects to display.
            // - State variables for loading (`isLoadingBatches`) and potential errors (`batchesError`) would be needed.
            // Example conceptual function call: `fetchFarmerBatches(farmerId)`. This function would perform the Firestore query.
          */}
          {/* Conceptual UI based on Batches Data */}
          {/* This section would iterate over the `batches` state to display individual batch items. */}
          {/* {batches.map(batch => (
            <div key={batch.batchId} className="p-4 border rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold">{batch.productName}</h4>
              <p className="text-sm text-muted-foreground">Batch ID: {batch.batchId}</p>
              <p className="text-sm text-muted-foreground">Quantity: {batch.quantity} {batch.unit}</p>
              <p className="text-sm text-muted-foreground">Harvest Date: {batch.harvestDate}</p>
               Conceptual Link/Button to Batch Detail Page 
              <Link href={`/traceability/batches/${batch.batchId}`} className="text-blue-600 hover:underline mt-2 inline-block">
                View Details <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
          ))} */}
          {/* Placeholder Batch Item Example */}
          <div className="p-4 border rounded shadow-sm bg-gray-50">
            <p className="text-sm text-muted-foreground italic">Your product batch information will appear here. (Feature coming soon)</p>
          </div>
        </CardContent>
        {/* Conceptual Button to Add New Batch */}
        {/* <Button onClick={() => {/* conceptual add batch action */}} className="mt-4">Add New Batch</Button> */}
      </Card>

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

      {/* Conceptual Section for Supply Chain Optimization Tools */}
      <Card className="mt-8 bg-green-100/30 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-xl">Supply Chain & Logistics Tools (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            As part of DamDoh's evolution into a super app, we will integrate tools to help manage your farm's inputs and outputs within the broader supply chain. This section is a placeholder for features like:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
            <li>Basic Inventory Management for harvested produce and stored inputs.</li>
            <li><Link href="/logistics" className="text-primary hover:underline">Direct links to Logistics Service providers</Link> to arrange transport for your goods.</li>
            <li>Integration with Marketplace listings to track stock levels.</li>
            <li className="mt-4 text-md text-foreground">
              <h4 className="font-semibold mb-2">Conceptual Inventory Summary:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded bg-white shadow">
                  <p className="text-sm font-medium text-muted-foreground">Harvested Corn (Batch #ABC123)</p>
                  <p className="text-lg font-bold text-green-700">500 KG</p>
                  <p className="text-xs text-muted-foreground">Status: In Storage | Ready for Listing</p>
                </div>
                <div className="p-3 border rounded bg-white shadow">
                  <p className="text-sm font-medium text-muted-foreground">Fertilizer (Type XYZ)</p>
                  <p className="text-lg font-bold text-orange-700">10 Bags</p>
                  <p className="text-xs text-muted-foreground">Status: In Stock | Low Alert (AI Suggestion)</p>
                </div>
              </div>
            </li>
            <li>Tools for managing delivery schedules and pickup points.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
