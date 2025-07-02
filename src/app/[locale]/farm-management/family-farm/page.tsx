
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, ArrowLeft, LayoutGrid, Sprout, ShoppingBasket, Recycle, Fish, Bug, Sun, Users, Edit2, BarChart2, Bird, Info, Droplets, ShieldCheck, Heart } from "lucide-react";

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
    title: "Overall Farm Design & Philosophy (10m x 20m)",
    icon: <LayoutGrid className="h-5 w-5 text-green-700" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Overall 200sqm Farm Layout Diagram",
    dataAiHint: "farm layout diagram",
    description: [
      "This 200 square meter (10m wide x 20m long) model is more than just a farm; it's a living ecosystem designed for your family's food security and well-being.",
      "The primary goal is **self-sustenance**: to grow enough diverse food to nourish your family of up to 12 people throughout the year. Surplus for income is a secondary benefit.",
      "It cleverly integrates various components – vegetable beds, fruit trees, aquaculture, and poultry – creating a resilient system where each part supports the others.",
      "Paths are designed for easy access, making daily tasks manageable for all family members."
    ],
    details: [
      "Prioritize Family Needs: Before planting anything, think about what your family eats most and what nutrients they need. This farm is for you first!",
      "Perimeter Fencing: Essential for security against pests and wandering animals. Consider live fencing (e.g., with nitrogen-fixing shrubs or fruit bushes) to maximize land use.",
      "Sun Orientation: Observe the sun's path. Place sun-loving plants (like tomatoes, peppers, maize) in the sunniest spots. Shade-tolerant plants (like some leafy greens, herbs) can go in partially shaded areas, perhaps near taller fruit trees.",
      "Water Flow & Conservation: Design for efficient water use. Think about how rainwater can be harvested and directed to beds or ponds. Plan for simple irrigation methods like watering cans or basic drip systems if water is scarce."
    ]
  },
  {
    id: "vegetable-production",
    title: "Intensive Vegetable Beds: Your Family's Daily Nourishment",
    icon: <Sprout className="h-5 w-5 text-green-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Intensive Vegetable Beds",
    dataAiHint: "vegetable garden rows",
    description: [
      "This is the heart of your food production! A 7m x 4m area with 8 raised beds (each about 0.75m wide) allows for a continuous supply of diverse vegetables.",
      "Raised beds improve drainage, make weeding easier, and allow you to build rich, fertile soil specifically for your vegetables.",
      "Practice bio-intensive methods: plant closely, practice succession planting (sowing small batches of seeds every few weeks), and intercrop (plant compatible crops together) to get the most out of this space."
    ],
    details: [
      "Start with Easy Crops: If you're new to this, begin with easy-to-grow, high-yielding crops like leafy greens (spinach, kale, local amaranth), radishes, beans, and local varieties of tomatoes or peppers. This builds confidence!",
      "Diverse Diet: Aim for a mix: leafy greens for vitamins, root crops (carrots, beets) for energy, fruiting vegetables (tomatoes, peppers, eggplants, okra, beans, cucumbers) for variety, and herbs for flavor and health.",
      "Rich Soil is Key: Feed your soil regularly with well-made compost. Healthy soil means healthy plants that resist pests and diseases, and provide more nutritious food.",
      "Mulch Generously: Cover the soil in your beds with organic mulch (straw, dry grass clippings, leaves). This keeps water in, stops weeds, and keeps the soil cool.",
      "Grow Upwards: Use trellises or stakes for climbing plants like beans, cucumbers, and some tomatoes. This saves valuable bed space.",
      "Continuous Harvest: Plan your planting so you have something to harvest for your family every week, rather than everything ripening at once."
    ]
  },
  {
    id: "fruit-tree-borders",
    title: "Fruit Tree Corridors: Long-Term Food & Nutrition Security",
    icon: <ShoppingBasket className="h-5 w-5 text-orange-500" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Fruit Trees along the border",
    dataAiHint: "fruit trees farm",
    description: [
      "Utilize the 20m long borders of your farm for a variety of fruit trees. These are a long-term investment in your family's nutrition and can provide shade and act as windbreaks.",
      "Suggested planting: Left Side - Moringa, Papaya, Guava, Mulberry. Right Side - Mango, Banana, Kaffir Lime & Lime Tree.",
      "These trees offer a continuous supply of fruits at different times of the year, adding essential vitamins and sweetness to your family's diet."
    ],
    details: [
      "Choose Wisely: Select dwarf or semi-dwarf varieties if available, as they are easier to manage in a small space. Prioritize trees that are well-suited to your local climate and soil.",
      "Nutritional Powerhouses: Moringa is a superfood! Its leaves and pods are packed with nutrients. Papayas and bananas provide quick fruit yields. Guavas, mulberries, mangoes, and limes offer a range of vitamins.",
      "Care and Pruning: Learn basic pruning techniques to keep trees healthy and productive. Ensure they get enough water, especially when young.",
      "Surplus Management: If your trees produce more fruit than your family can eat fresh, consider simple preservation methods like drying, making jams, or juicing."
    ]
  },
  {
    id: "aquaculture-zone",
    title: "Aquaculture: Fresh Protein from Fish & Snails",
    icon: <Fish className="h-5 w-5 text-blue-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Fish Ponds and Snail Rearing",
    dataAiHint: "fish ponds aquaculture",
    description: [
      "Integrating aquaculture provides a valuable and consistent source of protein for your family.",
      "Three fish ponds (each 3m x 3m) can house hardy and fast-growing species like Tilapia or Catfish.",
      "A section for Golden Apple Snail rearing offers an additional protein source or feed for poultry/fish.",
      "Small 1m x 3m vegetable beds between ponds can grow aquatic/semi-aquatic plants (like water spinach) or benefit from the pond's microclimate."
    ],
    details: [
      "Start Small & Simple: If new to aquaculture, start with one pond and a hardy fish species. Learn as you go.",
      "Water Quality is Vital: Ensure clean water. Pond water rich in fish waste is excellent for irrigating your vegetable beds – a perfect example of nutrient cycling!",
      "Supplemental Feeding: Fish can be fed with farm-grown supplements (e.g., Azolla from the water reservoir, duckweed, tender moringa leaves, leftover vegetable scraps) to reduce reliance on commercial feed.",
      "Snail Management: If rearing snails, ensure they are well-contained to prevent them from becoming pests to your vegetable crops. They can be a good source of protein for both family and poultry.",
      "Integration Benefit: The nutrient-rich water from fish ponds can significantly boost your vegetable production when used for irrigation."
    ]
  },
  {
    id: "poultry-mushroom-zone",
    title: "Poultry & Mushrooms: Eggs, Meat & Unique Flavors",
    icon: <Bird className="h-5 w-5 text-red-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Chicken Coop and Mushroom House",
    dataAiHint: "chicken coop mushrooms",
    description: [
      "A dedicated zone (approx. 4m deep) at one end houses chickens and a mushroom cultivation area, adding more protein and variety to your family's diet.",
      "Chicken Coop (4m x 6m): A small flock of chickens (e.g., 5-10 hens) can provide a regular supply of fresh eggs and occasional meat. Their manure is a fantastic fertilizer for your compost and garden.",
      "Mushroom Area (4m x 3m): Growing edible mushrooms (like oyster mushrooms) on agricultural waste (straw, sawdust) provides a unique, nutritious food source."
    ],
    details: [
      "Chicken Management: Consider a simple, secure coop that protects chickens from predators and weather. Allow them some space to forage if possible (controlled free-range). Feed can be supplemented with kitchen scraps and farm greens.",
      "Manure Gold: Chicken manure is very rich. Always compost it before adding it directly to garden beds to avoid burning plants.",
      "Mushroom Cultivation: This requires learning specific techniques for substrate preparation and maintaining the right humidity and temperature. Start with an easy-to-grow variety like oyster mushrooms.",
      "Waste to Value: Spent mushroom substrate (the material left after harvesting mushrooms) is an excellent soil conditioner for your vegetable beds."
    ]
  },
  {
    id: "support-systems",
    title: "Essential Support Systems: Compost & Water Management",
    icon: <Recycle className="h-5 w-5 text-amber-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Compost Area and Water Reservoir",
    dataAiHint: "compost pile water tank",
    description: [
      "These are the backbone of your farm's sustainability and long-term productivity.",
      "Compost Area (4m x 2m): All farm waste (crop residues, weeds, kitchen scraps, animal manure) is turned into 'black gold' here. Good compost is the secret to fertile soil and healthy plants.",
      "Water Reservoir / Azolla Pond (approx. 4m x 4m total): Vital for water storage, especially during dry seasons. Can also grow Azolla, a fast-growing fern that is excellent, protein-rich feed for chickens and fish, and a great green manure for your soil."
    ],
    details: [
      "Composting is Key: Make composting a priority. Refer to the 'Compost FGW' guide for detailed methods. A continuous supply of good compost means less need for buying fertilizers.",
      "Water Harvesting: Collect rainwater from any available rooftops (like the chicken coop) and direct it into your reservoir. Every drop counts!",
      "Efficient Irrigation: Use water wisely. Simple methods like watering cans for targeted watering or basic drip irrigation (if feasible) can make a big difference.",
      "Azolla Benefits: Azolla is easy to grow on the water surface. It fixes nitrogen, and when added to compost or directly to soil, it enriches it. It's also a great supplemental feed."
    ]
  },
  {
    id: "management-principles",
    title: "Guiding Principles: Bio-Intensive & Regenerative Farming",
    icon: <ShieldCheck className="h-5 w-5 text-purple-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Sustainable Farming Practices",
    dataAiHint: "sustainable farming infographic",
    description: [
      "This farm model is built on principles that work with nature to create a thriving, self-reliant system. The goal is to regenerate your land while feeding your family."
    ],
    subSections: [
      {
        title: "Feed the Soil, Not Just the Plants:",
        content: ["Focus on building healthy, living soil through regular compost application and mulching. Healthy soil grows healthy, nutrient-dense plants that are more resistant to pests and diseases, and provide more nutritious food."]
      },
      {
        title: "Nutrient Cycling (Closing Loops):",
        content: ["Animal manure and fish waste fertilize crops.", "Crop residues, weeds, and kitchen scraps are composted to create rich soil amendments.", "Azolla from the pond can supplement animal feed and add nitrogen to the soil. Aim to recycle all organic matter within the farm."]
      },
      {
        title: "Maximize Space & Time:",
        content: ["Use intensive planting techniques (close spacing) in raised beds.", "Grow vertically with trellises for climbing plants.", "Practice succession planting to ensure continuous harvests.", "Intercrop compatible plants to make the most of sunlight and soil resources."]
      },
      {
        title: "Water Wisely:",
        content: ["Harvest and store rainwater.", "Use mulch heavily on all garden beds to reduce water evaporation.", "Apply water directly to the plant roots where it's needed most."]
      },
      {
        title: "Embrace Biodiversity:",
        content: ["Grow a diverse range of crops, fruit trees, and even raise different types of small livestock. This creates a more resilient farm that can better withstand pests, diseases, and weather changes. It also provides a more balanced diet for your family."]
      },
      {
        title: "Natural Pest & Disease Management:",
        content: ["Healthy soil and diverse plantings are your first line of defense. Encourage beneficial insects by planting flowers. Use natural pest control methods (like KNF inputs or companion planting) if needed, avoiding harmful chemical pesticides."]
      }
    ]
  },
  {
    id: "family-sustenance",
    title: "Nourishing Your Family: The True Yield of This Farm",
    icon: <Heart className="h-5 w-5 text-teal-600" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Family enjoying farm produce",
    dataAiHint: "family harvest food",
    description: [
      "A well-managed 200sqm farm, like the one described, can make a massive contribution to the food security, nutrition, and overall well-being of a family of up to 12 people.",
      "Imagine harvesting fresh, chemical-free vegetables daily for your family's meals. Picking ripe fruits from your own trees. Enjoying fresh eggs and fish. This model makes it possible!"
    ],
    details: [
      "Balanced Diet: This farm is designed to provide a variety of foods – carbohydrates from root crops and some grains (if intercropped), proteins from poultry, fish, and legumes, and essential vitamins and minerals from diverse fruits and vegetables.",
      "Food Security: Reduce reliance on buying food, which can be expensive and uncertain. Growing your own gives you control over your family's food supply.",
      "Improved Nutrition & Health: Freshly harvested food is more nutritious. Knowing how your food is grown (without harmful chemicals) brings peace of mind.",
      "Involve the Family: This farm can be a family project. Working together to grow food teaches valuable skills, promotes teamwork, and connects everyone to the land and where their food comes from.",
      "Planning for Continuous Supply: Careful planning of what to plant and when is key. Stagger your plantings to ensure you have a continuous harvest rather than everything becoming ready at once.",
      "Record Keeping: Simple notes on what you planted, when, and how much you harvested can help you improve your farm management each season.",
      "Surplus as a Bonus: Once your family's food needs are met, any surplus can be sold locally, bartered with neighbors, or preserved for later use. This can provide a small additional income or help acquire things you don't produce."
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
              <CardTitle className="text-2xl md:text-3xl">The 200sqm Family Farm Model for Self-Sustenance</CardTitle>
              <CardDescription className="text-md">
                A practical guide to creating a highly productive 200m² (10m x 20m) farm that can nourish a family of up to 12 people using regenerative, bio-intensive methods. Focus on feeding your family first!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This model is designed to empower your family with food security and improved nutrition by creating a diverse, integrated, and resilient farming system in a small space. The primary aim is self-sufficiency, providing most of your family's food needs directly from your land. Any surplus for sale is a secondary benefit.
          </p>
          
          <div className="my-6">
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/damdoh-923bf.appspot.com/o/images%2F200sqm-farm-model-diagram.png?alt=media&token=65b4f9a4-d53b-49e3-8d74-3566d5f231a7" 
                alt="200sqm Integrated Family Farm Model Diagram"
                width={800}
                height={500}
                className="rounded-lg border shadow-md object-contain mx-auto"
                data-ai-hint="farm layout diagram"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">Detailed layout of the 200sqm integrated family farm.</p>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="overall-layout">
            {farmZones.map((zone) => (
              <AccordionItem value={zone.id} key={zone.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left"> {/* Added text-left for better trigger text alignment */}
                    {zone.icon}
                    {zone.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-3 text-muted-foreground">
                  <div className="grid md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-1 relative aspect-video md:aspect-square rounded-md overflow-hidden my-2">
                       <Image src={zone.imageSrc} alt={zone.imageAlt} fill={true} style={{objectFit:"cover"}} data-ai-hint={zone.dataAiHint}/>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      {zone.description.map((desc, index) => (
                        <p key={index}>{desc}</p>
                      ))}
                    </div>
                  </div>
                  {zone.details && zone.details.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-primary/30 space-y-1.5">
                      <h4 className="font-semibold text-foreground/90 text-md mb-1">Key Considerations & Practical Tips:</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {zone.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {zone.subSections && zone.subSections.length > 0 && (
                     <div className="mt-4 space-y-3">
                        {zone.subSections.map((sub, idx) => (
                           <div key={idx} className="pl-3 border-l-2 border-accent/50">
                              <h4 className="font-semibold text-foreground/90 text-md mb-1">{sub.title}</h4>
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
                <CardTitle className="text-xl text-green-700 dark:text-green-300 flex items-center gap-2"><Info className="h-5 w-5"/>Conclusion: Your Path to Family Food Security</CardTitle>
            </CardHeader>
            <CardContent className="text-green-600 dark:text-green-400 space-y-2 text-sm">
                <p>
                    This 200sqm Family Farm Model is a practical blueprint for transforming a small piece of land into a powerhouse of food production for your family. By focusing on bio-intensive, regenerative methods and integrating different farm components, you can achieve remarkable levels of self-sufficiency, improve your family's nutrition, and build a resilient food system right in your backyard.
                </p>
                <p>
                    Remember, the journey to self-sustenance is one of learning and adaptation. Start with what you can manage, observe your farm, and continuously improve. This model is a guide; feel free to adapt it to your local conditions, available resources, and family preferences. The ultimate goal is a thriving farm that supports a thriving family.
                </p>
                 <p className="font-semibold mt-2">
                    DamDoh is here to support you. Connect with other farmers, share your experiences, and access more resources on our platform to help you succeed.
                </p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
