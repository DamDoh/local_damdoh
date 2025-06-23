
# Plan: AI Assistant FGW & KNF Expert Enhancement

This document outlines the detailed plan to transform the DamDoh AI Assistant into a specialized expert on Farming God's Way (FGW) and Korean Natural Farming (KNF). The goal is to provide users with precise, actionable instructions, including ingredient amounts, timings, and step-by-step guides.

## 1. Knowledge Base Design & Ingestion (Firestore)

To power the AI, we need a structured, granular knowledge base in Firestore.

### Schema Definition

We will create a new top-level collection named `knowledge_base`. Each document in this collection will represent a specific recipe, practice, or concept.

**Collection:** `knowledge_base`

**Document Structure Example (KNF - Fermented Plant Juice):**
```json
{
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
}
```

**Document Structure Example (FGW - God's Blanket):**
```json
{
  "id": "fgw_gods_blanket",
  "name": "God's Blanket (Mulching)",
  "methodology": "FGW",
  "type": "Practice",
  "description": "A core principle of Farming God's Way, involving a thick, permanent layer of organic mulch on the soil surface to mimic God's design in nature.",
  "source": "Farming God's Way Field Manual",
  "suitability": {
    "benefits": ["Conserves soil moisture", "Suppresses weeds", "Regulates soil temperature", "Feeds soil life as it decomposes", "Prevents soil erosion"]
  },
  "materials": [
    { "name": "Dry organic matter (e.g., grass, straw, dry leaves, maize stalks)", "notes": "A thick layer is required, at least 10-15cm (4-6 inches)." }
  ],
  "steps": [
    { "order": 1, "description": "After preparing your permanent planting stations, gather your dry organic materials." },
    { "order": 2, "description": "Apply a thick, even layer of the mulch over the entire surface of the field, between the planting stations." },
    { "order": 3, "description": "Ensure the blanket is thick enough that you cannot see the soil through it. This is not a light sprinkle." },
    { "order": 4, "description": "When planting, simply make a hole in the blanket at your permanent planting station. Do not remove the entire blanket." },
    { "order": 5, "description": "Continuously add more organic matter to the blanket as it decomposes over time to maintain its thickness." }
  ],
  "related_principles": ["Minimal Soil Disturbance", "High Standards"]
}
```

### Data Ingestion Strategy

1.  **Manual Start:** Begin by manually creating 5-10 key documents in the `knowledge_base` collection using the Firebase Console. This will validate the schema and provide initial data for AI testing.
2.  **Scripted Ingestion:** For larger-scale population, a script (e.g., Node.js with Firebase Admin SDK) can read from structured sources (like CSVs or JSON files) and write to Firestore, ensuring data consistency.
3.  **Community Contribution (Future):** A future feature could allow verified experts to submit new recipes or practices through a dedicated form in the app, which would be reviewed by curators before being added to the knowledge base.

---

## 2. AI Processing & Retrieval Logic (Genkit & Firestore Tools)

Instead of a multi-step Cloud Function process, we will enhance the existing `farming-assistant-flow.ts` by giving it **Tools**. The AI will use these tools to fetch structured data from our new `knowledge_base` collection when it recognizes a specific query.

### Tool and Flow Design

1.  **Define a Genkit Tool:** We'll create a new file, `src/ai/tools/fgw-knf-knowledge-tool.ts`, to define a tool that can query our Firestore knowledge base.

    ```typescript
    // src/ai/tools/fgw-knf-knowledge-tool.ts
    'use server';
    import {ai} from '@/ai/genkit';
    import {z} from 'genkit';
    import {getFirestore, collection, query, where, getDocs, limit} from 'firebase/firestore';
    import {firebaseApp} from '@/lib/firebase';

    const db = getFirestore(firebaseApp);

    export const fwg_knf_tool = ai.defineTool(
      {
        name: 'getFarmingTechniqueDetails',
        description: 'Get detailed information, ingredients, and step-by-step instructions for a specific Farming God\'s Way (FGW) or Korean Natural Farming (KNF) technique, practice, or concoction.',
        inputSchema: z.object({
          techniqueName: z.string().describe('The name of the technique, practice, or recipe. Examples: "Fermented Plant Juice", "FPJ", "God\'s Blanket", "IMO-1"'),
        }),
        outputSchema: z.any(), // We'll return the raw document data
      },
      async (input) => {
        const q = query(
          collection(db, "knowledge_base"),
          where("name", "==", input.techniqueName),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          return { error: 'Technique not found in the knowledge base.' };
        }
        return querySnapshot.docs[0].data();
      }
    );
    ```

2.  **Update the AI Farming Assistant Flow:** We will modify `src/ai/flows/farming-assistant-flow.ts` to use this new tool.

    ```typescript
    // In src/ai/flows/farming-assistant-flow.ts
    
    // 1. Import the new tool
    import {fwg_knf_tool} from '@/ai/tools/fgw-knf-knowledge-tool.ts';

    // 2. Add the tool to the prompt definition
    const farmingAssistantPrompt = ai.definePrompt({
      name: 'farmingAssistantPrompt',
      input: {schema: FarmingAssistantInputSchema},
      output: {schema: FarmingAssistantOutputSchema},
      tools: [fwg_knf_tool], // <--- ADD THIS
      prompt: `... // The existing long prompt remains here, but add this new instruction:

      **Tool Usage for FGW/KNF:**
      If a user asks for specific instructions, ingredients, amounts, or timings for a Farming God's Way (FGW) or Korean Natural Farming (KNF) technique (e.g., "how to make FPJ", "what do I need for God's Blanket?"), you MUST use the \`getFarmingTechniqueDetails\` tool to retrieve the structured data from the knowledge base. Once you have this data, formulate a clear, step-by-step, natural language response based on the retrieved information. Do not guess the recipe; use the tool.
      `,
    });

    // 3. No changes are needed to the flow function itself. Genkit handles the tool-calling logic automatically.
    ```

This tool-based approach is powerful because it lets the LLM decide *when* it needs detailed data, making the interaction more dynamic and accurate.

---

## 3. Firebase Studio Implementation Steps (Actionable Blueprint)

### Firestore Collection Setup

1.  Navigate to the Firestore Database section in the Firebase Console.
2.  Create a new collection named `knowledge_base`.
3.  Click "Add document" and manually create your first few documents using the JSON schema examples provided in Section 1. Use a descriptive ID for each document (e.g., `knf_fpj`, `fgw_gods_blanket`).

### Cloud Functions & Genkit Development

The plan above outlines creating one new file (`src/ai/tools/fgw-knf-knowledge-tool.ts`) and modifying one existing file (`src/ai/flows/farming-assistant-flow.ts`). I will provide these changes in a separate step if you approve this plan.

### Firebase Security Rules

Add the following rules to your `firestore.rules` file to protect the new collection:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ... your existing rules for users, marketplace, etc.

    // Add this new rule for the knowledge base
    match /knowledge_base/{docId} {
      // Allow any authenticated user to read the knowledge base.
      allow read: if request.auth != null;
      // Only allow users with an 'admin' or 'curator' custom claim to write.
      allow write: if request.auth.token.admin == true || request.auth.token.curator == true;
    }
  }
}
```

### Client-Side Integration

**No changes are required on the client-side.** The existing AI Assistant page (`src/app/ai-assistant/page.tsx`) already calls the `askFarmingAssistant` flow. By upgrading the backend logic of that flow, the frontend automatically gains the new, more detailed capabilities without any code modification.

### Testing Protocol

Once implemented, test the enhanced AI with a variety of queries in the AI Assistant chat UI:

*   **Simple Query:** "What is FPJ?"
*   **Ingredient Query:** "What are the ingredients for Fermented Plant Juice?"
*   **Amount Query:** "How much sugar do I need for FPJ?"
*   **Step-by-step Query:** "Show me the steps to make God's Blanket."
*   **Timing Query:** "How long do I ferment IMO?"
*   **Malformed Query:** "Tell me about that blanket thing from FGW."
*   **Conversational Follow-up:** "Okay, and how do I use it on my crops?"

This plan provides a clear and robust path to significantly enhance the AI assistant's expertise, making it a highly valuable tool for your users.
      
