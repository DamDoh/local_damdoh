
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type {KnfBatch} from "./types";
import {_internalLogTraceEvent} from "./traceability";

const db = admin.firestore();

/**
 * Creates a new farm document in Firestore for an authenticated user.
 * @param {any} data The data for the new farm.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, farmId: string}>} A promise that resolves with the new farm ID.
 */
export const createFarm = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  const {name, location, size, farmType, irrigationMethods, description} = data;
  if (!name || !location || !size || !farmType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Name, location, size, and farm type are required.",
    );
  }

  try {
    const newFarmRef = db.collection("farms").doc();
    await newFarmRef.set({
      ownerId: context.auth.uid,
      name,
      location,
      size,
      farmType: farmType,
      irrigationMethods: irrigationMethods || "",
      description: description || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {success: true, farmId: newFarmRef.id};
  } catch (error: any) {
    console.error("Error creating farm:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create farm in the database. Please check your project's Firestore setup.",
      {originalError: error.message},
    );
  }
});

/**
 * Fetches all farms belonging to the currently authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any[]>} A promise that resolves with the user's farms.
 */
export const getUserFarms = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  try {
    const farmsSnapshot = await db
      .collection("farms")
      .where("ownerId", "==", context.auth.uid)
      .get();
    const farms = farmsSnapshot.docs.map((doc) => {
        const docData = doc.data();
        return { 
            id: doc.id, 
            ...docData,
            createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : null,
            updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate().toISOString() : null,
        }
    });
    return farms;
  } catch (error) {
    console.error("Error fetching user farms:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch farms.");
  }
});

/**
 * Fetches a single farm's details.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any>} A promise that resolves with the farm's details.
 */
export const getFarm = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
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
        
        const farmData = farmDoc.data()!;

        // Security check: ensure the authenticated user owns this farm
        if (farmData.ownerId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "You do not have permission to view this farm.");
        }
        
        return { 
            id: farmDoc.id, 
            ...farmData,
            createdAt: farmData.createdAt?.toDate ? farmData.createdAt.toDate().toISOString() : null,
            updatedAt: farmData.updatedAt?.toDate ? farmData.updatedAt.toDate().toISOString() : null,
        };
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
 * After creating the crop, it also logs a 'PLANTED' traceability event.
 * @param {any} data The data for the new crop.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, cropId: string}>} A promise that resolves with the new crop ID.
 */
export const createCrop = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  const {
    farmId,
    cropType,
    plantingDate,
    harvestDate,
    expectedYield,
    currentStage,
    notes,
  } = data;
  if (!farmId || !cropType || !plantingDate) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Farm ID, crop type, and planting date are required.",
    );
  }

  // Security Check: Verify owner
  const farmRef = db.collection("farms").doc(farmId);
  const farmDoc = await farmRef.get();
  if (!farmDoc.exists || farmDoc.data()?.ownerId !== context.auth.uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not have permission to add a crop to this farm.",
    );
  }

  try {
    const newCropRef = db.collection("crops").doc();
    const plantingDateTimestamp = admin.firestore.Timestamp.fromDate(
      new Date(plantingDate),
    );

    await newCropRef.set({
      farmId,
      ownerId: context.auth.uid,
      cropType,
      plantingDate: plantingDateTimestamp,
      harvestDate: harvestDate ?
        admin.firestore.Timestamp.fromDate(new Date(harvestDate)) :
        null,
      expectedYield: expectedYield || "",
      currentStage: currentStage || null,
      notes: notes || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Synergy: Log a PLANTED traceability event for this new crop
    const eventPayload = {
      cropType: cropType,
      plantingDate: plantingDateTimestamp,
      farmFieldId: newCropRef.id,
      notes: "Initial crop creation",
    };

    // Log a pre-harvest event against the field/crop plot ID.
    // A VTI is not created at this stage.
    await _internalLogTraceEvent(
      {
        eventType: "PLANTED",
        actorRef: context.auth.uid,
        geoLocation: null, // Can be added later
        payload: eventPayload,
        farmFieldId: newCropRef.id,
      },
      context,
    );

    return {success: true, cropId: newCropRef.id};
  } catch (error: any) {
    console.error("Error creating crop:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create crop in the database. Please check your project's Firestore setup.",
      {originalError: error.message},
    );
  }
});

/**
 * Fetches all crops associated with a specific farm.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any[]>} A promise that resolves with the farm's crops.
 */
export const getFarmCrops = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  const {farmId} = data;
  if (!farmId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A farmId must be provided.",
    );
  }

  // Security Check: Verify owner
  const farmRef = db.collection("farms").doc(farmId);
  const farmDoc = await farmRef.get();
  if (!farmDoc.exists || farmDoc.data()?.ownerId !== context.auth.uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not have permission to view crops for this farm.",
    );
  }

  try {
        const cropsSnapshot = await db.collection('crops').where('farmId', '==', farmId).get();
        const crops = cropsSnapshot.docs.map(doc => {
            const docData = doc.data();
            return { 
                id: doc.id, 
                ...docData,
                plantingDate: docData.plantingDate?.toDate ? docData.plantingDate.toDate().toISOString() : null,
                harvestDate: docData.harvestDate?.toDate ? docData.harvestDate.toDate().toISOString() : null,
                createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : null,
            };
        });
        return crops;
    } catch (error) {
        console.error("Error fetching farm crops:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch crops.");
    }
});

/**
 * Cloud Function to analyze a farmer's data and provide profitability insights.
 * This enhanced version conceptually uses detailed financial and activity data.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, insights: any[]}>} A promise that resolves with profitability insights.
 */
export const getProfitabilityInsights = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

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
          id: "insight1",
          type: "profitability",
          title: "Maize in Field A is a High Performer",
          details:
            "Analysis shows a 35% higher net margin for your Maize crop compared to your farm average this season. Revenue was high and input costs were moderate.",
          recommendation:
            "Consider allocating more of Field C to Maize next season for potentially higher returns. View full breakdown.",
        },
        {
          id: "insight2",
          type: "expense_optimization",
          title: "Opportunity to Optimize Fertilizer Costs",
          details:
            "Your spending on 'Organic NPK Fertilizer' accounted for 60% of input costs for your Rice crop in Field B.",
          recommendation:
            "A soil test for Field B could help tailor fertilizer application, potentially reducing costs without impacting yield.",
        },
        {
          id: "insight3",
          type: "technique_correlation",
          title: "Early Planting Shows Positive Results",
          details:
            "Your early planting date for Tomatoes in Field C correlated with a 15% higher yield compared to regional averages for later plantings.",
          recommendation:
            "Continue with this successful early planting strategy for tomatoes next season.",
        },
      ];

      return {success: true, insights: mockInsights};
    } catch (error) {
      console.error("Error generating profitability insights:", error);
      throw new functions.https.HttpsError("internal", "Failed to generate insights.");
    }
  },
);

/**
 * Calculates the next step date for a KNF batch.
 * @param {string} type The type of KNF batch.
 * @param {Date} startDate The start date of the batch.
 * @return {{nextStep: string, nextStepDate: Date}} The next step and date.
 */
const getNextStepDate = (
  type: string,
  startDate: Date,
): {nextStep: string; nextStepDate: Date} => {
  let daysToAdd = 7;
  let stepDescription = "Ready for Straining";
  switch (type) {
  case "fpj":
    daysToAdd = 7;
    stepDescription = "Ready for Straining";
    break;
  case "faa":
    daysToAdd = 90;
    stepDescription = "Ready for Straining (Approx. 3 months)";
    break;
  case "wca":
    daysToAdd = 14;
    stepDescription = "Ready (bubbling should stop)";
    break;
  case "imo":
    daysToAdd = 5;
    stepDescription = "Ready for IMO2 processing";
    break;
  case "lab":
    daysToAdd = 7;
    stepDescription = "Ready for milk cultivation";
    break;
  }
  const nextDate = new Date(startDate);
  nextDate.setDate(startDate.getDate() + daysToAdd);
  return {nextStep: stepDescription, nextStepDate: nextDate};
};

/**
 * Creates a new KNF batch document in Firestore for an authenticated user.
 * @param {any} data The data for the new batch.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, batchId: string}>} A promise that resolves with the new batch ID.
 */
export const createKnfBatch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  const {type, typeName, ingredients, startDate} = data;
  if (!type || !typeName || !ingredients || !startDate) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Type, typeName, ingredients, and startDate are required.",
    );
  }

  const userId = context.auth.uid;
  const startDateObj = new Date(startDate);
  const {nextStep, nextStepDate} = getNextStepDate(type, startDateObj);

  try {
    const newBatchRef = db.collection("knf_batches").doc();
    const batchData: Omit<KnfBatch, "id" | "createdAt"> = {
      userId: userId,
      type: type,
      typeName: typeName,
      ingredients: ingredients,
      startDate: admin.firestore.Timestamp.fromDate(startDateObj),
      status: "Fermenting",
      nextStep: nextStep,
      nextStepDate: admin.firestore.Timestamp.fromDate(nextStepDate),
    };

    await newBatchRef.set({
      ...batchData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true, batchId: newBatchRef.id};
  } catch (error: any) {
    console.error("Error creating KNF batch:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create KNF batch in the database.",
      {originalError: error.message},
    );
  }
});

/**
 * Fetches all KNF batches belonging to the currently authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any[]>} A promise that resolves with the user's KNF batches.
 */
export const getUserKnfBatches = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    try {
      const batchesSnapshot = await db
        .collection("knf_batches")
        .where("userId", "==", context.auth.uid)
        .orderBy("createdAt", "desc")
        .get();

      const batches = batchesSnapshot.docs.map((doc) => {
        const docData = doc.data() as KnfBatch;
        return {
          ...docData,
          id: doc.id,
          startDate: (docData.startDate as unknown as admin.firestore.Timestamp)?.toDate ? (docData.startDate as unknown as admin.firestore.Timestamp).toDate().toISOString() : null,
          nextStepDate: (docData.nextStepDate as unknown as admin.firestore.Timestamp)?.toDate ? (docData.nextStepDate as unknown as admin.firestore.Timestamp).toDate().toISOString() : null,
          createdAt: (docData.createdAt as unknown as admin.firestore.Timestamp)?.toDate ? (docData.createdAt as unknown as admin.firestore.Timestamp).toDate().toISOString() : null,
        };
      });
      return batches;
    } catch (error) {
      console.error("Error fetching user KNF batches:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to fetch KNF batches.",
      );
    }
  },
);

/**
 * Updates the status of a KNF batch.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, message: string}>} A promise that resolves when the batch is updated.
 */
export const updateKnfBatchStatus = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    const {batchId, status} = data;
    if (!batchId || !status) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "batchId and status are required.",
      );
    }

    const validStatuses = ["Fermenting", "Ready", "Used", "Archived"];
    if (!validStatuses.includes(status)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Invalid status provided. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const userId = context.auth.uid;
    const batchRef = db.collection("knf_batches").doc(batchId);

    try {
      const batchDoc = await batchRef.get();
      if (!batchDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Batch not found.");
      }

      if (batchDoc.data()?.userId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not have permission to update this batch.",
        );
      }

      await batchRef.update({status: status});

      return {success: true, message: `Batch ${batchId} status updated to ${status}.`};
    } catch (error: any) {
      console.error(`Error updating KNF batch ${batchId}:`, error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update KNF batch status.",
        {originalError: error.message},
      );
    }
  },
);
