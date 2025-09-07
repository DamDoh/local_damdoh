
// A standalone script to populate the 'knowledge_base' collection in Firestore.
// To run this:
// 1. Make sure your .env.local file has the correct Firebase project credentials.
// 2. You will need to install ts-node: `npm install -g ts-node`
// 3. From your project root, run: `ts-node ./src/scripts/populate-knowledge-base.ts`

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const KNOWLEDGE_BASE_DATA = [
    {
      id: "knf_fpj",
      name: "Fermented Plant Juice (FPJ)",
      methodology: "KNF",
      type: "Concoction",
      description: "A fermented extract of a plant's sap and chlorophylls. Rich in enzymes and microorganisms, it's a potent growth enhancer for plants.",
      source: "Korean Natural Farming Official Guide, 2018",
      suitability: {
        crop_stages: ["Young Plants", "Vegetative Growth"],
        benefits: ["Boosts plant growth", "Improves soil health", "Enhances photosynthesis"]
      },
      ingredients: [
        { name: "Fast-growing plant parts (e.g., sweet potato tips, bamboo shoots, squash tips)", amount: 1, unit: "kg" },
        { name: "Brown sugar (or molasses)", amount: 1, unit: "kg" }
      ],
      steps: [
        { order: 1, description: "Collect plant materials before sunrise when they are most potent. Do not wash them to preserve the natural microorganisms.", duration_hours: 1 },
        { order: 2, description: "Roughly chop the plant materials and place them in a container.", duration_hours: 0.5 },
        { order: 3, description: "Add an equal weight of brown sugar. Mix thoroughly until the sugar is well-distributed.", duration_hours: 0.5 },
        { order: 4, description: "Pack the mixture tightly into a clay pot or glass jar, filling it to about 2/3 capacity.", duration_hours: 0.25 },
        { order: 5, description: "Cover the container with a breathable cloth (like muslin) and secure it with a string. Store in a cool, dark place.", duration_hours: 0.1 },
        { order: 6, description: "Let it ferment. The liquid will extract through osmosis.", duration_days: 7 }
      ],
      usage: {
        dilution_ratio: "1:500 to 1:1000 with water",
        application_method: "Foliar spray or soil drench.",
        frequency: "Once every 7-10 days during the vegetative growth stage."
      },
      storage: "After straining, store the liquid in a loosely capped bottle in a cool, dark place. Do not refrigerate."
    },
    {
      id: "fgw_gods_blanket",
      name: "God's Blanket (Mulching)",
      methodology: "FGW",
      type: "Practice",
      description: "A core principle of Farming God's Way, involving a thick, permanent layer of organic mulch on the soil surface to mimic God's design in nature.",
      source: "Farming God's Way Field Manual",
      suitability: {
        benefits: ["Conserves soil moisture", "Suppresses weeds", "Regulates soil temperature", "Feeds soil life as it decomposes", "Prevents soil erosion"]
      },
      materials: [
        { name: "Dry organic matter (e.g., grass, straw, dry leaves, maize stalks)", notes: "A thick layer is required, at least 10-15cm (4-6 inches)." }
      ],
      steps: [
        { order: 1, description: "After preparing your permanent planting stations, gather your dry organic materials." },
        { order: 2, description: "Apply a thick, even layer of the mulch over the entire surface of the field, between the planting stations." },
        { order: 3, description: "Ensure the blanket is thick enough that you cannot see the soil through it. This is not a light sprinkle." },
        { order: 4, description: "When planting, simply make a hole in the blanket at your permanent planting station. Do not remove the entire blanket." },
        { order: 5, description: "Continuously add more organic matter to the blanket as it decomposes over time to maintain its thickness." }
      ],
      related_principles: ["Minimal Soil Disturbance", "High Standards"]
    },
    {
      id: "knf_faa",
      name: "Fish Amino Acid (FAA)",
      methodology: "KNF",
      type: "Concoction",
      description: "A powerful liquid fertilizer made from fish waste, rich in nitrogen and amino acids. Excellent for boosting plant growth, especially during the vegetative stage.",
      source: "Korean Natural Farming Official Guide",
      suitability: {
        crop_stages: ["Vegetative Growth", "Flowering"],
        benefits: ["Provides rich source of nitrogen", "Enhances plant flavor and aroma", "Improves soil microorganism activity"]
      },
      ingredients: [
        { name: "Fish scraps (heads, bones, guts)", amount: 1, unit: "kg" },
        { name: "Brown sugar (or molasses)", amount: 1, unit: "kg" }
      ],
      steps: [
        { order: 1, description: "Chop the fish parts into small pieces to increase surface area." },
        { order: 2, description: "In a container, layer the fish parts and brown sugar, starting and ending with a layer of sugar." },
        { order: 3, description: "Fill the container to about 2/3 capacity and cover with a breathable cloth." },
        { order: 4, description: "Store in a cool, dark place and let it ferment for at least 3-6 months. The longer the better." }
      ],
      usage: {
        dilution_ratio: "1:1000 with water",
        application_method: "Primarily used as a soil drench. Can also be used as a foliar spray.",
        frequency: "Once every 1-2 weeks during active growth."
      },
      storage: "After fermentation, strain the liquid and store in a loosely capped bottle in a cool, dark place."
    },
    {
      id: "knf_wca",
      name: "Water-Soluble Calcium (WCA)",
      methodology: "KNF",
      type: "Concoction",
      description: "A calcium supplement made from eggshells, essential for fruit development and preventing blossom-end rot.",
      source: "Korean Natural Farming Official Guide",
      suitability: {
        crop_stages: ["Fruiting", "Flowering"],
        benefits: ["Strengthens cell walls", "Prevents blossom-end rot in crops like tomatoes and peppers", "Improves fruit quality and shelf life"]
      },
      ingredients: [
        { name: "Eggshells (washed and roasted until lightly brown)", amount: 1, unit: "part" },
        { name: "Brown Rice Vinegar", amount: 10, unit: "parts" }
      ],
      steps: [
        { order: 1, description: "Roast clean, dry eggshells until they are lightly browned but not burnt. This makes them brittle." },
        { order: 2, description: "Crush the roasted eggshells into a coarse powder." },
        { order: 3, description: "Place the crushed eggshells in a jar and add brown rice vinegar at a 1:10 ratio (shells:vinegar) by volume." },
        { order: 4, "description": "You will see bubbles as the acetic acid reacts with the calcium carbonate. Leave the lid slightly loose to allow gas to escape." },
        { order: 5, "description": "It is ready when the bubbling stops, typically in 5-10 days. The liquid is then strained and stored." }
      ],
      usage: {
        dilution_ratio: "1:1000 with water",
        application_method: "Used as a foliar spray during the flowering and fruiting stages.",
        frequency: "Once a week during fruit development."
      },
      storage: "Store in a loosely capped bottle in a cool, dark place."
    },
    {
      id: "knf_lab",
      name: "Lactic Acid Bacteria (LAB)",
      methodology: "KNF",
      type: "Concoction",
      description: "A culture of beneficial bacteria that aids in composting, odor control, and improving soil health.",
      source: "Korean Natural Farming Official Guide",
      suitability: {
        crop_stages: ["All stages", "Composting"],
        benefits: ["Speeds up decomposition of organic matter", "Suppresses harmful pathogens", "Improves soil nutrient availability", "Reduces odors in livestock operations"]
      },
      ingredients: [
        { name: "Rice wash water (water from the first rinse of rice)", amount: 1, unit: "L" },
        { name: "Milk", amount: 10, unit: "L" }
      ],
      steps: [
        { order: 1, description: "Collect the milky water from the first rinse of rice. Fill a jar about 2/3 full and cover loosely with a breathable cloth." },
        { order: 2, description: "Let the rice wash water sit for 5-7 days in a cool, dark place. It will separate into layers and have a slightly sour smell." },
        { order: 3, description: "Carefully extract the middle layer of liquid, avoiding the top mold and bottom sediment. This is your LAB serum." },
        { order: 4, "description": "Add this serum to milk at a 1:10 ratio (serum:milk). For example, 100ml serum to 1L milk." },
        { order: 5, "description": "Let this mixture sit for another 5-7 days. It will separate into curds (top) and a clear yellow liquid (whey). The whey is your concentrated LAB." },
        { order: 6, "description": "Strain and collect the yellow whey. This is your final LAB solution." }
      ],
      usage: {
        dilution_ratio: "1:1000 with water for soil application; 1:500 for compost piles.",
        application_method: "Soil drench, compost treatment, or as part of a cleaning solution for livestock housing.",
        frequency: "As needed, especially when incorporating new organic matter."
      },
      storage: "Store the final whey in the refrigerator with a loose cap, or mix with an equal part of brown sugar for room temperature storage."
    },
    {
        id: "knf_imo",
        name: "Indigenous Microorganisms (IMO)",
        methodology: "KNF",
        type: "Concoction",
        description: "The cornerstone of KNF, this is a method for collecting and cultivating beneficial, native microorganisms from the local environment to dramatically improve soil health and fertility.",
        source: "Korean Natural Farming Official Guide",
        suitability: {
            crop_stages: ["Soil Preparation", "Throughout lifecycle"],
            benefits: ["Restores and enhances soil biodiversity", "Improves nutrient cycling and availability", "Suppresses soil-borne pathogens", "Enhances plant root development"]
        },
        ingredients: [
            { name: "Hard-cooked rice or other cooked grain", amount: 1, unit: "box" },
            { name: "Brown sugar or molasses", amount: 1, unit: "equal weight to IMO-2" },
            { name: "Soil from your farm", amount: 1, unit: "equal volume to IMO-3" },
            { name: "Water", amount: 1, unit: "variable" }
        ],
        steps: [
            { order: 1, title: "IMO-1: Collection", description: "Place a wooden box filled with hard-cooked rice in a local forest or undisturbed area with rich leaf mold. Cover it to protect from rain and animals. Leave for 3-5 days until a white mold covers the rice." },
            { order: 2, title: "IMO-2: Cultivation", description: "Mix the moldy rice (IMO-1) with an equal weight of brown sugar. This preserves and feeds the collected microbes. Store in a breathable container." },
            { order: 3, title: "IMO-3: Extension", description: "Mix the IMO-2 with an equal volume of soil from your farm and water to achieve a 65-70% moisture content. This inoculates your farm soil with the powerful microbes. Pile it and cover, turning when the pile's internal temperature exceeds 50°C." },
            { order: 4, title: "IMO-4: Final Soil Inoculation", description: "Mix the IMO-3 with more farm soil and other organic inputs to create a large batch of microbially active compost, ready to be applied to your fields." }
        ],
        usage: {
            application_method: "Applied as a soil amendment before planting or as a top dressing around existing plants.",
            frequency: "Ideally applied at the beginning of each planting season."
        },
        storage: "Each stage has different storage requirements. IMO-2 is relatively stable, while IMO-3 and IMO-4 should be used when ready."
    },
    {
        id: "knf_ohn",
        name: "Oriental Herbal Nutrient (OHN)",
        methodology: "KNF",
        type: "Concoction",
        description: "A complex fermented herbal tincture that acts as a natural plant medicine, boosting resilience against pests, diseases, and environmental stress.",
        source: "Korean Natural Farming Official Guide",
        suitability: {
            crop_stages: ["All stages"],
            benefits: ["Boosts plant immunity and resilience", "Acts as a natural pest and disease repellent", "Impro...