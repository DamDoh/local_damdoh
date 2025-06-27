
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: Replace with your actual service account key file
const serviceAccount = require('../../firebase/serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const fpjData = {
  "id": "knf_fpj",
  "name": "Fermented Plant Juice (FPJ)",
  "methodology": "KNF",
  "type": "Concoction",
  "description": "A fermented extract of a plant's sap and chlorophylls. Rich in enzymes and microorganisms, it's a potent growth enhancer for plants.",
  "source": "Korean Natural Farming Official Guide, 2018",
  "suitability": {
    "crop_stages": ["Young Plants", "Vegetative Growth"],
    "benefits": ["Boosts plant growth", "Improves soil health", "Enhances photosynthesis"]
  },
  "ingredients": [
    { "name": "Fast-growing plant parts (e.g., sweet potato tips, bamboo shoots)", "amount": 1, "unit": "kg" },
    { "name": "Brown sugar (or molasses)", "amount": 1, "unit": "kg" }
  ],
  "steps": [
    { "order": 1, "description": "Collect plant materials before sunrise when they are most potent. Do not wash them to preserve the natural microorganisms.", "duration_hours": 1 },
    { "order": 2, "description": "Roughly chop the plant materials and place them in a container.", "duration_hours": 0.5 },
    { "order": 3, "description": "Add an equal weight of brown sugar. Mix thoroughly until the sugar is well-distributed.", "duration_hours": 0.5 },
    { "order": 4, "description": "Pack the mixture tightly into a clay pot or glass jar, filling it to about 2/3 capacity.", "duration_hours": 0.25 },
    { "order": 5, "description": "Cover the container with a breathable cloth (like muslin) and secure it with a string. Store in a cool, dark place.", "duration_hours": 0.1 },
    { "order": 6, "description": "Let it ferment. The liquid will extract through osmosis.", "duration_days": 7 }
  ],
  "usage": {
    "dilution_ratio": "1:500 to 1:1000 with water",
    "application_method": "Foliar spray or soil drench.",
    "frequency": "Once every 7-10 days during the vegetative growth stage."
  },
  "storage": "After straining, store the liquid in a loosely capped bottle in a cool, dark place. Do not refrigerate."
};

async function populateFpj() {
  try {
    console.log('Populating knf_fpj...');
    await db.collection('knowledge_base').doc('knf_fpj').set(fpjData);
    console.log('Successfully populated knf_fpj.');
  } catch (error) {
    console.error('Error populating knf_fpj:', error);
  }
}

populateFpj();
