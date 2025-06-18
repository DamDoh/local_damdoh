
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

       {/* Conceptual Section for Supply Chain Optimization Tools */}
 {/* Conceptual Data Flow & State Management Comments */}
 {/*
          // Conceptual Data Flow & State Management for Supply Chain Optimization:
          //
          // Data Flow for Inventory:
          // - Inventory data (`inventoryItems: InventoryItem[]`) would be fetched from a backend source (e.g., Firestore collection linked to the farmerId and their farms).
          // - This data would include details like product name, quantity, unit, associated batch (if applicable), storage location, and status.
          // State Management for Inventory:
          // - A state variable (`inventoryItems`) would hold the array of inventory items to display.
          // - State variables for loading (`isLoadingInventory`) and potential errors (`inventoryError`) would be needed.
          // User Actions:
          // - Actions like adding new inventory items, updating quantities, or marking items as sold would trigger backend calls to update the data source and subsequently update the `inventoryItems` state.
          // Example conceptual function calls: `fetchInventory(farmerId)`, `addInventoryItem(itemData)`, `updateInventoryItem(itemId, newData)`.
 */}
 <Card className="mt-8 bg-green-100/30 border-green-500/30">
 <CardHeader>
 <CardTitle className="text-xl">Supply Chain & Logistics Tools (Coming Soon)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              As part of DamDoh\'s evolution into a super app, we will integrate tools to help manage your farm\'s inputs and outputs within the broader supply chain. This section is a placeholder for features like:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
              <li>Basic Inventory Management for harvested produce and stored inputs.</li>
              <li><Link href="/logistics" className="text-blue-600 hover:underline">Direct links to Logistics Service providers</Link> to arrange transport for your goods.</li>
              <li>Integration with Marketplace listings to track stock levels.</li>
              {/* Conceptual Inventory Summary */}
              <li className="mt-4 text-md text-foreground">
                <h4 className="font-semibold mb-2">Conceptual Inventory Summary:</h4>
 {/* Conceptual UI based on Inventory Data */}
 {/*
                 // This grid would display the `inventoryItems` fetched and stored in state.
                 // Each card/div represents an `InventoryItem`.
                 // When the `inventoryItems` state changes (e.g., after fetching or adding an item), this section would re-render.
 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Placeholder for mapping over fetched inventoryItems using a conceptual InventoryItem component */}
 {/* {inventoryItems.map(item => (
                    <InventoryItem key={item.id} name={item.productName} quantity={`${item.quantity} ${item.unit}`} status={item.status} batchId={item.batchId} />
                  ))} */}
 <div className="p-3 border rounded bg-white">
 <p className="text-sm font-medium text-muted-foreground">Harvested Corn (Batch #ABC123)</p>
 <p className="text-lg font-bold text-green-700">500 KG</p>
 <p className="text-xs text-muted-foreground">Status: In Storage | Ready for Listing</p>
 </div>
 <div className="p-3 border rounded bg-white">
 <p className="text-sm font-medium text-muted-foreground">Fertilizer (Type XYZ)</p>
 <p className="text-lg font-bold text-orange-700">10 Bags</p>
 <p className="text-xs text-muted-foreground">Status: In Stock | Low Alert (AI Suggestion)</p>
 </div>
                </div>
              </li>
              <li>Tools for managing delivery schedules and pickup points.</li>
            </ul>
          </CardContent>
 {/* Conceptual Data Flow & State Management Comments (continued) */}
 {/*
           // Data Flow for Logistics:
           // - Logistics information might involve fetching a list of available service providers based on the farm's location and the destination/product type.
           // - This could also involve fetching data about past shipments or current transport requests.
           // State Management for Logistics:
           // - State variables might be needed to manage the list of providers (`logisticsProviders`), details of ongoing shipments (`shipments`), and related loading/error states.
           // User Actions:
           // - Actions like requesting a quote, booking transport, or tracking a shipment would trigger backend logistics API calls and update relevant state variables.
           // Example conceptual function calls: `fetchLogisticsProviders(location, product)`, `requestShipment(details)`, `trackShipment(shipmentId)`.

           // - State variables might be needed to manage the list of providers (`logisticsProviders`), details of ongoing shipments (`shipments`), and related loading/error states.
 */}
 {/* 
           // AI could analyze inventory levels and market demand to suggest optimal selling times or storage solutions.
           // AI could recommend logistics providers based on location, product type, volume, and past reliability.
           // AI could analyze past harvest data, market prices, and resource usage to provide personalized recommendations for resource allocation for the next season.
           // AI could provide alerts based on inventory levels and upcoming harvest/planting cycles.
 */}
        </Card>
 {/* Conceptual Button to Add Inventory - positioned outside the list item */}
 {/* <Button onClick={() => {/* conceptual add inventory action */}} className="mt-4">Add New Inventory</Button> */}
 {/* Conceptual Logistics Links - positioned outside the list item but within the card */}
 {/* <LogisticsLink name="Find Transport Providers" href="/logistics/providers" /> */}

       {/* Add conceptual sections or components for other supply chain tools here */}
       {/* e.g., <Card>... Logistics Management UI ...</Card> */}

    </div>
  );
}
