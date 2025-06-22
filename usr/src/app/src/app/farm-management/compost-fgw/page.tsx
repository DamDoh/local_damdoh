
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Recycle, ArrowLeft, Leaf, Droplets, Sprout, CheckCircle, Thermometer, Layers, Info, BookOpen, AlertTriangle, PackageIcon, PawPrint } from "lucide-react";

export default function CompostFGWPage() {
  const compostSections = [
    {
      id: "why-compost",
      title: "Why Make Compost? (Farming God's Way Principles)",
      icon: <Sprout className="h-5 w-5 text-green-600" />,
      content: (
        <>
          <p className="text-muted-foreground">
            In Farming God's Way, we are called to be good stewards of the land God has entrusted to us. Making compost is a wonderful way to do this. Good compost is like "black gold" for your soil. It helps:
          </p>
          <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
            <li><strong className="font-medium">Feed Your Soil:</strong> It makes your soil rich and full of life, improving its structure.</li>
            <li><strong className="font-medium">Hold Water:</strong> Healthy soil with compost holds water much better, so your plants are less likely to suffer during dry spells.</li>
            <li><strong className="font-medium">Provide Nutrients:</strong> It slowly releases food (nutrients) for your plants, helping them grow strong and healthy without needing expensive chemical fertilizers.</li>
            <li><strong className="font-medium">Reduce Waste:</strong> You can turn farm and kitchen waste (like leftover plants and vegetable scraps) into something valuable.</li>
            <li><strong className="font-medium">Protect God's Creation:</strong> By recycling nutrients and improving the soil, we care for the environment.</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Farming God's Way emphasizes minimal soil disturbance, using "God's Blanket" (mulch), and practicing high standards. Compost is a key ingredient in achieving these standards and improving your land faithfully.
          </p>
        </>
      )
    },
    {
      id: "materials",
      title: "What You Need (Materials for Good Compost)",
      icon: <PackageIcon className="h-5 w-5 text-primary" />,
      content: (
        <>
          <p className="text-muted-foreground mb-2">To make good compost, you need a mix of "Green" materials (which are moist and provide nitrogen), "Brown" materials (which are dry and provide carbon), and ideally, some good "Animal Manure". Aim for roughly 2-3 parts Brown to 1 part Green by volume if possible, but don't worry too much about exact ratios to start – a good mix is key, and manure will supercharge it.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-md mb-1 text-green-700 flex items-center gap-1.5"><Leaf className="h-4 w-4"/>Greens (Nitrogen-Rich, Wet & Fresh):</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li>Fresh grass clippings and young weeds (best before they produce seeds)</li>
                <li>Kitchen scraps: fruit and vegetable peelings, coffee grounds, tea bags (NO meat, bones, oily foods, dairy products, or diseased plants - <AlertTriangle className="inline h-4 w-4 text-amber-500" /> these can attract pests or cause problems)</li>
                <li>Fresh leaves from non-oily plants and trees</li>
                <li>Plant cuttings from pruning</li>
                <li>Seaweed (if available, rinse off salt)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-md mb-1 text-amber-700 flex items-center gap-1.5"><Droplets className="h-4 w-4"/>Browns (Carbon-Rich, Dry & Woody):</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li>Dry leaves, dried grass, and straw</li>
                <li>Small twigs and shredded branches (chop them small)</li>
                <li>Maize (corn) stalks, cobs (chopped or broken into small pieces)</li>
                <li>Torn-up newspaper (black and white print only, no glossy magazines), shredded cardboard (plain, no waxy coatings)</li>
                <li>Sawdust (use sparingly and mix well, preferably from untreated wood)</li>
                <li>Pine needles (use sparingly as they are acidic)</li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-md mb-1 text-orange-600 flex items-center gap-1.5"><PawPrint className="h-4 w-4"/>Animal Manure (Excellent Activator):</h3>
            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
              <li>Manure from herbivores like cows, goats, sheep, chickens, rabbits, horses is excellent. It adds rich nutrients and helps the pile heat up.</li>
              <li>Fresh manure is best mixed with "Brown" materials. Aged manure can be added more freely.</li>
              <li><AlertTriangle className="inline h-4 w-4 text-amber-500" /> Avoid dog, cat, or pig manure as they can contain harmful pathogens.</li>
              <li>If using chicken manure, use it sparingly as it's very rich in nitrogen and can make the pile too hot or smell of ammonia if overused.</li>
            </ul>
          </div>
          <p className="text-muted-foreground mt-4"><strong className="font-medium">Also Very Important:</strong></p>
          <ul className="list-disc list-inside text-muted-foreground pl-5 mt-1 space-y-1 text-sm">
              <li><strong className="font-medium">Water:</strong> Essential to keep the pile moist like a well-squeezed sponge.</li>
              <li><strong className="font-medium">A Good Location:</strong> A flat, well-drained spot. Some shade can help prevent the pile from drying out too quickly, especially in hot climates. Ensure it's not too close to water sources to avoid contamination.</li>
              <li><strong className="font-medium">(Optional but Recommended) A Little Soil or Finished Compost:</strong> Sprinkling some good garden soil or a bit of finished compost between layers helps introduce beneficial microorganisms to speed up the process.</li>
          </ul>
        </>
      )
    },
    {
      id: "build-pile",
      title: "How to Build Your Compost Pile (Step-by-Step)",
      icon: <Layers className="h-5 w-5 text-amber-600" />,
      content: (
        <ol className="list-decimal list-inside text-muted-foreground space-y-3 pl-5">
          <li>
            <strong className="font-medium">Choose Your Spot & Size:</strong> Find a suitable location. A good size for a compost pile is about 1 meter wide x 1 meter long x 1 meter high (3-4 feet cube). This size helps the pile heat up properly. You can make it larger if you have lots of materials.
          </li>
          <li>
            <strong className="font-medium">Prepare the Base:</strong> Loosen the soil at the base of where your pile will be. Then, lay down a first layer of coarse "Brown" materials like small twigs or chopped maize stalks (about 4-6 inches or 10-15cm thick). This helps with aeration (air flow) and drainage from the bottom.
          </li>
          <li>
            <strong className="font-medium">Start Layering:</strong>
            <ul className="list-disc list-inside pl-6 mt-1 space-y-1 text-sm">
              <li><strong className="font-medium">Brown Layer:</strong> Add a layer of "Brown" materials (e.g., dry leaves, straw) about 6-8 inches (15-20cm) thick.</li>
              <li><strong className="font-medium">Green Layer:</strong> Add a thinner layer of "Green" materials (e.g., kitchen scraps, fresh grass) about 3-4 inches (7-10cm) thick.</li>
              <li><strong className="font-medium">Manure Layer (If Using):</strong> If you have manure, add a layer of it (1-2 inches or 2-5cm, or mix it with the green layer).</li>
              <li><strong className="font-medium">(Optional) Soil/Compost Sprinkle:</strong> Lightly sprinkle a thin layer of garden soil or finished compost over the green/manure layer.</li>
              <li><strong className="font-medium">Water Gently:</strong> Sprinkle water over the layers so they are damp, but not soaking wet. It should feel like a wrung-out sponge.</li>
            </ul>
          </li>
          <li>
            <strong className="font-medium">Repeat Layers:</strong> Continue alternating these layers (Brown, Green, optional Manure, optional Soil/Compost, Water) until your pile reaches the desired height (about 1 meter or 3-4 feet). Try to make the pile wider at the base and slightly tapered towards the top, like a loaf of bread or a small mound.
          </li>
          <li>
            <strong className="font-medium">Shape the Top:</strong> It's good to make a slight dip or depression in the center of the top of the pile to help catch rainwater.
          </li>
          <li>
            <strong className="font-medium">Cover Your Pile ("God's Blanket"):</strong> Finish with a thicker layer of "Brown" material on top (like straw or dry grass), about 4-6 inches (10-15cm). This is "God's Blanket." It helps to:
            <ul className="list-disc list-inside pl-6 mt-1 space-y-1 text-sm">
                <li>Keep moisture in.</li>
                <li>Prevent the pile from getting too wet from heavy rain.</li>
                <li>Keep flies away.</li>
                <li>Maintain a more even temperature.</li>
            </ul>
             You can also use a piece of old carpet (natural fibers only), hessian sacks, or a compost cover sheet if available, but ensure there's still some air circulation.
          </li>
        </ol>
      )
    },
    {
      id: "care",
      title: "Taking Care of Your Compost (Maintenance)",
      icon: <Thermometer className="h-5 w-5 text-red-500" />,
      content: (
        <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-2">
          <li>
            <strong className="font-medium">Maintain Moisture:</strong> Your compost pile needs to be consistently moist, like a squeezed sponge. Check it every few days, especially in dry weather. If you dig into the center and it feels dry, add water. If it's too wet (smells bad or is slimy), you might need to add more dry "Brown" materials and turn it.
          </li>
          <li>
            <strong className="font-medium">Monitor Temperature:</strong> A well-working compost pile will heat up in the center (it can get quite hot, 55-65°C or 130-150°F). This heat is good as it kills weed seeds and harmful germs. You can feel the heat by pushing a stick or metal rod into the center for a few minutes, then pulling it out. If it's not heating up, it might be too dry, too wet, or need more "Green" materials (or manure).
          </li>
          <li>
            <strong className="font-medium">Turn the Pile (Mixing for Aeration):</strong> Turning the pile is important to provide air (oxygen) to the microorganisms doing the work and to ensure all materials decompose evenly.
            <ul className="list-disc list-inside pl-6 mt-1 space-y-1 text-sm">
                <li><strong className="font-medium">When to Turn:</strong> A good time to first turn the pile is after about 2-4 weeks, especially if it has heated up and started to cool down. After that, turn it every 2-4 weeks.</li>
                <li><strong className="font-medium">How to Turn:</strong> Use a pitchfork or shovel. Move the material from the outside of the pile to the center, and the material from the center to the outside. Try to break up any clumps. Add water if it's dry as you turn.</li>
            </ul>
          </li>
          <li><strong className="font-medium">Troubleshooting:</strong>
            <ul className="list-disc list-inside pl-6 mt-1 space-y-1 text-sm">
                <li><strong className="font-medium">Bad Smell (like ammonia or rotten eggs):</strong> Pile is likely too wet or has too much "Green" material/fresh manure. Add more "Browns" and turn it.</li>
                <li><strong className="font-medium">Pile is Not Heating Up:</strong> Could be too dry (add water), too small, not enough "Greens"/manure (add more and mix), or too cold (try to make it bigger or insulate it).</li>
                <li><strong className="font-medium">Pests (like rats):</strong> Avoid adding meat, dairy, or oily foods. Ensure kitchen scraps are buried in the center of the pile. A well-managed hot pile usually deters pests.
                </li>
            </ul>
          </li>
        </ul>
      )
    },
    {
      id: "ready",
      title: "When is Your Compost Ready?",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      content: (
        <>
          <p className="text-muted-foreground">
            Your compost is generally ready to use when:
          </p>
          <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
            <li>It looks dark brown or black, and crumbly (like rich soil).</li>
            <li>It has a pleasant, earthy smell (like a forest floor after rain). It should not smell like ammonia or rotting food.</li>
            <li>You can no longer easily identify the original materials you put in (most leaves, grass, and food scraps have broken down).</li>
            <li>The pile has shrunk in size (often to about 1/3 or 1/2 of its original volume).</li>
            <li>The temperature of the pile has cooled down to near the air temperature.</li>
          </ul>
          <p className="text-muted-foreground mt-2">This process can take anywhere from 2 to 6 months, or even longer, depending on the materials used, the size of the pile, moisture levels, how often it's turned, and the climate. Be patient; it's a natural process!</p>
        </>
      )
    },
    {
      id: "usage",
      title: "How to Use Your Good Compost",
      icon: <Droplets className="h-5 w-5 text-blue-500" />,
      content: (
        <>
          <p className="text-muted-foreground">
            Finished compost is incredibly beneficial for your farm:
          </p>
          <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
            <li><strong className="font-medium">Improving Garden Beds:</strong> Before planting, spread a layer of compost (1-2 inches or 2-5cm) over your garden beds and gently mix it into the top few inches of soil with a fork or hoe.</li>
            <li><strong className="font-medium">Planting Seedlings or Seeds:</strong> Add a handful or two of compost into each planting hole when transplanting seedlings or sowing seeds. This gives them a great start.</li>
            <li><strong className="font-medium">Top Dressing / Mulching ("God's Blanket"):</strong> Spread a layer of compost around your growing plants (vegetables, fruit trees). This acts as a mulch to keep the soil moist, suppress weeds, and slowly feed the plants. Keep it a few inches away from the plant stems.</li>
            <li><strong className="font-medium">Making Potting Mix:</strong> Mix compost with soil and other ingredients (like sand or perlite, if needed) to create a rich potting mix for starting seeds or growing plants in containers.</li>
            <li><strong className="font-medium">Revitalizing Old Soil:</strong> Compost can bring life back to tired, depleted soils.</li>
            <li><strong className="font-medium">Compost Tea:</strong> You can also make compost tea by steeping some finished compost in water, then using the liquid to water your plants for a nutrient boost.</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            You can screen your compost through a wire mesh to get a finer material for specific uses like seed starting, but unscreened compost is fine for general garden use.
          </p>
        </>
      )
    },
    {
      id: "reminders",
      title: "Important Reminders (Farming God's Way)",
      icon: <BookOpen className="h-5 w-5 text-primary" />,
      content: (
        <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
            <li><strong className="font-medium">Do it with High Standards:</strong> Take care when selecting materials, building your pile, and looking after it. Do everything well, as unto God. Excellence honours God.</li>
            <li><strong className="font-medium">Use What God Provides:</strong> Focus on using materials readily available on your farm or locally. This is good stewardship and reduces costs. Avoid waste by recycling organic matter.</li>
            <li><strong className="font-medium">Be Faithful and Patient:</strong> Good compost takes time. Trust the natural process God designed. Consistent care will yield good results.</li>
            <li><strong className="font-medium">Observe and Learn:</strong> Pay attention to your compost pile. You'll learn what works best in your specific conditions.</li>
            <li><strong className="font-medium">Safety First:</strong> When handling manure or turning compost, wear gloves and wash your hands thoroughly afterwards.</li>
        </ul>
      )
    }
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
            <Recycle className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Making Good Compost: Farming God's Way</CardTitle>
          </div>
          <CardDescription>
            A simple, practical guide to creating rich compost to feed your soil and grow healthy plants, following God's principles of stewardship.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
                Farming God's Way emphasizes stewarding the land well. Creating and using good compost is a key part of this, utilizing natural materials to enrich the soil God has provided and to grow crops for His glory. This guide will help you make excellent compost with high standards.
            </p>
            <Accordion type="single" collapsible className="w-full" defaultValue="why-compost">
              {compostSections.map((section) => (
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
