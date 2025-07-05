
// A standalone script to populate the 'knowledge_base' collection in Firestore.
// To run this:
// 1. Make sure your .env.local file has the correct Firebase project credentials.
// 2. You will need to install ts-node: `npm install -g ts-node`
// 3. From your project root, run: `ts-node ./scripts/populate-knowledge-base.ts`

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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
    }
];

// Initialize Firebase Admin SDK
if (!getApps().length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
        initializeApp({
            credential: cert(serviceAccount),
            databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error("Firebase Admin SDK initialization failed:", error.message);
        process.exit(1);
    }
}

const db = getFirestore();

async function populateKnowledgeBase() {
    console.log("Starting to populate 'knowledge_base' collection...");

    const collectionRef = db.collection('knowledge_base');
    const writeBatch = db.batch();

    KNOWLEDGE_BASE_DATA.forEach(item => {
        const docRef = collectionRef.doc(item.id);
        writeBatch.set(docRef, item);
    });

    try {
        await writeBatch.commit();
        console.log(`Successfully populated ${KNOWLEDGE_BASE_DATA.length} documents into the 'knowledge_base' collection.`);
    } catch (error) {
        console.error("Error writing batch to Firestore:", error);
    }
}

populateKnowledgeBase();
