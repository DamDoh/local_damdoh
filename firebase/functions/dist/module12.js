"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCarbonFootprint = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Fetches the emission factor for a given set of criteria.
 * @param {object} criteria The criteria to use for fetching the emission factor.
 * @return {Promise<any | null>} A promise that resolves with the emission factor or null if not found.
 */
async function getEmissionFactor(criteria) {
    console.log("Fetching emission factor for criteria (placeholder):", criteria);
    return null;
}
/**
 * Determines the region for a calculation based on the provided data.
 * @param {any} data The data to use for determining the region.
 * @return {Promise<string | null>} A promise that resolves with the region or null if not found.
 */
async function getRegionForCalculation(data) {
    console.log("Determining region for calculation (placeholder):", data);
    return "Global";
}
exports.calculateCarbonFootprint = functions.firestore
    .document("traceability_events/{eventId}")
    .onWrite(async (change, context) => {
    var _a, _b, _c, _d, _e;
    const document = change.after.exists ? change.after.data() : null;
    const eventId = context.params.eventId;
    if (!document || change.before.exists) {
        console.log(`Ignoring update or delete on traceability_events/${eventId}.`);
        return null;
    }
    console.log(`Triggered carbon footprint calculation for new event: traceability_events/${eventId}`);
    const relevantEventTypes = ["INPUT_APPLIED", "TRANSPORTED"];
    const eventType = document.eventType;
    if (!eventType || !relevantEventTypes.includes(eventType)) {
        console.log(`Event type '${eventType}' is not relevant for carbon footprint calculation. Skipping.`);
        return null;
    }
    try {
        const vtiId = document.vtiId || null;
        const userRef = document.userRef || document.actorRef || null;
        if (eventType === "INPUT_APPLIED" &&
            ((_a = document.payload) === null || _a === void 0 ? void 0 : _a.inputType) &&
            ((_b = document.payload) === null || _b === void 0 ? void 0 : _b.quantity) &&
            ((_c = document.payload) === null || _c === void 0 ? void 0 : _c.unit)) {
            const { inputType, quantity, unit } = document.payload;
            console.log(`Processing INPUT_APPLIED event for input type ${inputType}, quantity ${quantity} ${unit}`);
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
                    timestamp: document.timestamp || admin.firestore.FieldValue.serverTimestamp(),
                    calculatedEmissions: calculatedEmissions,
                    unit: emissionsUnit,
                    emissionFactorUsed: emissionFactor,
                    dataSource: "traceability_event",
                    region: region,
                    details: document.payload,
                });
                console.log(`Carbon footprint calculated and stored for event/${eventId}. Emissions: ${calculatedEmissions} ${emissionsUnit}`);
            }
            else {
                console.warn(`Emission factor not found for INPUT_APPLIED event type '${inputType}' in region '${region}'.`);
            }
        }
        else if (eventType === "TRANSPORTED" &&
            ((_d = document.payload) === null || _d === void 0 ? void 0 : _d.distance) &&
            ((_e = document.payload) === null || _e === void 0 ? void 0 : _e.transport_mode)) {
            console.log("Processing TRANSPORTED event (calculation not implemented yet).");
        }
        else {
            console.log(`Event type '${eventType}' is relevant but detailed calculation not implemented yet.`);
        }
        console.log(`Calculation trigger for event/${eventId} completed.`);
        return null;
    }
    catch (error) {
        console.error(`Error calculating carbon footprint for event/${eventId}:`, error);
        return null;
    }
});
//# sourceMappingURL=module12.js.map