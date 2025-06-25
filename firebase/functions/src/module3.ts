
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Creates a new farm document in Firestore for an authenticated user.
 */
export const createFarm = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  
  const { name, location, size, farmType, irrigationMethods, description } = data;
  if (!name || !location || !size || !farmType) {
    throw new functions.https.HttpsError("invalid-argument", "Name, location, size, and farm type are required.");
  }

  try {
    const newFarmRef = db.collection('farms').doc();
    await newFarmRef.set({
      owner_id: context.auth.uid,
      name,
      location,
      size,
      farm_type: farmType,
      irrigationMethods: irrigationMethods || "",
      description: description || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, farmId: newFarmRef.id };
  } catch (error) {
    console.error("Error creating farm:", error);
    throw new functions.https.HttpsError("internal", "Failed to create farm.");
  }
});

/**
 * Fetches all farms belonging to the currently authenticated user.
 */
export const getUserFarms = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  try {
    const farmsSnapshot = await db.collection('farms').where('owner_id', '==', context.auth.uid).get();
    const farms = farmsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return farms;
  } catch (error) {
    console.error("Error fetching user farms:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch farms.");
  }
});

/**
 * Fetches a single farm's details.
 */
export const getFarm = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { farmId } = data;
    if (!farmId) {
        throw new functions.https.HttpsError("invalid-argument", "A farmId must be provided.");
    }
    
    try {
        const farmDoc = await db.collection('farms').doc(farmId).get();
        if (!farmDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Farm not found.");
        }
        
        const farmData = farmDoc.data();

        // Security check: ensure the authenticated user owns this farm
        if (farmData.owner_id !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "You do not have permission to view this farm.");
        }
        
        return { id: farmDoc.id, ...farmData };
    } catch (error) {
        console.error("Error fetching farm:", error);
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to fetch farm details.");
    }
});

/**
 * Creates a new crop document associated with a farm.
 */
export const createCrop = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    
    const { farm_id, crop_type, planting_date, harvest_date, expected_yield, current_stage, notes } = data;
    if (!farm_id || !crop_type || !planting_date) {
        throw new functions.https.HttpsError("invalid-argument", "Farm ID, crop type, and planting date are required.");
    }

    // Security Check: Verify owner
    const farmRef = db.collection('farms').doc(farm_id);
    const farmDoc = await farmRef.get();
    if (!farmDoc.exists || farmDoc.data()?.owner_id !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission to add a crop to this farm.");
    }

    try {
        const newCropRef = db.collection('crops').doc();
        await newCropRef.set({
            farm_id,
            owner_id: context.auth.uid,
            crop_type,
            planting_date: admin.firestore.Timestamp.fromDate(new Date(planting_date)),
            harvest_date: harvest_date ? admin.firestore.Timestamp.fromDate(new Date(harvest_date)) : null,
            expected_yield: expected_yield || "",
            current_stage: current_stage || null,
            notes: notes || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, cropId: newCropRef.id };
    } catch (error) {
        console.error("Error creating crop:", error);
        throw new functions.https.HttpsError("internal", "Failed to create crop.");
    }
});

/**
 * Fetches all crops associated with a specific farm.
 */
export const getFarmCrops = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    
    const { farmId } = data;
    if (!farmId) {
        throw new functions.https.HttpsError("invalid-argument", "A farmId must be provided.");
    }

    // Security Check: Verify owner
    const farmRef = db.collection('farms').doc(farmId);
    const farmDoc = await farmRef.get();
    if (!farmDoc.exists || farmDoc.data()?.owner_id !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission to view crops for this farm.");
    }

    try {
        const cropsSnapshot = await db.collection('crops').where('farm_id', '==', farmId).get();
        const crops = cropsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return crops;
    } catch (error) {
        console.error("Error fetching farm crops:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch crops.");
    }
});


/**
 * Cloud Function to analyze a farmer's data and provide profitability insights.
 * This enhanced version conceptually uses detailed financial and activity data.
 */
export const getProfitabilityInsights = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  const userId = context.auth.uid;
  
  try {
    // --- This function would perform more complex data aggregation and analysis ---
    // 1. Fetch all financial records for the user (`farm_financials`).
    // 2. Fetch all farm activity logs (`traceability_events`).
    // 3. Correlate income from sales with specific `HARVESTING` events to determine revenue per crop/field.
    // 4. Correlate expenses for inputs with `INPUT_APPLICATION` events to determine cost per crop/field.
    // 5. Calculate net profit per crop/field.
    // 6. Run logic/AI model to identify key insights from this data.

    // --- We will return more detailed mock data that simulates this deeper analysis ---
    const mockInsights = [
      {
        id: 'insight1',
        type: 'profitability',
        title: 'Maize in Field A is a High Performer',
        details: 'Analysis shows a 35% higher net margin for your Maize crop compared to your farm average this season. Revenue was high and input costs were moderate.',
        recommendation: 'Consider allocating more of Field C to Maize next season for potentially higher returns. View full breakdown.'
      },
      {
        id: 'insight2',
        type: 'expense_optimization',
        title: 'Opportunity to Optimize Fertilizer Costs',
        details: 'Your spending on "Organic NPK Fertilizer" accounted for 60% of input costs for your Rice crop in Field B.',
        recommendation: 'A soil test for Field B could help tailor fertilizer application, potentially reducing costs without impacting yield.'
      },
      {
        id: 'insight3',
        type: 'technique_correlation',
        title: 'Early Planting Shows Positive Results',
        details: 'Your early planting date for Tomatoes in Field C correlated with a 15% higher yield compared to regional averages for later plantings.',
        recommendation: 'Continue with this successful early planting strategy for tomatoes next season.'
      }
    ];

    return { success: true, insights: mockInsights };

  } catch (error) {
    console.error("Error generating profitability insights:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate insights.");
  }
});
