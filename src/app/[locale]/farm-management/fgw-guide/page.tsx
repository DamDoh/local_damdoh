
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, ArrowLeft, Shield, CheckCircle, Droplets, Leaf } from "lucide-react";

interface FgwPrinciple {
  id: string;
  title: string;
  icon: React.ReactElement;
  summary: string;
  howTo: string[];
  whyItWorks: string[];
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
}

const fgwPrinciples: FgwPrinciple[] = [
  {
    id: "no-tillage",
    title: "No Tillage: Respecting God's Design",
    icon: <Shield className="h-5 w-5 text-amber-600" />,
    summary: "This is the foundational principle. We do not plow or turn the soil. Instead, we work with the soil structure God created, which protects it from erosion, conserves water, and fosters a rich environment for soil life.",
    howTo: [
      "Mark out permanent planting stations where you will plant your crops every season.",
      "Dig holes for planting only at these stations, leaving the rest of the soil completely undisturbed.",
      "Never walk on your planting beds, only on the designated pathways.",
      "This minimizes soil compaction and preserves the intricate web of life (worms, fungi, bacteria) within the soil."
    ],
    whyItWorks: [
      "Prevents soil erosion from wind and water.",
      "Increases water infiltration and retention, making farms more drought-resistant.",
      "Protects and nurtures the soil food web, which is essential for nutrient cycling.",
      "Reduces labor and fuel costs associated with plowing.",
      "Sequesters more carbon in the soil, helping to combat climate change."
    ],
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "A field with permanent planting holes and no-till soil.",
    dataAiHint: "no-till farming holes"
  },
  {
    id: "mulch",
    title: "God's Blanket: 100% Mulch Cover",
    icon: <Leaf className="h-5 w-5 text-green-600" />,
    summary: "In nature, God never leaves the soil bare. It's always covered with a blanket of fallen leaves and organic matter. We replicate this by keeping a thick, permanent layer of mulch on our fields at all times.",
    howTo: [
      "Gather locally available dry organic matter: grass, straw, leaves, maize stalks, etc.",
      "Apply a thick blanket (at least 4-6 inches or 10-15cm) over the entire field, between the planting stations.",
      "When planting, simply make a hole in the blanket at your planting station. Do not remove the blanket.",
      "Continuously add more organic matter to the blanket as it decomposes over time to maintain its thickness."
    ],
    whyItWorks: [
      "Conserves massive amounts of soil moisture by reducing evaporation.",
      "Suppresses almost all weed growth, dramatically reducing the labor of weeding.",
      "Regulates soil temperature, keeping it cool in the heat and warm in the cold.",
      "Feeds soil life as it breaks down, continuously building fertile topsoil.",
      "Prevents soil from being compacted by heavy rains."
    ],
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "A thick layer of mulch covering a field.",
    dataAiHint: "mulch field garden"
  },
  {
    id: "high-standards",
    title: "High Standards: Reflecting God's Excellence",
    icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
    summary: "This principle is about doing everything with excellence, without taking shortcuts, as a reflection of honoring God. It applies to every aspect of farming, from preparation to harvest.",
    howTo: [
      "Be on time: Prepare your land well before the rains, plant at the optimal time, and weed when weeds are small.",
      "Use accurate measurements for planting stations to ensure optimal plant spacing and straight lines.",
      "Be precise: Don't just throw seeds; place them carefully at the correct depth and spacing.",
      "Be thorough: When applying God's Blanket, ensure it is thick and covers everything. When harvesting, do so carefully to avoid losses."
    ],
    whyItWorks: [
      "Timeliness ensures you capitalize on natural cycles like rainfall, leading to better yields.",
      "Precision in planting gives each plant the best possible chance to thrive without competing for resources.",
      "Excellence in execution prevents problems before they start (e.g., thorough mulching prevents weeds).",
      "Fosters a mindset of stewardship and care, which translates to a healthier, more productive farm."
    ],
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "A neatly planted field with straight rows.",
    dataAiHint: "neat farm rows"
  },
  {
    id: "no-waste",
    title: "No Waste & With Joy: Stewarding Resources",
    icon: <Droplets className="h-5 w-5 text-teal-600" />,
    summary: "This extends beyond just physical materials. It's about a mindset of stewardship over everything God has provided: time, energy, resources, and opportunities. The 'with joy' aspect emphasizes farming with a grateful and positive heart.",
    howTo: [
      "Compost everything: All crop residues, kitchen scraps, and weeds are returned to the soil as valuable compost.",
      "Harvest everything: Ensure all of the harvest is collected and utilized, minimizing post-harvest loss.",
      "Use water wisely: Apply water only where needed and use God's Blanket to conserve it.",
      "Manage time and energy efficiently by following the high standards of timeliness and precision."
    ],
    whyItWorks: [
      "Creates a closed-loop system where the farm's fertility is constantly being replenished.",
      "Reduces or eliminates the need for costly external inputs like chemical fertilizers.",
      "Maximizes the profitability and sustainability of the farm.",
      "Farming with joy and gratitude leads to better mental well-being and a more positive approach to challenges."
    ],
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Compost pile on a farm.",
    dataAiHint: "compost pile farm"
  }
];

export default function FgwGuidePage() {
  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farm Management Hub
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">An Introduction to Farming God's Way (FGW)</CardTitle>
              <CardDescription className="text-md">
                Learn the core principles of this powerful, faith-based conservation agriculture method that restores land and transforms lives.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Farming God's Way is more than just a technique; it's a holistic solution to food security and poverty that helps farmers honor God in how they manage the land He has provided. It focuses on minimal soil disturbance, 100% soil cover, and executing all tasks with high standards. The results are remarkable: improved soil fertility, dramatically increased water retention, and higher yields with lower input costs.
          </p>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="no-tillage">
            {fgwPrinciples.map((principle) => (
              <AccordionItem value={principle.id} key={principle.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {principle.icon}
                    {principle.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-4 text-muted-foreground">
                  <p className="font-medium text-foreground/90">{principle.summary}</p>
                   <div className="grid md:grid-cols-2 gap-4 items-start">
                      <div className="space-y-3">
                         <div>
                            <h4 className="font-semibold text-foreground/90 text-md mb-1">How to Do It:</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {principle.howTo.map((step, index) => <li key={index}>{step}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground/90 text-md mb-1">Why It Works:</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {principle.whyItWorks.map((reason, index) => <li key={index}>{reason}</li>)}
                            </ul>
                        </div>
                      </div>
                       <div className="relative aspect-video md:aspect-auto md:h-full rounded-md overflow-hidden my-2">
                           <Image src={principle.imageSrc} alt={principle.imageAlt} fill={true} style={{objectFit:"cover"}} data-ai-hint={principle.dataAiHint}/>
                        </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
