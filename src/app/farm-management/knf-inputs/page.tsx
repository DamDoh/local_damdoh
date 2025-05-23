
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlaskConical, ArrowLeft, Leaf, Droplets, Sprout, CheckCircle, Fish, Egg, Thermometer, Beaker } from "lucide-react";

export default function KNFInputsPage() {
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
            A practical guide to preparing powerful, natural inputs to boost soil life and plant health using KNF methods.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Introduction to KNF Inputs
            </h2>
            <p className="text-muted-foreground">
              Korean Natural Farming (KNF) is a sustainable farming method that focuses on using inputs made from natural materials, often locally sourced, to create a vibrant soil ecosystem. These inputs help enhance plant immunity, improve nutrient uptake, and reduce reliance on chemical fertilizers and pesticides. Making your own KNF inputs can be cost-effective and empowers you to work in harmony with nature.
            </p>
          </section>

          {/* IMO Section */}
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Sprout className="h-6 w-6 text-green-700" />
              Indigenous Microorganisms (IMO)
            </h2>
            <p className="text-muted-foreground mb-2">
              IMO is the cornerstone of KNF, a collection of beneficial local microbes that enrich your soil.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-md mb-1">IMO1: Collecting Local Microbes</h3>
                <p className="text-sm text-muted-foreground mb-1"><strong className="font-medium">Purpose:</strong> To capture a diverse range of strong, native microorganisms from your local environment.</p>
                <p className="text-sm font-medium mb-1">Materials Needed:</p>
                <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-0.5 text-sm">
                  <li>Wooden box (cedar or pine, not treated), or a bamboo container</li>
                  <li>Hard-cooked rice (slightly undercooked is better than mushy)</li>
                  <li>Porous paper (like paper towel or traditional Korean paper 'hanji')</li>
                  <li>String or rubber band</li>
                  <li>A sheltered, undisturbed location with rich soil (e.g., under deciduous trees, near bamboo groves)</li>
                  <li>Wire mesh or net to protect from animals</li>
                </ul>
                <p className="text-sm font-medium mt-2 mb-1">Steps:</p>
                <ol className="list-decimal list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                  <li>Cook rice until it's firm, not soft. Let it cool slightly.</li>
                  <li>Fill the wooden box or bamboo container about 2/3 full with the cooked rice. Do not pack it too tightly.</li>
                  <li>Cover the box opening with porous paper and secure it with string or a rubber band. This allows air exchange but keeps out dirt.</li>
                  <li>Choose a location with healthy, undisturbed soil, ideally with plenty of leaf litter.</li>
                  <li>Bury the box about 2/3 deep into the soil. Protect it from rain and direct sunlight with leaves or a small cover. Use wire mesh to prevent animals from disturbing it.</li>
                  <li>Leave for 3-7 days. The time depends on temperature (faster in warmer weather).</li>
                  <li>Carefully dig up the box. You should see a growth of white, fluffy mold on the rice. This is IMO1. Avoid rice with black, green, orange, or other brightly colored molds, as these might be undesirable.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-medium text-md mb-1">IMO2: Cultivating the Microbes</h3>
                 <p className="text-sm text-muted-foreground mb-1"><strong className="font-medium">Purpose:</strong> To increase the population of the collected microbes and stabilize them.</p>
                <p className="text-sm font-medium mb-1">Materials Needed:</p>
                <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-0.5 text-sm">
                  <li>The collected IMO1 (rice with white mold)</li>
                  <li>Rice bran or wheat bran (equal in weight to the IMO1)</li>
                  <li>Clean water (if needed)</li>
                  <li>Container for mixing (e.g., clay pot, plastic tub)</li>
                  <li>Breathable cover (e.g., straw mat, cloth)</li>
                </ul>
                <p className="text-sm font-medium mt-2 mb-1">Steps:</p>
                <ol className="list-decimal list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                  <li>Gently mix the IMO1 (moldy rice) with an equal weight of rice bran. Break up clumps of rice carefully.</li>
                  <li>Check moisture content. It should be around 65-70%. When you squeeze a handful, it should clump together but crumble easily when pressed. If too dry, add a tiny bit of clean water and mix well.</li>
                  <li>Place the mixture in a container, not packing it down. It can be piled loosely.</li>
                  <li>Cover with a breathable material like a straw mat or cloth.</li>
                  <li>Store in a shaded, well-ventilated area, protected from rain.</li>
                  <li>The pile should generate some heat (ideal temperature 40-50°C or 104-122°F). If it gets too hot, turn or spread the mixture to cool it down.</li>
                  <li>IMO2 is ready in about 5-7 days. It should have a pleasant, sweet, fermented smell.</li>
                </ol>
                 <p className="text-sm font-medium mt-2 mb-1">IMO2 Usage:</p>
                <p className="text-sm text-muted-foreground">IMO2 can be further processed into IMO3 (mixed with soil and more bran) and IMO4 (mixed with soil and nutrients) for direct soil application or to enrich compost.</p>
              </div>
            </div>
          </section>

          {/* FAA Section */}
          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Fish className="h-5 w-5 text-blue-600" />
              Fish Amino Acid (FAA)
            </h2>
            <p className="text-muted-foreground mb-1"><strong className="font-medium">Purpose:</strong> A potent liquid fertilizer rich in nitrogen, amino acids, and nutrients for vigorous plant growth, especially for leafy green vegetables.</p>
            <p className="text-sm font-medium mb-1">Materials Needed:</p>
            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-0.5 text-sm">
              <li>Fish parts (heads, bones, guts, scraps – blue-backed fish like mackerel or sardines are good; avoid overly oily fish if possible)</li>
              <li>Brown sugar (equal weight to the fish parts)</li>
              <li>Large glass or food-grade plastic jar with a wide mouth</li>
              <li>Porous paper (paper towel) and string/rubber band</li>
            </ul>
            <p className="text-sm font-medium mt-2 mb-1">Steps:</p>
            <ol className="list-decimal list-inside text-muted-foreground pl-5 space-y-1 text-sm">
              <li>If fish parts are large, chop them into smaller pieces.</li>
              <li>In the jar, layer the fish parts and brown sugar in a 1:1 ratio by weight. For example, 1kg of fish parts with 1kg of brown sugar. Ensure all fish parts are well coated with sugar.</li>
              <li>Leave some headspace in the jar (about 1/3 empty).</li>
              <li>Cover the jar opening with porous paper and secure it. This allows gas exchange and prevents pests.</li>
              <li>Store in a cool, dark, and shaded place.</li>
              <li>Over time (3-6 months, or even longer for a more potent FAA), the fish will break down and liquefy due to osmosis and fermentation.</li>
              <li>The final product will be a dark liquid. Strain if desired, though often used unstrained.</li>
            </ol>
            <p className="text-sm font-medium mt-2 mb-1">FAA Usage:</p>
            <p className="text-sm text-muted-foreground">Dilute heavily with water before use, typically 1:500 to 1:1000 (e.g., 1-2ml of FAA per 1 liter of water). Apply as a foliar spray or soil drench. Excellent during vegetative growth.</p>
          </section>

          {/* WCA Section */}
          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Egg className="h-5 w-5 text-orange-400" />
              Water-Soluble Calcium (WCA)
            </h2>
            <p className="text-muted-foreground mb-1"><strong className="font-medium">Purpose:</strong> Provides readily available calcium to plants, strengthening cell walls, improving fruit quality, and preventing calcium-deficiency disorders like blossom-end rot.</p>
            <p className="text-sm font-medium mb-1">Materials Needed:</p>
            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-0.5 text-sm">
              <li>Eggshells (chicken eggshells are common)</li>
              <li>Vinegar (brown rice vinegar is traditionally preferred, but apple cider vinegar or white vinegar can also be used)</li>
              <li>Glass jar</li>
            </ul>
            <p className="text-sm font-medium mt-2 mb-1">Steps:</p>
            <ol className="list-decimal list-inside text-muted-foreground pl-5 space-y-1 text-sm">
              <li>Wash the eggshells thoroughly to remove any membrane or residue. Dry them completely.</li>
              <li>Roast or pan-fry the dry eggshells until they are slightly browned or lightly charred. This makes them brittle and helps extract calcium. Be careful not to burn them black.</li>
              <li>Once cooled, crush the roasted eggshells into small pieces or a coarse powder.</li>
              <li>Place the crushed eggshells in the glass jar.</li>
              <li>Add vinegar to the jar, using about 5-10 times the volume of vinegar to eggshells (e.g., if you have 1 cup of crushed eggshells, use 5-10 cups of vinegar). The eggshells should be fully submerged.</li>
              <li>You will see bubbles forming as the acetic acid in the vinegar reacts with the calcium carbonate in the eggshells.</li>
              <li>Cover the jar loosely (e.g., with a lid not fully tightened, or porous paper) to allow gases to escape.</li>
              <li>Leave the mixture until the bubbling stops. This can take 5-10 days. The liquid is your WCA.</li>
            </ol>
            <p className="text-sm font-medium mt-2 mb-1">WCA Usage:</p>
            <p className="text-sm text-muted-foreground">Dilute with water, typically 1:1000 (e.g., 1ml of WCA per 1 liter of water). Apply as a foliar spray, especially during the plant's reproductive stages (flowering and fruiting) or when signs of calcium deficiency appear.</p>
          </section>

          {/* OHN Section - Simplified */}
          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Beaker className="h-5 w-5 text-purple-600" />
              Oriental Herbal Nutrient (OHN) - An Overview
            </h2>
            <p className="text-muted-foreground mb-1"><strong className="font-medium">Purpose:</strong> A complex fermented plant extract used to boost plant immunity, vitality, and resilience against pests and diseases.</p>
            <p className="text-muted-foreground mb-2">
              OHN is one of the most potent and also most complex KNF inputs to prepare. It traditionally involves fermenting specific herbs like Angelica, Cinnamon, Licorice, Garlic, and Ginger in separate batches with alcohol (like soju or vodka) and brown sugar over extended periods (weeks to months). These ferments are then combined in specific ratios.
            </p>
            <p className="text-muted-foreground mb-2">
              Due to its intricate preparation process, which requires precision and patience, creating true OHN is often learned through detailed study or mentorship from experienced KNF practitioners.
            </p>
            <p className="text-sm font-medium mt-2 mb-1">General Idea:</p>
            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-0.5 text-sm">
              <li>Selected herbs are typically tinctured in alcohol and then fermented with brown sugar.</li>
              <li>Multiple herbal ferments are created separately.</li>
              <li>These are later combined and aged further.</li>
            </ul>
            <p className="text-sm font-medium mt-2 mb-1">OHN Usage:</p>
            <p className="text-sm text-muted-foreground">OHN is used in very dilute solutions (e.g., 1:1000) as a foliar spray to strengthen plants and improve their overall health and resistance to stress.</p>
            <p className="text-muted-foreground mt-2">
              <strong className="font-medium">Note:</strong> For detailed OHN recipes and procedures, please consult specialized KNF resources or experienced teachers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              Important KNF Principles
            </h2>
            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
              <li><strong className="font-medium">Use Local Materials:</strong> KNF emphasizes using resources available in your local environment.</li>
              <li><strong className="font-medium">Observe Nature:</strong> Learn from how nature maintains fertility and health.</li>
              <li><strong className="font-medium">Patience:</strong> Fermentation and natural processes take time.</li>
              <li><strong className="font-medium">Dilution is Key:</strong> Most KNF inputs are potent and must be diluted significantly before application.</li>
              <li><strong className="font-medium">Focus on Soil Life:</strong> The health of the soil microbiome is paramount in KNF.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              This guide provides a starting point for making some foundational KNF inputs. Experiment, observe your plants and soil, and continue learning to master these natural farming techniques. Visual guides and hands-on workshops from experienced KNF practitioners can be invaluable.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
