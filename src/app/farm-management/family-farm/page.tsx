
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, ArrowLeft, LayoutGrid, Sprout, Droplets, Recycle, Fish, Bug, Sun, Users, ShoppingBasket, Edit2, BarChart2, Bird, Info } from "lucide-react";

interface FarmZone {
  id: string;
  title: string;
  icon: React.ReactElement;
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
  description: string[];
  details?: string[];
  subSections?: { title: string; content: string[] }[];
}

const farmZones: FarmZone[] = [
  {
    id: "overall-layout",
    title: "Overall Farm Layout & Design (10m x 20m)",
    icon: <LayoutGrid className="h-5 w-5 text-green-700" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Overall 200sqm Farm Layout Diagram",
    dataAiHint: "farm layout diagram",
    description: [
      "This 200 square meter (10m wide x 20m long) model is designed for maximum productivity and self-sufficiency.",
      "It cleverly integrates various components like vegetable beds, fruit trees, aquaculture, poultry, and support systems like composting and water harvesting.",
      "The walking paths are generally 1 meter wide, ensuring easy access to all parts of the farm."
    ],
    details: [
      "Perimeter Fencing: Essential for security and keeping out unwanted animals. Live fencing with beneficial plants can be considered.",
      "Sun Orientation: Observe the sun's path to place sun-loving plants in optimal spots and shade-tolerant ones accordingly.",
      "Water Flow: Design for efficient water use, considering runoff collection and irrigation for beds and ponds."
    ]
  },
  {
    id: "vegetable-production",
    title: "Intensive Vegetable Beds (Main Growing Area)",
    icon: <Sprout className="h-5 w-5 text-green-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Intensive Vegetable Beds",
    dataAiHint: "vegetable garden rows",
    description: [
      "The heart of the farm features a 7m wide x 4m long area with 8 raised beds. This allows for diverse vegetable cultivation.",
      "Raised beds (approx. 0.75m wide each) improve drainage, soil quality, and ease of access.",
      "Focus on bio-intensive methods: close planting, succession planting, and intercropping to maximize yield from this space."
    ],
    details: [
      "Suggested Crops: Leafy greens (lettuce, spinach, kale, amaranth), root crops (carrots, radishes, beets), fruiting vegetables (tomatoes, peppers, eggplants, beans, cucumbers), herbs (basil, cilantro, mint).",
      "Soil Preparation: Enrich beds heavily with compost before each planting season.",
      "Mulching: Use organic mulch (straw, grass clippings) to retain moisture, suppress weeds, and regulate soil temperature.",
      "Vertical Gardening: Utilize trellises for climbing plants like beans and cucumbers to save space."
    ]
  },
  {
    id: "fruit-tree-borders",
    title: "Fruit Tree Corridors (Perimeter Planting)",
    icon: <ShoppingBasket className="h-5 w-5 text-orange-500" />, // Changed icon
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Fruit Trees along the border",
    dataAiHint: "fruit trees farm",
    description: [
      "The 20m long borders of the farm are utilized for planting a variety of fruit trees.",
      "Left Side: Moringa, Papaya, Guava, Mulberry Tree.",
      "Right Side: Mango, Banana, Kaffir Lime & Lime Tree.",
      "These trees provide nutritious fruits, shade, and can act as windbreaks."
    ],
    details: [
      "Planting Considerations: Choose dwarf or semi-dwarf varieties where possible to manage size. Ensure adequate spacing for sunlight and root growth.",
      "Moringa: Highly nutritious leaves and pods. Fast-growing.",
      "Papaya & Banana: Provide quick fruit yields and can be intercropped when young.",
      "Guava & Mulberry: Hardy trees providing consistent fruit.",
      "Mango & Limes: Longer-term fruit production offering valuable vitamins."
    ]
  },
  {
    id: "aquaculture-zone",
    title: "Aquaculture: Fish Ponds & Snail Rearing",
    icon: <Fish className="h-5 w-5 text-blue-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Fish Ponds and Snail Rearing",
    dataAiHint: "fish ponds aquaculture",
    description: [
      "Three fish ponds (each 3m x 3m) are integrated into the system.",
      "Species can include Tilapia and Catfish, which are hardy and fast-growing.",
      "One section also appears dedicated to Golden Apple Snail rearing, a potential source of protein or feed.",
      "Small 1m x 3m vegetable beds are placed between the ponds, possibly benefiting from the humid microclimate or for growing aquatic/semi-aquatic plants."
    ],
    details: [
      "Water Quality: Regular monitoring and maintenance are crucial. Consider aeration if needed.",
      "Feeding: Fish can be fed with farm-grown supplements (e.g., Azolla from the water reservoir, kitchen scraps, moringa leaves) and commercial feed.",
      "Nutrient-Rich Water: Pond water, when partially drained or siphoned, is excellent for irrigating vegetable beds.",
      "Snail Management: Ensure snails are contained and managed to prevent them from becoming pests to other crops."
    ]
  },
  {
    id: "poultry-mushroom-zone",
    title: "Poultry (Chickens) & Mushroom Cultivation",
    icon: <Bird className="h-5 w-5 text-red-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Chicken Coop and Mushroom House",
    dataAiHint: "chicken coop mushrooms",
    description: [
      "A dedicated zone (approx. 4m deep) at one end of the farm houses chickens and a mushroom cultivation area.",
      "Chicken Coop (4m x 6m): Provides eggs and meat for the family. Manure is a valuable fertilizer.",
      "Mushroom Area (4m x 3m): Likely for growing edible mushrooms (e.g., oyster mushrooms) on agricultural waste or specific substrates. The image suggests a connection to Moringa, perhaps using its byproducts or benefiting from its shade."
    ],
    details: [
      "Chicken Management: Free-range or deep litter system can be used. Provide good housing, clean water, and balanced feed (can be supplemented with farm produce).",
      "Mushroom Cultivation: Requires specific conditions (humidity, temperature, shade). Substrate can be prepared from rice straw, sawdust, or other organic materials.",
      "Integration: Chicken manure enriches compost. Spent mushroom substrate is also an excellent soil conditioner."
    ]
  },
  {
    id: "support-systems",
    title: "Support Systems: Compost & Water Management",
    icon: <Recycle className="h-5 w-5 text-amber-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Compost Area and Water Reservoir",
    dataAiHint: "compost pile water tank",
    description: [
      "Compost Area (4m x 2m): Strategically placed for easy access to farm waste and for applying finished compost to beds.",
      "Water Reservoir / Azolla Pond (approx. 4m x 4m in total, split): Crucial for water storage, especially during dry periods. Can also be used to grow Azolla, a nitrogen-fixing fern that serves as excellent animal feed or green manure."
    ],
    details: [
      "Composting: Utilize all farm waste (crop residues, weeds, kitchen scraps, chicken manure) to create nutrient-rich compost (refer to the 'Compost FGW' guide for methods).",
      "Water Harvesting: Collect rainwater from rooftops (e.g., chicken coop) and direct it to the reservoir.",
      "Irrigation: Use water from the reservoir efficiently (e.g., drip irrigation, watering cans)."
    ]
  },
  {
    id: "management-principles",
    title: "Bio-Intensive & Regenerative Principles",
    icon: <Info className="h-5 w-5 text-purple-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Sustainable Farming Practices",
    dataAiHint: "sustainable farming infographic",
    description: [
      "This farm model thrives on closing loops and maximizing natural processes."
    ],
    subSections: [
      {
        title: "Nutrient Cycling:",
        content: ["Chicken manure and fish waste fertilize crops.", "Crop residues and kitchen scraps are composted to create rich soil amendments.", "Azolla from the pond can supplement animal feed and add nitrogen."]
      },
      {
        title: "Space Optimization:",
        content: ["Intensive planting in raised beds.", "Vertical growing for climbing plants.", "Perimeter planting of fruit trees."]
      },
      {
        title: "Water Conservation:",
        content: ["Rainwater harvesting into the reservoir.", "Use of mulch on vegetable beds.", "Efficient irrigation methods."]
      },
      {
        title: "Biodiversity:",
        content: ["A diverse range of crops and livestock creates a more resilient ecosystem.", "Attracts beneficial insects and pollinators."]
      },
      {
        title: "Natural Pest & Disease Management:",
        content: ["Promote healthy soil to grow strong, resistant plants.", "Encourage beneficial insects.", "Practice crop rotation.", "Use KNF inputs if desired."]
      }
    ]
  },
  {
    id: "family-sustenance",
    title: "Sustaining a Family of 12",
    icon: <Users className="h-5 w-5 text-teal-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Family enjoying farm produce",
    dataAiHint: "family harvest food",
    description: [
      "A well-managed 200sqm farm like this can significantly contribute to the food security and nutritional needs of a family of 12.",
      "Vegetables: Continuous harvest of diverse vegetables provides daily vitamins and minerals.",
      "Fruits: Seasonal fruits from the trees offer variety and essential nutrients.",
      "Protein: Eggs and chicken meat from poultry, fish from the ponds, and potentially snails.",
      "Mushrooms: An additional source of protein and unique flavors.",
      "Moringa: A superfood, rich in vitamins and minerals.",
      "Potential for Surplus: Efficient management may yield surplus produce that can be sold or bartered, providing a small income stream."
    ],
    details: [
      "Labor: Requires consistent effort from family members. Dividing tasks can make it manageable.",
      "Planning: Careful planning of planting and harvesting schedules is key to continuous supply.",
      "Record Keeping: Simple records of planting dates, yields, and inputs/outputs help in optimizing the system over time."
    ]
  }
];

export default function FamilyFarmPage() {
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
            <Home className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">The 200sqm Family Farm Model</CardTitle>
              <CardDescription className="text-md">
                A detailed guide to establishing and managing a highly productive 200m² (10m x 20m) family farm using bio-intensive and regenerative methods for self-sustenance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This model is designed to provide significant food security for a family of up to 12 people by integrating diverse food production systems within a small, manageable space. It emphasizes sustainable practices, resource efficiency, and biodiversity.
          </p>
          
          <div className="my-6">
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/damdoh-923bf.appspot.com/o/images%2F200sqm-farm-model-diagram.png?alt=media&token=65b4f9a4-d53b-49e3-8d74-3566d5f231a7" // Using the image directly
                alt="200sqm Integrated Family Farm Model Diagram"
                width={800}
                height={500}
                className="rounded-lg border shadow-md object-contain mx-auto"
                data-ai-hint="farm layout diagram"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">Detailed layout of the 200sqm integrated family farm.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {farmZones.map((zone) => (
              <AccordionItem value={zone.id} key={zone.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    {zone.icon}
                    {zone.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-3 text-muted-foreground">
                  <div className="grid md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-1 relative aspect-video md:aspect-square rounded-md overflow-hidden my-2">
                       <Image src={zone.imageSrc} alt={zone.imageAlt} layout="fill" objectFit="cover" data-ai-hint={zone.dataAiHint}/>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      {zone.description.map((desc, index) => (
                        <p key={index}>{desc}</p>
                      ))}
                    </div>
                  </div>
                  {zone.details && zone.details.length > 0 && (
                    <div className="mt-2 pl-2 border-l-2 border-primary/30 space-y-1">
                      <h4 className="font-semibold text-foreground/90 text-sm">Key Considerations:</h4>
                      <ul className="list-disc list-inside text-sm space-y-0.5">
                        {zone.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {zone.subSections && zone.subSections.length > 0 && (
                     <div className="mt-3 space-y-2">
                        {zone.subSections.map((sub, idx) => (
                           <div key={idx} className="pl-2">
                              <h4 className="font-semibold text-foreground/90 text-sm mb-0.5">{sub.title}</h4>
                              <ul className="list-disc list-inside text-sm space-y-0.5">
                                 {sub.content.map((item, itemIdx) => <li key={itemIdx}>{item}</li>)}
                              </ul>
                           </div>
                        ))}
                     </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 mt-6">
            <CardHeader>
                <CardTitle className="text-xl text-green-700 dark:text-green-300 flex items-center gap-2"><Info className="h-5 w-5"/>Conclusion & Path Forward</CardTitle>
            </CardHeader>
            <CardContent className="text-green-600 dark:text-green-400 space-y-2">
                <p>
                    The 200sqm Family Farm Model is a testament to how small spaces can be transformed into productive, life-sustaining ecosystems. By applying bio-intensive and regenerative principles, families can achieve a high degree of food self-sufficiency, improve their nutrition, and even generate modest income.
                </p>
                <p>
                    Success requires dedication, continuous learning, and adaptation to local conditions. DamDoh encourages you to explore this model, adapt it to your specific needs, and connect with other farmers on the platform to share experiences and knowledge.
                </p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
