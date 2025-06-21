
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FlaskConical, ArrowLeft, Leaf, Droplets, Sprout, CheckCircle, Fish, Egg, Thermometer, Beaker, Wheat, Zap, Atom, Users, AlertTriangle } from "lucide-react";

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
          purpose: "To capture a diverse range of strong, native microorganisms from your local environment (forest floor, undisturbed soil rich in humus).",
          materials: [
            "Wooden box (cedar or pine, not treated, about 12x8x4 inches), or a bamboo container/earthenware pot",
            "Hard-cooked rice (slightly undercooked is better than mushy, use good quality rice)",
            "Porous paper (like paper towel, rice paper, or traditional Korean paper 'hanji')",
            "String or rubber band",
            "A sheltered, undisturbed location with rich soil (e.g., under deciduous trees with deep leaf litter, near bamboo groves, healthy forest floor). Avoid areas with pine trees as they can be too acidic.",
            "Wire mesh or net to protect from animals (rodents, insects)"
          ],
          steps: [
            "Cook rice until it's firm but cooked through. Let it cool to lukewarm.",
            "Fill the wooden box or container about 2/3 full with the cooked rice. Do not pack it too tightly; allow for air spaces.",
            "Cover the box opening with porous paper and secure it tightly with string or a rubber band. This allows air exchange but keeps out dirt and larger pests.",
            "Choose a location with healthy, undisturbed soil, ideally where diverse plants are thriving. Look for areas with significant leaf mold and mycelial growth.",
            "Dig a hole and bury the box about 2/3 deep into the soil. The paper side should face up.",
            "Protect it from rain and direct sunlight using leaves, a piece of wood, or a tile. Ensure good airflow around the cover.",
            "Use wire mesh to cover the burial site to prevent animals from disturbing the box.",
            "Leave for 3-7 days. The time depends on temperature and humidity (faster in warmer, humid weather).",
            "Carefully dig up the box. You should see a growth of white, fluffy mold (mycelium) on the rice. This is successful IMO1 collection. A sweet, fermented smell is good.",
            "Avoid rice with black, green, orange, yellow, or other brightly colored molds, as these indicate contamination or undesirable microbes. Discard if heavily contaminated."
          ],
          usage: "IMO1 (the moldy rice) is the starter culture for IMO2. It's rich in various beneficial fungi, bacteria, and yeasts."
        },
        {
          subtitle: "IMO2: Cultivating and Stabilizing the Microbes",
          purpose: "To increase the population of the collected microbes and stabilize them by providing a carbohydrate food source.",
          materials: [
            "The collected IMO1 (rice with white mycelium)",
            "Brown sugar or molasses (equal in weight to the IMO1 rice)",
            "Clean glass or clay jar with a wide mouth",
            "Porous paper and string/rubber band"
          ],
          steps: [
            "Gently mix the IMO1 (moldy rice) with an equal weight of brown sugar or molasses in a clean bowl. Ensure the sugar is well incorporated.",
            "The mixture will become moist as the sugar draws out moisture from the rice and mycelium.",
            "Loosely pack the mixture into the glass or clay jar, filling it about 2/3 full to allow for gas production.",
            "Cover the jar opening with porous paper and secure it with string or a rubber band.",
            "Store in a cool, dark, and well-ventilated area, protected from direct sunlight and temperature fluctuations.",
            "IMO2 is ready in about 5-7 days. The mixture will have liquefied further and should have a sweet, slightly alcoholic, fermented smell. Some bubbling may occur.",
            "Strain the liquid if desired, though the solids also contain microbes. The resulting liquid is concentrated IMO2."
          ],
          usage: "IMO2 is used to make IMO3. It can also be diluted (e.g., 1:1000) and used as a light foliar spray or soil drench to introduce beneficial microbes."
        },
        {
            subtitle: "IMO3: Extending with Bran",
            purpose: "To greatly increase the microbial population using a larger food source (bran) and prepare it for soil application or compost enhancement.",
            materials: [
                "IMO2 mixture (solids and liquid, or just the solids if liquid was strained for other uses)",
                "Rice bran or wheat bran (approximately 1:1 ratio by weight with IMO2 solids, or adjust based on moisture)",
                "Clean water (non-chlorinated, if needed)",
                "Container for mixing (e.g., plastic tub, tarp)",
                "Breathable cover (e.g., straw mat, burlap sack, cloth)"
            ],
            steps: [
                "If you strained IMO2 liquid, you can add a small amount back to the solids, or use a little clean water to rehydrate if too dry.",
                "Gradually mix the IMO2 (solids or whole mixture) with rice bran. The goal is to achieve a moisture content of 65-70%. When squeezed, the mixture should clump but not drip water, and easily crumble when poked.",
                "Pile the mixture loosely in a shaded, well-ventilated area, protected from rain and direct sun. The pile should not be too high (e.g., 1-2 feet) to avoid excessive heat.",
                "Cover the pile with a breathable material. This helps retain moisture and warmth while allowing gas exchange.",
                "The pile should start to generate heat within 1-2 days (ideally 40-50°C or 104-122°F). If it gets too hot (above 55°C or 131°F), turn or spread the mixture to cool it down, as excessive heat can kill beneficial microbes.",
                "Turn the pile every 2-3 days to ensure even fermentation and temperature distribution.",
                "IMO3 is typically ready in 5-7 days. It should have a pleasant, sweet, earthy, fermented smell and be covered in white mycelium. It will feel light and fluffy."
            ],
            usage: "IMO3 is a powerful soil inoculant. It can be directly incorporated into garden beds, mixed into potting soil, or used to supercharge compost piles. It drastically improves soil structure, nutrient availability, and plant health."
        },
        {
            subtitle: "IMO4: Final Soil Mix (Optional)",
            purpose: "To further condition the microbes to your specific farm soil and add local mineral content.",
            materials: [
                "Finished IMO3",
                "Good quality farm soil (from the area where it will be used, 1:1 ratio with IMO3)",
                "Optional: Crushed rock dust, biochar, or other mineral amendments (small percentage)",
                "Clean water (non-chlorinated, if needed)"
            ],
            steps: [
                "Mix the IMO3 with an equal amount of your farm soil. If adding other amendments, incorporate them now.",
                "Adjust moisture content to 65-70% as with IMO3.",
                "Pile and cover as with IMO3, maintaining similar temperature and turning schedules.",
                "IMO4 is ready in about 5-7 days. It will look like enriched soil and have a pleasant earthy smell."
            ],
            usage: "IMO4 is used directly in the field as a soil amendment, top dressing, or for making planting holes. It's highly effective for revitalizing depleted soils and establishing a healthy soil food web."
        }
      ]
    },
    {
      id: "fpj",
      title: "Fermented Plant Juice (FPJ)",
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      purpose: "A liquid fertilizer made from fermenting fast-growing plant parts. It extracts nutrients, enzymes, growth hormones, and beneficial microbes from plants to stimulate robust vegetative growth.",
      materials: [
        "Actively growing plant parts: e.g., tips of sweet potato vines, banana pseudo-stems (sucker), bamboo shoots, young leaves of vigorous plants (comfrey, squash, cucumber), unripe fruits (papaya, banana, squash). Choose plants known for rapid growth in your area.",
        "Brown sugar or raw unrefined sugar (equal weight to the plant parts, 1:1 ratio by weight). Avoid white refined sugar.",
        "Clean glass or food-grade plastic jar with a wide mouth. Clay pots can also be used.",
        "Porous paper (paper towel, cheesecloth) and string/rubber band."
      ],
      steps: [
        "Collect plant parts ideally before sunrise when they are most turgid and full of energy. Do not wash them, to preserve the natural microbes on their surfaces.",
        "If plant parts are large, chop or cut them into 2-3 inch pieces to increase surface area.",
        "Weigh the collected plant material.",
        "Weigh an equal amount of brown sugar.",
        "In a clean mixing bowl or directly in the jar, layer the plant material and brown sugar. Start with a layer of sugar, then a layer of plants, then sugar, and so on. Ensure the top layer is sugar. Mix gently to coat plant parts.",
        "Pack the mixture into the jar, filling it only about 2/3 full to allow space for liquid extraction and gas production during fermentation.",
        "Cover the jar opening with porous paper and secure it tightly with string or a rubber band to allow gas exchange but keep out pests.",
        "Label the jar with the date and plant material used.",
        "Store in a cool, dark, and well-ventilated place, away from direct sunlight. Temperature should ideally be between 20-25°C (68-77°F).",
        "After 7-10 days (duration depends on temperature - faster in warmer conditions), a liquid (FPJ) will be extracted. The plant solids will have reduced in volume and liquid will have accumulated.",
        "Strain the liquid from the plant solids. The solids can be added to compost, used as mulch, or fed to IMO.",
        "The collected liquid is your FPJ. It should have a sweet, slightly alcoholic, fermented smell. Store in a cool, dark place. It can last for months if stored properly (e.g., in a refrigerator or a very cool, dark spot)."
      ],
      usage: "Dilute FPJ heavily with water, typically 1:500 to 1:1000 (e.g., 1-2ml of FPJ per 1 liter of non-chlorinated water). Apply as a foliar spray or soil drench. Best used during the plant's vegetative growth stage (for leafy growth) to provide nitrogen, enzymes, and growth stimulants. Can be used weekly or bi-weekly."
    },
    {
      id: "faa",
      title: "Fish Amino Acid (FAA)",
      icon: <Fish className="h-6 w-6 text-blue-600" />,
      purpose: "A potent liquid fertilizer rich in nitrogen, amino acids, and various nutrients derived from fish parts. Excellent for promoting vigorous vegetative growth, especially for leafy green vegetables.",
      materials: [
        "Fish parts: heads, bones, guts, skin, gills, whole small fish (blue-backed fish like mackerel, sardines, or fish scraps from a market are good; avoid overly oily fish if possible as they can take longer to break down and may go rancid).",
        "Brown sugar or raw unrefined sugar (equal weight to the fish parts, 1:1 ratio by weight).",
        "Large glass or food-grade plastic jar with a wide mouth and a lid (not airtight during initial fermentation).",
        "Porous paper (paper towel) and string/rubber band for initial covering if lid isn't used immediately."
      ],
      steps: [
        "If fish parts are large, chop them into smaller pieces to increase surface area for fermentation.",
        "In the jar, layer the fish parts and brown sugar in a 1:1 ratio by weight. Mix well to ensure all fish parts are thoroughly coated with sugar. This helps draw out moisture and aids fermentation.",
        "Press down the mixture lightly. Leave some headspace in the jar (about 1/3 empty) as the mixture will liquefy and produce gases.",
        "Cover the jar opening initially with porous paper and secure it with a string/rubber band for the first few weeks to allow gases to escape easily. Or, use a lid but don't tighten it completely.",
        "Store in a cool, dark, and shaded place, away from direct sunlight and pests. Ensure good ventilation.",
        "Over time (typically 3-6 months, but can be longer for a more potent FAA), the fish will break down and liquefy due to osmosis and microbial activity. The mixture will darken.",
        "Stirring occasionally (e.g., once a week after the initial period) can help, but is not always necessary.",
        "The final product will be a dark, rich liquid with a distinct (but not putrid if done correctly) fishy/fermented smell. Strain the liquid to remove any undissolved solids.",
        "Store the strained FAA in a sealed container in a cool, dark place. It can last for a year or more."
      ],
      usage: "Dilute FAA heavily with water, typically 1:500 to 1:1000 (e.g., 1-2ml of FAA per 1 liter of non-chlorinated water). Apply as a foliar spray or soil drench. Excellent during the vegetative growth phase when plants need a nitrogen boost. Can also be used to activate IMO or enrich compost."
    },
    {
      id: "wca",
      title: "Water-Soluble Calcium (WCA)",
      icon: <Egg className="h-6 w-6 text-orange-400" />,
      purpose: "Provides readily available calcium to plants, crucial for strengthening cell walls, improving fruit quality (firmness, storability), preventing calcium-deficiency disorders like blossom-end rot, and aiding in cell division and overall plant structure.",
      materials: [
        "Eggshells (chicken eggshells are common and readily available). Oyster shells or other calcium-rich shells can also be used but require more effort to clean and crush.",
        "Brown rice vinegar (BRV) is traditionally preferred. Apple cider vinegar (unpasteurized) or even white distilled vinegar can also be used. The acidity is key.",
        "Clean glass jar with a lid (not airtight during reaction)."
      ],
      steps: [
        "Collect eggshells. Wash them thoroughly to remove any membrane or egg residue. Dry them completely (sun-dry or in a low oven).",
        "Roast or pan-fry the dry eggshells until they are slightly browned, yellowish, or lightly charred. This makes them brittle and converts some calcium carbonate to calcium oxide, which is more reactive. Be careful not to burn them black.",
        "Once cooled, crush or grind the roasted eggshells into small pieces or a coarse powder. The smaller the pieces, the faster the reaction.",
        "Place the crushed eggshells in the glass jar.",
        "Add vinegar to the jar, using approximately 5-10 parts vinegar to 1 part eggshells by volume (e.g., if you have 1 cup of crushed eggshells, use 5-10 cups of vinegar). Ensure eggshells are fully submerged.",
        "You will immediately see bubbles forming as the acetic acid in the vinegar reacts with the calcium carbonate in the eggshells, releasing carbon dioxide. This indicates calcium is being dissolved.",
        "Cover the jar loosely with its lid (not tightened) or with porous paper to allow gases to escape but prevent contaminants from entering.",
        "Leave the mixture in a cool, dark place until the bubbling stops. This can take 7-20 days, depending on the particle size of eggshells and vinegar strength.",
        "The liquid is your WCA. Once bubbling ceases, the reaction is largely complete. You can strain the liquid to remove any unreacted shell particles if desired, or let them settle and decant the clear liquid.",
        "Store in a sealed container in a cool, dark place. It can last for months."
      ],
      usage: "Dilute WCA with water, typically 1:500 to 1:1000 (e.g., 1-2ml of WCA per 1 liter of non-chlorinated water). Apply as a foliar spray, especially during the plant's reproductive stages (flowering, fruit set, and fruit development) to support quality. Can also be applied as a soil drench. WCA is often used in combination with other KNF inputs, like FPJ, but apply separately or check compatibility."
    },
     {
      id: "lab",
      title: "Lactic Acid Bacteria (LAB) Serum",
      icon: <Atom className="h-6 w-6 text-yellow-500" />,
      purpose: "A culture of beneficial lactic acid bacteria that enhances soil health by aiding in the decomposition of organic matter, improving nutrient availability, and suppressing harmful pathogens. Strengthens plant immunity and resilience, and can be used for odor control.",
      materials: [
        "Rice wash water (the milky water from the first or second rinsing of uncooked rice).",
        "Fresh milk (preferably unpasteurized, full-fat cow's milk is common; other types may work but results can vary).",
        "Tall clear glass jar or container (e.g., 1-liter jar).",
        "Porous paper (paper towel, cheesecloth) and string/rubber band.",
        "Another larger container for the milk step.",
        "Brown sugar (optional, for stabilizing and storing the final LAB serum)."
      ],
      steps: [
        "Phase 1: Collect LAB from Rice Wash Water",
        "  1. Collect rice wash water (about 1/2 to 2/3 cup). The cloudier, the better.",
        "  2. Pour the rice wash water into the tall clear jar, filling it about 1/2 to 2/3 full. This provides air space.",
        "  3. Cover the jar opening with porous paper and secure it with a string/rubber band.",
        "  4. Leave the jar in a cool, dark, stable place (20-25°C or 68-77°F) for 5-7 days (can be shorter in warm weather, longer in cool).",
        "  5. After a few days, the mixture will separate into layers and develop a slightly sour smell. This indicates LAB activity.",
        "Phase 2: Culturing LAB in Milk",
        "  6. Carefully pour the clear liquid (the middle layer, if distinct layers form, otherwise just the liquid avoiding heavy sediment) from the fermented rice wash into the larger clean container. Try to leave behind any sediment.",
        "  7. Add fresh milk to this LAB-rich liquid in a ratio of 1 part LAB liquid to 10 parts milk (e.g., 100ml LAB liquid to 1 liter of milk). So, if you collected 1/2 cup of LAB liquid, add 5 cups of milk.",
        "  8. Stir gently. Cover this mixture with porous paper and leave in a cool, dark place for 5-7 days.",
        "  9. The mixture will separate into distinct layers: a top layer of curd (cheese-like solids, mostly casein and fats), a middle layer of clear yellowish liquid (this whey is your concentrated LAB serum), and sometimes a bottom layer of sediment.",
        "Phase 3: Harvesting and Storing LAB Serum",
        "  10. Carefully skim off or remove the top curd layer. This curd can be fed to animals, composted, or used in IMO making.",
        "  11. Gently collect the middle yellowish whey. This is your LAB serum. Avoid disturbing the bottom sediment layer too much.",
        "  12. For longer storage, you can mix the harvested LAB serum with an equal amount of brown sugar or molasses (1:1 by volume or weight). This acts as a food source and preservative. Store the stabilized serum in a sealed container in the refrigerator. It can last for several months. Unstabilized serum should be used more quickly or refrigerated.",
      ],
      usage: "Dilute LAB serum heavily with water, typically 1:500 to 1:1000 for foliar spray or soil drench (e.g., 1-2ml per liter of water). LAB can be used throughout the plant's life cycle. It helps improve soil structure, aids in composting (decomposes organic matter quickly), can clean livestock areas (reduces odor), and improves nutrient uptake by plants. Do not use with OHN as they can counteract each other. Spray on leaves in the evening or on cloudy days."
    },
    {
      id: "ohn",
      title: "Oriental Herbal Nutrient (OHN)",
      icon: <Beaker className="h-6 w-6 text-purple-600" />,
      purpose: "A complex fermented plant extract made from various herbs, used to boost plant immunity, vitality, and resilience against pests, diseases, and environmental stress. Considered a general 'plant medicine' and growth enhancer in KNF.",
      sections: [
        {
          subtitle: "Overview and Complexity",
          purpose: "OHN is one of KNF's most potent inputs. Traditionally, it's made by fermenting specific herbs like Angelica, Cinnamon, Licorice, Garlic, and Ginger, often in multiple stages using alcohol (like soju or vodka) and brown sugar. The precise recipes and ratios can vary, and the process is lengthy and requires care.",
          materials: [
            "Commonly used dried herbs (proportions vary by recipe and tradition):",
            "  - Angelica gigas roots (or other Angelica species)",
            "  - Cinnamon bark (Cassia or Ceylon)",
            "  - Licorice roots (Glycyrrhiza uralensis or Glycyrrhiza glabra)",
            "  - Garlic bulbs (dried or fresh)",
            "  - Ginger rhizomes (dried or fresh)",
            "Alcohol (e.g., Soju, Vodka, or other clear spirits around 20-40% ABV). Some recipes call for beer initially for garlic/ginger.",
            "Brown sugar or raw unrefined sugar.",
            "Large glass jars with lids (for tincturing and fermentation)."
          ],
          steps: [
            "The KNF OHN preparation is typically done in stages and can be complex:",
            "1. Initial Tincturing: Individual herbs or specific combinations (e.g., Angelica, Licorice, Cinnamon as one group; Garlic and Ginger as another) are often first tinctured in alcohol for a period (weeks to months). The jar is filled about 1/3 with herbs, then 2/3 with alcohol, sealed, and stored in the dark.",
            "2. Sugar Fermentation: After the initial alcohol extraction, brown sugar is added to these tinctures (e.g., equal weight to the herbal mass or a specific ratio to the liquid) to start a second fermentation process. This can take several more weeks or months. Jars are usually covered with porous paper during this phase.",
            "3. Combining and Aging: After the individual herbal ferments are ready, they are combined in specific ratios (these ratios are key parts of traditional KNF recipes) and then aged further for several months to a year or more to achieve optimal potency and synergy. The final mixture is the OHN.",
            "Note: Some simplified OHN versions exist, but traditional OHN is known for its extended preparation time."
          ],
          usage: "OHN is used in very dilute solutions, typically 1:1000 (1ml OHN per 1 liter of water), sometimes less for sensitive plants or frequent use. It's applied as a foliar spray or soil drench to strengthen plants, improve their overall health, and enhance resistance to stress, pests, and diseases. It can be used throughout the plant's life cycle, with concentrations sometimes varying. **Disclaimer:** Due to its complex and lengthy preparation, and the importance of correct herb identification and ratios, it's highly recommended to learn OHN making from experienced KNF practitioners or reliable, detailed KNF resources. This guide provides a general overview only."
        }
      ]
    },
    {
      id: "brv",
      title: "Brown Rice Vinegar (BRV)",
      icon: <Zap className="h-6 w-6 text-amber-600" />, 
      purpose: "BRV is used in KNF for several purposes: as a sterilizing agent (e.g., for seeds or tools), to help make certain nutrients (like calcium in WCA) more available to plants, to regulate plant metabolism, and to enhance the effectiveness of other inputs. It's valued for its acetic acid content and other beneficial compounds from rice fermentation.",
      sections: [
        {
          subtitle: "Making BRV (Simplified Overview)",
          materials: [
            "Cooked brown rice (glutinous or short-grain brown rice is often preferred)",
            "Water (good quality, non-chlorinated)",
            "Nuruk (Korean fermentation starter containing yeasts and bacteria) or a combination of wine yeast and later, mother of vinegar (acetic acid bacteria culture).",
            "Fermentation vessels (e.g., glass jars, food-grade buckets, traditional clay pots)."
          ],
          steps: [
            "1. Alcohol Fermentation: Cooked brown rice is mixed with water and nuruk (or yeast). This mixture undergoes alcoholic fermentation for several weeks to produce rice wine (makgeolli-like base). Temperature control (e.g., 20-25°C) is important.",
            "2. Acetic Acid Fermentation: The rice wine is then exposed to air (e.g., in a shallow, wide-mouthed container covered with cheesecloth) and inoculated with mother of vinegar (acetic acid bacteria). These bacteria convert the alcohol into acetic acid over several more weeks or months, creating vinegar.",
            "3. Aging: The resulting brown rice vinegar is often aged for several months to improve its flavor and potency.",
            "This process is an art and requires careful management of temperature, aeration, and hygiene to prevent spoilage."
          ],
          usage: "Due to the complexity and time required to make high-quality BRV, many KNF practitioners purchase good quality, unpasteurized brown rice vinegar. If using: Dilute heavily, typically 1:200 to 1:500 or even 1:1000 depending on purpose (e.g., 2-5ml per liter of water). Can be used as a foliar spray or soil drench. Often used to sanitize tools or seeds (at higher concentrations, then rinsed). It's famously used in making WCA by dissolving eggshells. BRV can help sterilize the leaf surface and improve the uptake of other nutrients, especially during the changeover period from vegetative to reproductive growth. Always test on a small area first."
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
          <AlertTriangle className="inline-block h-5 w-5 mr-2 text-amber-500" />
          <span className="text-sm text-muted-foreground font-medium">
            Disclaimer: The KNF formulas provided here are detailed guides based on general principles. KNF is a complex system, and variations exist. For critical applications and to ensure safety and efficacy, always consult with experienced KNF practitioners or refer to authoritative KNF texts. Test inputs on small areas first.
          </span>
          
          <Accordion type="single" collapsible className="w-full mt-4">
            {knfInputs.map((input) => (
              <AccordionItem value={input.id} key={input.id}>
                <AccordionTrigger className="text-lg hover:no-underline">
                  <div className="flex items-center gap-3">
                    {input.icon}
                    {input.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-4 text-muted-foreground">
                  <p className="text-md font-semibold">{input.purpose}</p>
                  {input.sections ? (
                    input.sections.map((section, idx) => (
                      <div key={idx} className="ml-2 pl-4 border-l-2 border-muted/70 space-y-2 py-2">
                        {section.subtitle && <h4 className="font-medium text-foreground/90 text-md mb-1">{section.subtitle}</h4>}
                        {section.purpose && <p className="text-sm italic mb-1">{section.purpose}</p>}
                        {section.materials && section.materials.length > 0 && (
                          <>
                            <p className="text-sm font-semibold text-foreground/80 mt-2 mb-1">Materials Needed:</p>
                            <ul className="list-disc list-inside pl-5 space-y-0.5 text-sm">
                              {section.materials.map((material, matIdx) => <li key={matIdx} dangerouslySetInnerHTML={{ __html: material }}></li>)}
                            </ul>
                          </>
                        )}
                        {section.steps && section.steps.length > 0 && (
                          <>
                            <p className="text-sm font-semibold text-foreground/80 mt-2 mb-1">Steps:</p>
                            <ol className="list-decimal list-inside pl-5 space-y-1 text-sm">
                              {section.steps.map((step, stepIdx) => <li key={stepIdx} dangerouslySetInnerHTML={{ __html: step }}></li>)}
                            </ol>
                          </>
                        )}
                        {section.usage && (
                          <>
                            <p className="text-sm font-semibold text-foreground/80 mt-2 mb-1">Usage & Growth Stage:</p>
                            <p className="text-sm whitespace-pre-line">{section.usage}</p>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      {input.materials && input.materials.length > 0 && (
                        <div className="ml-2 pl-4 border-l-2 border-muted/70 space-y-2 py-2">
                            <p className="text-sm font-semibold text-foreground/80 mt-2 mb-1">Materials Needed:</p>
                            <ul className="list-disc list-inside pl-5 space-y-0.5 text-sm">
                              {input.materials.map((material, matIdx) => <li key={matIdx} dangerouslySetInnerHTML={{ __html: material }}></li>)}
                            </ul>
                        </div>
                      )}
                       {input.steps && input.steps.length > 0 && (
                        <div className="ml-2 pl-4 border-l-2 border-muted/70 space-y-2 py-2">
                          <p className="text-sm font-semibold text-foreground/80 mt-2 mb-1">Steps:</p>
                          <ol className="list-decimal list-inside pl-5 space-y-1 text-sm">
                            {input.steps.map((step, stepIdx) => <li key={stepIdx} dangerouslySetInnerHTML={{ __html: step }}></li>)}
                          </ol>
                        </div>
                      )}
                      {input.usage && (
                        <div className="ml-2 pl-4 border-l-2 border-muted/70 space-y-2 py-2">
                          <p className="text-sm font-semibold text-foreground/80 mt-2 mb-1">Usage & Growth Stage:</p>
                          <p className="text-sm whitespace-pre-line">{input.usage}</p>
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
              <li><strong className="font-medium">Observe Plant Growth Stages:</strong> KNF inputs are most effective when applied according to the plant's current growth stage (e.g., FPJ for vegetative, WCA for fruiting). Matching input to stage is key.</li>
              <li><strong className="font-medium">Dilution is Critical:</strong> Most KNF inputs are highly concentrated and MUST be diluted significantly with non-chlorinated water before application (often 1:500 to 1:1000). Over-application can harm plants or soil life.</li>
              <li><strong className="font-medium">Use Local Materials:</strong> KNF emphasizes using resources available in your local environment (Indigenous Microorganisms, local plants for FPJ).</li>
              <li><strong className="font-medium">Focus on Soil Life (IMO):</strong> The health and diversity of the soil microbiome, primarily enhanced by IMO, is paramount in KNF for nutrient cycling, disease suppression, and overall plant health.</li>
              <li><strong className="font-medium">Patience and Observation:</strong> Natural fermentation processes take time. Observe your plants, soil, and ferments closely to understand their responses and progress. KNF is an observational practice.</li>
              <li><strong className="font-medium">Avoid Mixing Certain Inputs:</strong> For example, LAB and OHN are generally not mixed or applied at the same time as they can have counteracting effects. Understand input compatibilities.</li>
              <li><strong className="font-medium">Timing of Application:</strong> Foliar sprays are often best applied in the early morning or late evening when stomata are open and the sun is not intense.</li>
              <li><strong className="font-medium">Cleanliness:</strong> Maintain cleanliness in your preparation areas and with your tools to avoid contamination of your ferments.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              This guide provides a solid starting point. For deeper understanding, mastery, and adaptation to your specific environment, continuous learning through KNF literature, workshops, and experienced practitioners is highly recommended.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
