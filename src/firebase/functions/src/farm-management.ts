

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type {KnfBatch} from "./types";
import {_internalLogTraceEvent} from "./traceability";
import { createFarmSchema, createCropSchema } from "@/lib/schemas";

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
      "error.unauthenticated",
    );
  }

  // Validate incoming data using the Zod schema
  const validation = createFarmSchema.safeParse(data);
  if (!validation.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid farm data provided.",
      validation.error.format()
    );
  }

  const {name, location, size, farmType, irrigationMethods, description} = validation.data;
  
  try {
    const newFarmRef = db.collection("farms").doc();
    await newFarmRef.set({
      ownerId: context.auth.uid,
      name,
      location,
      size,
      farmType,
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
      "error.farm.creationFailed",
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
      "error.unauthenticated",
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
            createdAt: (docData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (docData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });
    return farms;
  } catch (error) {
    console.error("Error fetching user farms:", error);
    throw new functions.https.HttpsError("internal", "error.farm.fetchFailed");
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
      "error.unauthenticated",
    );
  }
    const { farmId } = data;
    if (!farmId) {
        throw new functions.https.HttpsError("invalid-argument", "error.farm.idRequired");
    }
    
    try {
        const farmDoc = await db.collection('farms').doc(farmId).get();
        if (!farmDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.farm.notFound");
        }
        
        const farmData = farmDoc.data()!;

        // Security check: ensure the authenticated user owns this farm
        if (farmData.ownerId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
        }
        
        return { 
            id: farmDoc.id, 
            ...farmData,
            createdAt: (farmData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (farmData.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching farm:", error);
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }
        throw new functions.https.HttpsError("internal", "error.farm.fetchFailed");
  }
});

/**
 * Updates an existing farm document in Firestore for an authenticated user.
 * @param {any} data The data for updating the farm. Must include farmId.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, farmId: string}>} A promise that resolves with the updated farm ID.
 */
export const updateFarm = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "error.unauthenticated",
    );
  }

  const { farmId, ...updatePayload } = data;
  
  const validation = createFarmSchema.partial().safeParse(updatePayload);
  if (!validation.success) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid farm data provided for update.",
        validation.error.format()
    );
  }

  const farmRef = db.collection("farms").doc(farmId);

  try {
    // Security Check: Verify owner
    const farmDoc = await farmRef.get();
    if (!farmDoc.exists) {
        throw new functions.https.HttpsError("not-found", "error.farm.notFound");
    }
    if (farmDoc.data()?.ownerId !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }

    await farmRef.update({
      ...validation.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, farmId: farmRef.id };
  } catch (error: any) {
    console.error(`Error updating farm ${farmId}:`, error);
    if (error instanceof functions.https.HttpsError) {
        throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "error.farm.updateFailed",
      { originalError: error.message },
    );
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
      "error.unauthenticated",
    );
  }
  
  // Validate incoming data
  const validation = createCropSchema.safeParse(data);
  if (!validation.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid crop data provided.",
      validation.error.format()
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
  } = validation.data;

  // Security Check: Verify owner
  const farmRef = db.collection("farms").doc(farmId);
  const farmDoc = await farmRef.get();
  if (!farmDoc.exists || farmDoc.data()?.ownerId !== context.auth.uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "error.permissionDenied",
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
      plantingDate: plantingDateTimestamp.toDate().toISOString(),
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
    );

    return {success: true, cropId: newCropRef.id};
  } catch (error: any) {
    console.error("Error creating crop:", error);
    throw new functions.https.HttpsError(
      "internal",
      "error.crop.creationFailed",
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
      "error.unauthenticated",
    );
  }

  const {farmId} = data;
  if (!farmId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.farm.idRequired",
    );
  }

  // Security Check: Verify owner
  const farmRef = db.collection("farms").doc(farmId);
  const farmDoc = await farmRef.get();
  if (!farmDoc.exists || farmDoc.data()?.ownerId !== context.auth.uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "error.permissionDenied",
    );
  }

  try {
        const cropsSnapshot = await db.collection('crops').where('farmId', '==', farmId).get();
        const crops = cropsSnapshot.docs.map(doc => {
            const docData = doc.data();
            return { 
                id: doc.id, 
                ...docData,
                plantingDate: (docData.plantingDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                harvestDate: (docData.harvestDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                createdAt: (docData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            };
        });
        return crops;
    } catch (error) {
        console.error("Error fetching farm crops:", error);
        throw new functions.https.HttpsError("internal", "error.crop.fetchFailed");
    }
});

export const getCrop = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }

    const { cropId } = data;
    if (!cropId) {
        throw new functions.https.HttpsError("invalid-argument", "error.crop.idRequired");
    }

    try {
        const cropDoc = await db.collection('crops').doc(cropId).get();
        if (!cropDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.crop.notFound");
        }

        const cropData = cropDoc.data()!;
        if (cropData.ownerId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
        }
        
        return {
            id: cropDoc.id,
            ...cropData,
            plantingDate: (cropData.plantingDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            harvestDate: (cropData.harvestDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            createdAt: (cropData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        };

    } catch(error) {
        console.error("Error fetching crop:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "error.crop.fetchFailed");
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
        "error.unauthenticated",
      );
    }

    try {
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
      ];

      return {success: true, insights: mockInsights};
    } catch (error) {
      console.error("Error generating profitability insights:", error);
      throw new functions.https.HttpsError("internal", "error.insights.failed");
    }
  },
);

const getNextStepDate = (
  type: string,
  startDate: Date,
): {nextStep: string; nextStepDate: Date} => {
  let daysToAdd = 7;
  let stepDescription = "Ready for Straining";
  switch (type) {
  case "fpj": daysToAdd = 7; break;
  case "faa": daysToAdd = 90; stepDescription = "Ready for Straining (Approx. 3 months)"; break;
  case "wca": daysToAdd = 14; stepDescription = "Ready (bubbling should stop)"; break;
  case "imo": daysToAdd = 5; stepDescription = "Ready for IMO2 processing"; break;
  case "lab": daysToAdd = 7; stepDescription = "Ready for milk cultivation"; break;
  }
  const nextDate = new Date(startDate);
  nextDate.setDate(startDate.getDate() + daysToAdd);
  return {nextStep: stepDescription, nextStepDate: nextDate};
};

export const createKnfBatch = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");

  const {type, typeName, ingredients, startDate, quantityProduced, unit} = data;
  if (!type || !typeName || !ingredients || !startDate || !quantityProduced || !unit) {
    throw new functions.https.HttpsError("invalid-argument", "error.knf.missingFields");
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
      nextStepDate: admin.firestore.Timestamp.fromDate(nextStepDate),
      status: "Fermenting",
      nextStep: nextStep,
      quantityProduced,
      unit,
    };

    await newBatchRef.set({
      ...batchData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true, batchId: newBatchRef.id};
  } catch (error: any) {
    console.error("Error creating KNF batch:", error);
    throw new functions.https.HttpsError("internal", "error.knf.creationFailed", {originalError: error.message});
  }
});


export const getUserKnfBatches = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");

    try {
      const batchesSnapshot = await db.collection("knf_batches")
        .where("userId", "==", context.auth.uid)
        .orderBy("createdAt", "desc")
        .get();

      const batches = batchesSnapshot.docs.map((doc) => {
        const docData = doc.data() as KnfBatch;
        return {
          ...docData,
          id: doc.id,
          startDate: (docData.startDate as unknown as admin.firestore.Timestamp)?.toDate?.().toISOString(),
          nextStepDate: (docData.nextStepDate as unknown as admin.firestore.Timestamp)?.toDate?.().toISOString(),
          createdAt: (docData.createdAt as unknown as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        };
      });
      return batches;
    } catch (error) {
      console.error("Error fetching user KNF batches:", error);
      throw new functions.https.HttpsError("internal", "error.knf.fetchFailed");
    }
  },
);

export const updateKnfBatchStatus = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");

    const {batchId, status} = data;
    if (!batchId || !status) throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");

    const validStatuses = ["Fermenting", "Ready", "Used", "Archived"];
    if (!validStatuses.includes(status)) throw new functions.https.HttpsError("invalid-argument", `Invalid status provided.`);

    const userId = context.auth.uid;
    const batchRef = db.collection("knf_batches").doc(batchId);

    try {
      const batchDoc = await batchRef.get();
      if (!batchDoc.exists) throw new functions.https.HttpsError("not-found", "error.knf.notFound");
      if (batchDoc.data()?.userId !== userId) throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");

      await batchRef.update({status: status});
      return {success: true, message: `Batch ${batchId} status updated to ${status}.`};
    } catch (error: any) {
      console.error(`Error updating KNF batch ${batchId}:`, error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", "error.knf.updateFailed", {originalError: error.message});
    }
  },
);

export const updateCrop = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const { cropId, ...updatePayload } = data;
    if (!cropId) {
        throw new functions.https.HttpsError("invalid-argument", "error.crop.idRequired");
    }
    
    const cropRef = db.collection('crops').doc(cropId);
    
    try {
        const cropDoc = await cropRef.get();
        if (!cropDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.crop.notFound");
        }
        if (cropDoc.data()?.ownerId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
        }
        
        const payload: { [key: string]: any } = { ...updatePayload, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
        
        if (updateData.plantingDate) payload.plantingDate = admin.firestore.Timestamp.fromDate(new Date(updateData.plantingDate));
        if (updateData.harvestDate) payload.harvestDate = admin.firestore.Timestamp.fromDate(new Date(updateData.harvestDate));

        await cropRef.update(payload);
        return { success: true, message: "Crop updated successfully." };

    } catch(error: any) {
        console.error(`Error updating crop ${cropId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "error.crop.updateFailed");
    }
});
