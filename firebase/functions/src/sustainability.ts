
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Fetches the emission factor for a given set of criteria.
 * @param {object} criteria The criteria to use for fetching the emission factor.
 * @return {Promise<any | null>} A promise that resolves with the emission factor or null if not found.
 */
async function getEmissionFactor(criteria: {
  region: string,
  activityType: string,
  inputType?: string,
  factorType?: string,
}): Promise<any | null> {
  console.log("Fetching emission factor for criteria (placeholder):", criteria);
  // In a real implementation, this would query a dedicated 'emission_factors' collection
  // based on the provided criteria.
  return null; // Returning null as this is a placeholder.
}

/**
 * Determines the region for a calculation based on the provided data.
 * @param {any} data The data to use for determining the region.
 * @return {Promise<string | null>} A promise that resolves with the region or null if not found.
 */
async function getRegionForCalculation(data: any): Promise<string | null> {
  // Logic to determine region, e.g., from farm location in user profile
  console.log("Determining region for calculation (placeholder):", data);
  return "Global"; // Placeholder
}

export const calculateCarbonFootprint = functions.firestore
  .document("traceability_events/{eventId}")
  .onWrite(async (change, context) => {
    const document = change.after.exists ? change.after.data() : null;
    const eventId = context.params.eventId;
    
    // Only process new events
    if (!document || change.before.exists) {
      return null;
    }

    console.log(
      `Triggered carbon footprint calculation for new event: traceability_events/${eventId}`,
    );

    const relevantEventTypes = ["INPUT_APPLIED", "TRANSPORTED"];
    const eventType = document.eventType;

    if (!eventType || !relevantEventTypes.includes(eventType)) {
      console.log(
        `Event type '${eventType}' is not relevant for carbon footprint calculation. Skipping.`,
      );
      return null;
    }

    try {
      const vtiId = document.vtiId || null;
      const userRef = document.userRef || document.actorRef || null;

      if (
        eventType === "INPUT_APPLIED" &&
        document.payload?.inputType &&
        document.payload?.quantity &&
        document.payload?.unit
      ) {
        const {inputType, quantity, unit} = document.payload;
        console.log(
          `Processing INPUT_APPLIED event for input type ${inputType}, quantity ${quantity} ${unit}`,
        );

        const region = await getRegionForCalculation(document);
        const emissionFactor = await getEmissionFactor({
          region: region || "Global",
          activityType: "INPUT_APPLIED",
          inputType: inputType,
          factorType: unit,
        });

        if (emissionFactor) {
          const calculatedEmissions = quantity * emissionFactor.value;
          const emissionsUnit = emissionFactor.unit;

          await db.collection("carbon_footprint_data").add({
            vtiId: vtiId,
            userRef: userRef,
            eventType: eventType,
            eventRef: db.collection("traceability_events").doc(eventId),
            timestamp:
              document.timestamp || admin.firestore.FieldValue.serverTimestamp(),
            calculatedEmissions: calculatedEmissions,
            unit: emissionsUnit,
            emissionFactorUsed: emissionFactor,
            dataSource: "traceability_event",
            region: region,
            details: document.payload,
          });
          console.log(
            `Carbon footprint calculated and stored for event/${eventId}. Emissions: ${calculatedEmissions} ${emissionsUnit}`,
          );
        } else {
          console.warn(
            `Emission factor not found for INPUT_APPLIED event type '${inputType}' in region '${region}'.`,
          );
        }
      } else if (
        eventType === "TRANSPORTED" &&
        document.payload?.distance &&
        document.payload?.transport_mode
      ) {
        console.log("Processing TRANSPORTED event (calculation not implemented yet).");
      } else {
        console.log(
          `Event type '${eventType}' is relevant but detailed calculation not implemented yet.`,
        );
      }

      console.log(`Calculation trigger for event/${eventId} completed.`);
      return null;
    } catch (error) {
      console.error(
        `Error calculating carbon footprint for event/${eventId}:`,
        error,
      );
      return null;
    }
  });


export const getSustainabilityDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userId = context.auth.uid;

    // In a real app, this would involve complex aggregation queries on the `carbon_footprint_data` collection
    // and other data sources. For now, we return mock data that matches the frontend's expectations.
    return {
        carbonFootprint: {
            total: 1250, // kg CO2e
            unit: 'kg CO2e',
            trend: -5, // % change over last month
        },
        waterUsage: {
            efficiency: 85, // %
            unit: '% efficiency',
            trend: 2,
        },
        biodiversityScore: {
            score: 7.8,
            unit: '/ 10',
            trend: 0.5,
        },
        sustainablePractices: [
            { id: 'p1', practice: 'Cover Cropping', lastLogged: new Date().toISOString() },
            { id: 'p2', practice: 'No-Till Farming', lastLogged: new Date(Date.now() - 86400000 * 10).toISOString() },
            { id: 'p3', practice: 'Integrated Pest Management', lastLogged: new Date(Date.now() - 86400000 * 5).toISOString() },
        ],
        certifications: [
            { id: 'c1', name: 'USDA Organic', status: 'Active', expiry: new Date(Date.now() + 86400000 * 180).toISOString() },
            { id: 'c2', name: 'Fair Trade Certified', status: 'Active', expiry: new Date(Date.now() + 86400000 * 300).toISOString() },
        ]
    };
});
