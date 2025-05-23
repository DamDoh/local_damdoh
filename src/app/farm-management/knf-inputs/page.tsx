
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FlaskConical, ArrowLeft, Leaf, Droplets, Sprout, CheckCircle, Fish, Egg, Thermometer, Beaker, Wheat, Zap, Atom, Users } from "lucide-react";

export default function KNFInputsPage() {
  const knfInputs = [
    {
      id: "imo",
      title: "Indigenous Microorganisms (IMO)",
      icon: <Sprout className="h-6 w-6 text-green-700" />,
      purpose: "The cornerstone of KNF, a collection of beneficial local microbes that enrich your soil, improve nutrient cycling, and suppress diseases.",
      sections: [
        {
          subtitle: "IMO1: Collecting Local Microbes",
          purpose: "To capture a diverse range of strong, native microorganisms from your local environment (forest floor, undisturbed soil).",
          materials: [
            "Wooden box (cedar or pine, not treated), or a bamboo container",
            "Hard-cooked rice (slightly undercooked is better than mushy)",
            "Porous paper (like paper towel or traditional Korean paper 'hanji')",
            "String or rubber band",
            "A sheltered, undisturbed location with rich soil (e.g., under deciduous trees, near bamboo groves)",
            "Wire mesh or net to protect from animals"
          ],
          steps: [
            "Cook rice until it's firm, not soft. Let it cool slightly.",
            "Fill the wooden box or bamboo container about 2/3 full with the cooked rice. Do not pack it too tightly.",
            "Cover the box opening with porous paper and secure it. This allows air exchange but keeps out dirt.",
            "Choose a location with healthy, undisturbed soil, ideally with plenty of leaf litter.",
            "Bury the box about 2/3 deep into the soil. Protect it from rain and direct sunlight with leaves or a small cover. Use wire mesh to prevent animals.",
            "Leave for 3-7 days. The time depends on temperature (faster in warmer weather).",
            "Carefully dig up the box. You should see a growth of white, fluffy mold on the rice. This is IMO1. Avoid rice with black, green, orange, or other brightly colored molds."
          ],
          usage: "IMO1 is the starter culture for IMO2."
        },
        {
          subtitle: "IMO2: Cultivating the Microbes",
          purpose: "To increase the population of the collected microbes and stabilize them with a food source.",
          materials: [
            "The collected IMO1 (rice with white mold)",
            "Rice bran or wheat bran (equal in weight to the IMO1)",
            "Clean water (if needed, preferably de-chlorinated)",
            "Container for mixing (e.g., clay pot, plastic tub)",
            "Breathable cover (e.g., straw mat, cloth)"
          ],
          steps: [
            "Gently mix the IMO1 (moldy rice) with an equal weight of rice bran. Break up clumps of rice carefully.",
            "Check moisture content. It should be around 65-70%. When you squeeze a handful, it should clump together but crumble easily when pressed. If too dry, add a tiny bit of clean water and mix well.",
            "Place the mixture in a container, not packing it down. It can be piled loosely.",
            "Cover with a breathable material.",
            "Store in a shaded, well-ventilated area, protected from rain.",
            "The pile should generate some heat (ideal temperature 40-50°C or 104-122°F). If it gets too hot, turn or spread the mixture to cool it down.",
            "IMO2 is ready in about 5-7 days. It should have a pleasant, sweet, fermented smell and be covered in white mycelium."
          ],
          usage: "IMO2 can be further processed into IMO3 (mixed with soil and more bran) and IMO4 (mixed with local soil and nutrients like rock dust) for direct soil application or to enrich compost. IMO is foundational and supports all plant growth stages by improving soil health."
        }
      ]
    },
    {
      id: "fpj",
      title: "Fermented Plant Juice (FPJ)",
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      purpose: "Extracts nutrients, enzymes, and growth hormones from plant parts to stimulate plant growth, especially during the vegetative stage.",
      materials: [
        "Fast-growing plant parts (e.g., tips of sweet potato vines, bamboo shoots, young leaves, unripe fruits - choose plants that are vigorous in your area)",
        "Brown sugar (equal weight to the plant parts)",
        "Clean glass or clay jar",
        "Porous paper and string/rubber band"
      ],
      steps: [
        "Collect plant parts early in the morning when they are most turgid. Do not wash them (to preserve microbes on the surface).",
        "Chop or cut the plant parts into smaller pieces if they are large.",
        "Weigh the plant material and an equal amount of brown sugar.",
        "In the jar, layer the plant material and brown sugar. Start with sugar, then plants, then sugar, and so on, ending with a layer of sugar on top.",
        "Fill the jar about 2/3 full to allow for expansion and liquid extraction.",
        "Cover the jar opening with porous paper and secure it.",
        "Store in a cool, dark, and shaded place for 7-10 days.",
        "After 7-10 days, a liquid (FPJ) will be extracted. Strain the liquid from the plant solids.",
        "The plant solids can be added to compost or used as mulch."
      ],
      usage: "Dilute heavily with water, typically 1:500 to 1:1000 (e.g., 1-2ml of FPJ per 1 liter of water). Apply as a foliar spray or soil drench. Best used during the plant's vegetative growth stage (leafy growth) to provide nitrogen and growth stimulants."
    },
    {
      id: "faa",
      title: "Fish Amino Acid (FAA)",
      icon: <Fish className="h-6 w-6 text-blue-600" />,
      purpose: "A potent liquid fertilizer rich in nitrogen, amino acids, and nutrients for vigorous plant growth, especially for leafy green vegetables and during periods of active growth.",
      materials: [
        "Fish parts (heads, bones, guts, scraps – blue-backed fish like mackerel or sardines are good; avoid overly oily fish if possible)",
        "Brown sugar (equal weight to the fish parts)",
        "Large glass or food-grade plastic jar with a wide mouth",
        "Porous paper (paper towel) and string/rubber band"
      ],
      steps: [
        "If fish parts are large, chop them into smaller pieces.",
        "In the jar, layer the fish parts and brown sugar in a 1:1 ratio by weight. Ensure all fish parts are well coated with sugar.",
        "Leave some headspace in the jar (about 1/3 empty).",
        "Cover the jar opening with porous paper and secure it.",
        "Store in a cool, dark, and shaded place.",
        "Over time (3-6 months, or even longer for a more potent FAA), the fish will break down and liquefy due to osmosis and fermentation.",
        "The final product will be a dark liquid. Strain if desired."
      ],
      usage: "Dilute heavily with water, typically 1:500 to 1:1000 (e.g., 1-2ml of FAA per 1 liter of water). Apply as a foliar spray or soil drench. Excellent during vegetative growth and when plants need a nitrogen boost. Can also be used to activate IMO."
    },
    {
      id: "wca",
      title: "Water-Soluble Calcium (WCA)",
      icon: <Egg className="h-6 w-6 text-orange-400" />,
      purpose: "Provides readily available calcium to plants, strengthening cell walls, improving fruit quality and storability, and preventing calcium-deficiency disorders like blossom-end rot.",
      materials: [
        "Eggshells (chicken eggshells are common)",
        "Vinegar (brown rice vinegar is traditionally preferred, but apple cider vinegar or white vinegar can also be used)",
        "Glass jar"
      ],
      steps: [
        "Wash the eggshells thoroughly to remove any membrane or residue. Dry them completely.",
        "Roast or pan-fry the dry eggshells until they are slightly browned or lightly charred. This makes them brittle. Be careful not to burn them black.",
        "Once cooled, crush the roasted eggshells into small pieces or a coarse powder.",
        "Place the crushed eggshells in the glass jar.",
        "Add vinegar to the jar, using about 5-10 times the volume of vinegar to eggshells (e.g., if you have 1 cup of crushed eggshells, use 5-10 cups of vinegar). Eggshells should be fully submerged.",
        "You will see bubbles forming as the acetic acid in the vinegar reacts with the calcium carbonate in the eggshells.",
        "Cover the jar loosely (e.g., with a lid not fully tightened, or porous paper) to allow gases to escape.",
        "Leave the mixture until the bubbling stops. This can take 5-10 days. The liquid is your WCA. Strain if desired."
      ],
      usage: "Dilute with water, typically 1:1000 (e.g., 1ml of WCA per 1 liter of water). Apply as a foliar spray, especially during the plant's reproductive stages (flowering and fruiting) to support fruit development and prevent deficiencies. Can also be applied to soil."
    },
     {
      id: "lab",
      title: "Lactic Acid Bacteria (LAB)",
      icon: <Atom className="h-6 w-6 text-yellow-500" />,
      purpose: "Enhances soil health by aiding in decomposition of organic matter, improving nutrient availability, and suppressing harmful pathogens. Strengthens plant immunity and resilience.",
      materials: [
        "Rice wash water (the milky water from rinsing rice before cooking)",
        "Fresh milk (preferably unpasteurized, full-fat)",
        "Tall clear jar or container",
        "Porous paper or cheesecloth and string/rubber band"
      ],
      steps: [
        "Collect rice wash water. The first or second rinse is best. Let it settle for a bit.",
        "Fill a tall jar about 1/2 to 2/3 full with the rice wash water. Cover with porous paper and secure.",
        "Leave in a cool, dark place for 3-7 days (depending on temperature). A slightly sour smell indicates fermentation.",
        "Carefully pour the clear liquid from the fermented rice wash into another clean jar, leaving behind any sediment. This clear liquid contains LAB.",
        "Add fresh milk to this LAB liquid in a ratio of 1 part LAB liquid to 10 parts milk (e.g., 100ml LAB liquid to 1 liter milk).",
        "Cover this mixture with porous paper and leave in a cool, dark place for 5-7 days.",
        "The mixture will separate into three layers: a top layer of curd (cheese-like), a middle layer of clear yellowish liquid (whey - this is your concentrated LAB serum), and a bottom layer of sediment.",
        "Carefully skim off the top curd layer (can be fed to animals or composted).",
        "Gently collect the middle yellowish whey. This is your LAB serum. Store in the refrigerator."
      ],
      usage: "Dilute heavily with water, typically 1:500 to 1:1000 for foliar spray or soil drench. LAB can be used throughout the plant's life cycle. It helps improve soil structure, aids in composting, can clean livestock areas (odor control), and improve nutrient uptake by plants. Do not use with OHN as they can counteract each other."
    },
    {
      id: "ohn",
      title: "Oriental Herbal Nutrient (OHN)",
      icon: <Beaker className="h-6 w-6 text-purple-600" />,
      purpose: "A complex fermented plant extract used to boost plant immunity, vitality, and resilience against pests and diseases. Considered a general 'plant medicine'.",
      sections: [
        {
          subtitle: "Overview and Complexity",
          purpose: "OHN is one of KNF's most potent inputs, often made by fermenting specific herbs like Angelica, Cinnamon, Licorice, Garlic, and Ginger in alcohol and brown sugar. The process is lengthy and precise.",
          materials: [
            "Specific dried herbs (e.g., Angelica gigas roots, Cinnamon bark, Licorice roots, Garlic bulbs, Ginger rhizomes - ratios vary by recipe)",
            "Alcohol (e.g., Soju, Vodka - around 30-40% ABV)",
            "Brown sugar",
            "Large glass jars"
          ],
          steps: [
            "Typically, each herb (or herb group) is tinctured in alcohol for a period.",
            "Then, brown sugar is added to these tinctures for a second fermentation.",
            "After several months, these individual herbal ferments are combined in specific ratios and aged further.",
            "The full process can take 6 months to a year or more to achieve optimal potency."
          ],
          usage: "OHN is used in very dilute solutions (e.g., 1:1000 or less) as a foliar spray or soil drench to strengthen plants, improve their overall health, and enhance resistance to stress, pests, and diseases. It's used throughout the plant's life cycle, with concentrations varying. **Note:** Due to its complex and lengthy preparation, it's recommended to learn OHN making from experienced KNF practitioners or reliable, detailed KNF resources. This guide provides an overview."
        }
      ]
    },
    {
      id: "brv",
      title: "Brown Rice Vinegar (BRV)",
      icon: <Zap className="h-6 w-6 text-amber-600" />, 
      purpose: "BRV is used in KNF for several purposes: as a sterilizing agent, to help make nutrients more available to plants, and to regulate plant metabolism. It can also enhance the effectiveness of other inputs.",
      sections: [
        {
          subtitle: "Making BRV (Simplified Overview)",
          materials: [
            "Cooked brown rice",
            "Water",
            "Yeast (for alcohol fermentation)",
            "Mother of vinegar (acetic acid bacteria culture)"
          ],
          steps: [
            "Brown rice is cooked and fermented with yeast to produce rice wine (alcohol).",
            "The rice wine is then exposed to air and acetic acid bacteria (mother of vinegar) to convert the alcohol into acetic acid, creating vinegar.",
            "This process takes several weeks to months and requires careful management of aeration and temperature."
          ],
          usage: "Due to the complexity of making high-quality BRV, many KNF practitioners purchase good quality, unpasteurized brown rice vinegar. If using: Dilute heavily (e.g., 1:500 to 1:1000). Can be used as a foliar spray or soil drench. Often used to sanitize tools, clean seeds, or in combination with WCA to help plants absorb calcium, especially during the changeover period from vegetative to reproductive growth. It can help sterilize the leaf surface and improve the uptake of other nutrients."
        }
      ]
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
            <FlaskConical className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Korean Natural Farming (KNF) Inputs</CardTitle>
          </div>
          <CardDescription>
            Practical guides to preparing powerful, natural inputs to boost soil life and plant health using KNF methods.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            KNF emphasizes using natural, locally-sourced materials to create inputs that work with nature to enhance soil fertility and plant vitality. These inputs are typically applied in dilute forms and their use is often timed with the plant's growth cycle.
          </p>
          <Accordion type="single" collapsible className="w-full">
            {knfInputs.map((input) => (
              <AccordionItem value={input.id} key={input.id}>
                <AccordionTrigger className="text-lg hover:no-underline">
                  <div className="flex items-center gap-3">
                    {input.icon}
                    {input.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-4">
                  <p className="text-md font-medium text-muted-foreground">{input.purpose}</p>
                  {input.sections ? (
                    input.sections.map((section, idx) => (
                      <div key={idx} className="ml-2 pl-4 border-l-2 border-muted space-y-2 py-2">
                        {section.subtitle && <h4 className="font-semibold text-md mb-1">{section.subtitle}</h4>}
                        {section.purpose && <p className="text-sm text-muted-foreground mb-1">{section.purpose}</p>}
                        {section.materials && section.materials.length > 0 && (
                          <>
                            <p className="text-sm font-medium mt-2 mb-1">Materials Needed:</p>
                            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-0.5 text-sm">
                              {section.materials.map((material, matIdx) => <li key={matIdx}>{material}</li>)}
                            </ul>
                          </>
                        )}
                        {section.steps && section.steps.length > 0 && (
                          <>
                            <p className="text-sm font-medium mt-2 mb-1">Steps:</p>
                            <ol className="list-decimal list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                              {section.steps.map((step, stepIdx) => <li key={stepIdx}>{step}</li>)}
                            </ol>
                          </>
                        )}
                        {section.usage && (
                          <>
                            <p className="text-sm font-medium mt-2 mb-1">Usage & Growth Stage:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{section.usage}</p>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      {input.materials && input.materials.length > 0 && (
                        <div className="ml-2 pl-4 border-l-2 border-muted space-y-2 py-2">
                            <p className="text-sm font-medium mt-2 mb-1">Materials Needed:</p>
                            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-0.5 text-sm">
                              {input.materials.map((material, matIdx) => <li key={matIdx}>{material}</li>)}
                            </ul>
                        </div>
                      )}
                       {input.steps && input.steps.length > 0 && (
                        <div className="ml-2 pl-4 border-l-2 border-muted space-y-2 py-2">
                          <p className="text-sm font-medium mt-2 mb-1">Steps:</p>
                          <ol className="list-decimal list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                            {input.steps.map((step, stepIdx) => <li key={stepIdx}>{step}</li>)}
                          </ol>
                        </div>
                      )}
                      {input.usage && (
                        <div className="ml-2 pl-4 border-l-2 border-muted space-y-2 py-2">
                          <p className="text-sm font-medium mt-2 mb-1">Usage & Growth Stage:</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{input.usage}</p>
                        </div>
                      )}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <section className="mt-6 pt-4 border-t">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Important KNF Principles for Application
            </h2>
            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
              <li><strong className="font-medium">Observe Plant Growth Stages:</strong> KNF inputs are most effective when applied according to the plant's current growth stage (e.g., FPJ for vegetative, WCA for fruiting).</li>
              <li><strong className="font-medium">Dilution is Key:</strong> Most KNF inputs are potent and MUST be diluted significantly before application (often 1:500 to 1:1000). Over-application can harm plants.</li>
              <li><strong className="font-medium">Use Local Materials:</strong> KNF emphasizes using resources available in your local environment.</li>
              <li><strong className="font-medium">Focus on Soil Life:</strong> The health of the soil microbiome (enhanced by IMO) is paramount in KNF for nutrient cycling and plant health.</li>
              <li><strong className="font-medium">Patience and Observation:</strong> Natural fermentation processes take time. Observe your plants and soil to understand their responses to different inputs.</li>
              <li><strong className="font-medium">Avoid Mixing Certain Inputs:</strong> For example, LAB and OHN are generally not mixed or applied at the same time.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              This guide provides a starting point. For deeper understanding and mastery, consult specialized KNF resources, books, or seek guidance from experienced KNF practitioners.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

