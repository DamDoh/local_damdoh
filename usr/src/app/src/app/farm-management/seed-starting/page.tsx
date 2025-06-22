
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sprout, ArrowLeft, Leaf, Droplets, Package, Sun, Wind, Thermometer, AlertTriangle, CheckCircle, Lightbulb, Grid } from "lucide-react";

export default function SeedStartingPage() {
  const sections = [
    {
      id: "why-start-indoors",
      title: "Why Start Seeds Indoors?",
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      content: (
        <>
          <p className="text-muted-foreground">
            Starting seeds indoors gives you a significant advantage and more control over the early, vulnerable stages of a plant's life. Key benefits include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
            <li><strong className="font-medium">Get a Head Start:</strong> You can start seeds weeks or even months before the last frost date, giving you a longer growing season and earlier harvests.</li>
            <li><strong className="font-medium">Higher Germination Rates:</strong> Providing ideal warmth, moisture, and light ensures more of your seeds successfully sprout.</li>
            <li><strong className="font-medium">Protect Young Seedlings:</strong> Indoor seedlings are safe from harsh weather (heavy rain, wind, unexpected cold snaps) and common garden pests (birds, slugs, insects) that can destroy them overnight.</li>
            <li><strong className="font-medium">Cost Savings:</strong> Growing plants from seed is often much cheaper than buying established nursery seedlings, especially for large quantities.</li>
            <li><strong className="font-medium">Wider Variety:</strong> The variety of seeds available is far greater than the selection of seedlings you can buy, allowing you to grow unique and heirloom crops.</li>
          </ul>
        </>
      ),
    },
    {
      id: "what-you-need",
      title: "What You'll Need (Materials)",
      icon: <Package className="h-5 w-5 text-primary" />,
      content: (
        <>
          <p className="text-muted-foreground mb-2">Gathering the right materials before you start makes the process smooth and successful. You don't need expensive equipment to begin.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-md mb-1 text-foreground">1. Containers:</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li>Seed starting trays, cell packs, or small pots.</li>
                <li>Recycled containers like yogurt cups, egg cartons, or toilet paper rolls (ensure they have drainage holes).</li>
                <li>Soil blocks or peat pellets are also great options.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-md mb-1 text-foreground">2. Seed Starting Mix:</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li>Use a sterile, fine-textured seed starting mix. Do not use heavy garden soil, which can compact and harbor diseases.</li>
                <li>You can buy a commercial mix or make your own (e.g., mixing coco coir, perlite, and compost).</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-md mb-1 text-foreground">3. Seeds:</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li>Choose high-quality seeds from a reputable source. Check the seed packet for information on planting depth and timing.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-md mb-1 text-foreground">4. Light, Water & Labels:</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li><strong className="font-semibold">Light:</strong> A sunny, south-facing window can work, but a simple grow light (fluorescent shop light or LED) is highly recommended for strong, healthy seedlings.</li>
                <li><strong className="font-semibold">Water:</strong> A spray bottle or a small watering can with a gentle rose to water without dislodging seeds.</li>
                <li><strong className="font-semibold">Labels:</strong> Label your containers clearly with the plant variety and sowing date.</li>
              </ul>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "step-by-step",
      title: "Step-by-Step Guide to Sowing Seeds",
      icon: <Grid className="h-5 w-5 text-green-700" />,
      content: (
        <ol className="list-decimal list-inside text-muted-foreground space-y-3 pl-5">
          <li><strong className="font-medium">Moisten the Mix:</strong> Put your seed starting mix in a tub or bucket and add water slowly, mixing until it's evenly moist but not waterlogged. It should feel like a damp sponge.</li>
          <li><strong className="font-medium">Fill Containers:</strong> Fill your containers with the moistened mix, pressing down gently to remove large air pockets. Do not compact it tightly.</li>
          <li><strong className="font-medium">Sow the Seeds:</strong> Check your seed packet for the recommended planting depth. A general rule is to plant a seed about twice as deep as it is wide. Place 2-3 seeds per cell or small pot. For very small seeds, you can just press them onto the soil surface and lightly cover with mix.</li>
          <li><strong className="font-medium">Water Gently:</strong> Mist the surface with your spray bottle to settle the seeds in.</li>
          <li><strong className="font-medium">Cover for Humidity:</strong> Cover the trays with a clear plastic dome or plastic wrap to keep humidity high, which helps germination. Remove the cover as soon as the first seedlings emerge to ensure good air circulation.</li>
          <li><strong className="font-medium">Keep Warm:</strong> Place the containers in a warm spot (check seed packet for ideal temperature, usually 21-27°C or 70-80°F). A heat mat can speed up germination for heat-loving plants like peppers and tomatoes.</li>
        </ol>
      ),
    },
    {
      id: "caring-for-seedlings",
      title: "Caring for Your Seedlings",
      icon: <Leaf className="h-5 w-5 text-green-600" />,
      content: (
        <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-3">
          <li>
            <strong className="font-medium">Light is Crucial:</strong> As soon as seedlings sprout, they need lots of light. If using a grow light, keep it just 2-3 inches above the tops of the seedlings and run it for 14-16 hours a day. This prevents them from becoming tall and "leggy". If using a window, rotate the tray daily so they grow straight.
          </li>
          <li>
            <strong className="font-medium">Proper Watering:</strong> Keep the soil consistently moist but not waterlogged. Water from the bottom by placing containers in a tray of water and letting them soak it up. This encourages deep root growth and prevents damping-off disease. Let the surface dry slightly between waterings.
          </li>
          <li>
            <strong className="font-medium">Good Airflow:</strong> After seedlings have emerged, ensure good air circulation. A small, gentle fan blowing over them for a few hours a day can strengthen stems and prevent disease.
          </li>
          <li>
            <strong className="font-medium">Thinning:</strong> Once seedlings have their first set of true leaves (the second set of leaves that appear), it's time to thin them. Choose the strongest-looking seedling in each cell and snip the others at the soil line with small scissors. Don't pull them out, as this can disturb the roots of the remaining seedling.
          </li>
          <li>
            <strong className="font-medium">Feeding (Optional):</strong> Most seed starting mixes have enough nutrients for the first few weeks. If your seedlings will be indoors for more than 3-4 weeks, you can start feeding them with a half-strength, balanced liquid fertilizer (like compost tea or a diluted fish emulsion) once a week.
          </li>
        </ul>
      ),
    },
    {
      id: "hardening-off",
      title: "Hardening Off: Preparing Seedlings for the Outdoors",
      icon: <Sun className="h-5 w-5 text-orange-500" />,
      content: (
        <>
          <p className="text-muted-foreground mb-2">
            This is a <strong className="font-semibold">critical step</strong> that many beginners skip. Seedlings grown indoors are not accustomed to outdoor conditions. You must gradually acclimate them over 7-14 days to prevent shock.
          </p>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1 pl-5 text-sm">
            <li><strong className="font-medium">Day 1-2:</strong> Place seedlings in a shady, protected spot outdoors for 1-2 hours.</li>
            <li><strong className="font-medium">Day 3-4:</strong> Increase the time to 3-4 hours and introduce them to a bit of morning sun.</li>
            <li><strong className="font-medium">Day 5-6:</strong> Gradually increase their exposure to direct sunlight and wind.</li>
            <li><strong className="font-medium">Day 7-10:</strong> Leave them out for most of the day, but bring them in at night if temperatures are cool.</li>
            <li><strong className="font-medium">After 10-14 days:</strong> Your seedlings should be tough enough to be left outside overnight (if weather permits) and are ready for transplanting.</li>
          </ol>
        </>
      ),
    },
    {
      id: "transplanting",
      title: "Transplanting into the Garden",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      content: (
        <>
          <p className="text-muted-foreground mb-2">
            Once your seedlings are hardened off and the outdoor soil is warm enough, it's time to plant them in their permanent home.
          </p>
          <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-2">
            <li><strong className="font-medium">Best Time:</strong> Transplant on a calm, overcast day or in the late afternoon to reduce stress on the plant.</li>
            <li><strong className="font-medium">Water Before and After:</strong> Water your seedlings well about an hour before transplanting, and prepare your garden bed by watering it as well.</li>
            <li><strong className="font-medium">Handle with Care:</strong> Gently remove the seedling from its container, trying to keep the root ball intact. Handle it by the leaves or root ball, not the delicate stem.</li>
            <li><strong className="font-medium">Plant at the Right Depth:</strong> Plant the seedling at the same depth it was in its container. The exception is tomatoes, which can be planted deeper to encourage more root growth along the stem.</li>
            <li><strong className="font-medium">Water Thoroughly:</strong> After planting, water the soil around the seedling well to settle it in and remove air pockets.</li>
            <li><strong className="font-medium">Provide Protection (Optional):</strong> If the weather is still unpredictable, you can provide temporary protection with a cloche or shade cloth for the first few days.</li>
          </ul>
        </>
      ),
    },
     {
      id: "troubleshooting",
      title: "Troubleshooting Common Problems",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      content: (
        <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-3">
          <li>
            <strong className="font-medium">Leggy Seedlings (Tall & Thin):</strong> This is almost always caused by not enough light. Move your light source closer to the seedlings (2-3 inches) or provide a stronger light source. A gentle fan also helps strengthen stems.
          </li>
          <li>
            <strong className="font-medium">Damping-Off Disease (Seedlings collapse at soil line):</strong> This fungal disease is caused by overwatering, poor air circulation, and non-sterile soil. To prevent it: use sterile mix, don't overwater, water from the bottom, and ensure good airflow with a fan.
          </li>
          <li>
            <strong className="font-medium">Poor or No Germination:</strong> Seeds may be old, the soil could be too cold or too dry, or they were planted too deep. Check seed packet for ideal conditions and ensure consistent moisture and warmth.
          </li>
           <li>
            <strong className="font-medium">Yellowing Leaves:</strong> Can be a sign of overwatering (check for soggy soil) or a lack of nutrients. If seedlings are older and have several sets of leaves, it may be time for a light feeding with half-strength liquid fertilizer.
          </li>
        </ul>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farm Management Hub
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Seed Starting & Seedling Care</CardTitle>
          </div>
          <CardDescription>
            A practical guide to successfully starting seeds indoors to get a head start on the growing season and produce strong, healthy plants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Giving your crops the best possible start is one of the most important steps in farming. This guide breaks down the process of seed starting, from choosing materials to transplanting healthy seedlings into your garden.
          </p>
          <Accordion type="single" collapsible className="w-full" defaultValue="why-start-indoors">
            {sections.map((section) => (
              <AccordionItem value={section.id} key={section.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {section.icon}
                    {section.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-4">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
