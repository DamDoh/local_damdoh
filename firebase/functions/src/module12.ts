
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BigQuery } from '@google-cloud/bigquery';

const db = admin.firestore();

async function getEmissionFactor(criteria: { region: string, activityType: string, inputType?: string, factorType?: string }): Promise<any | null> {
    console.log('Fetching emission factor for criteria (placeholder):', criteria);
    return null;
}

async function getRegionForCalculation(data: any): Promise<string | null> {
     console.log('Determining region for calculation (placeholder):', data);
     return 'Global';
}

export const calculateCarbonFootprint = functions.firestore
    .document('traceability_events/{eventId}')
    .onWrite(async (change, context) => { 
        const document = change.after.exists ? change.after.data() : null;
        const eventId = context.params.eventId;

        if (!document || change.before.exists) {
             console.log(`Ignoring update or delete on traceability_events/${eventId}.`);
             return null;
        }

        console.log(`Triggered carbon footprint calculation for new event: traceability_events/${eventId}`);
        
        const relevantEventTypes = ['INPUT_APPLIED', 'TRANSPORTED'];
        const eventType = document.eventType;

        if (!eventType || !relevantEventTypes.includes(eventType)) {
             console.log(`Event type '${eventType}' is not relevant for carbon footprint calculation. Skipping.`);
             return null;
        }

        try {
            const vtiId = document.vtiId || null;
            const userRef = document.userRef || document.actorRef || null;
            
            if (eventType === 'INPUT_APPLIED' && document.payload?.input_type && document.payload?.quantity && document.payload?.unit) {
                const { input_type, quantity, unit } = document.payload;
                console.log(`Processing INPUT_APPLIED event for input type ${input_type}, quantity ${quantity} ${unit}`);
                
                const region = await getRegionForCalculation(document);
                const emissionFactor = await getEmissionFactor({ region: region || 'Global', activityType: 'INPUT_APPLIED', inputType: input_type, factorType: unit });

                if (emissionFactor) {
                    const calculatedEmissions = quantity * emissionFactor.value;
                    const emissionsUnit = emissionFactor.unit;

                    await db.collection('carbon_footprint_data').add({
                        vtiId: vtiId,
                        userRef: userRef,
                        eventType: eventType,
                        eventRef: db.collection('traceability_events').doc(eventId),
                        timestamp: document.timestamp || admin.firestore.FieldValue.serverTimestamp(),
                        calculatedEmissions: calculatedEmissions,
                        unit: emissionsUnit,
                        emissionFactorUsed: emissionFactor,
                        dataSource: 'traceability_event',
                        region: region,
                        details: document.payload,
                    });
                    console.log(`Carbon footprint calculated and stored for event/${eventId}. Emissions: ${calculatedEmissions} ${emissionsUnit}`);
                } else {
                    console.warn(`Emission factor not found for INPUT_APPLIED event type '${input_type}' in region '${region}'.`);
                }

            } else if (eventType === 'TRANSPORTED' && document.payload?.distance && document.payload?.transport_mode) {
                console.log(`Processing TRANSPORTED event (calculation not implemented yet).`);
            } else {
                console.log(`Event type '${eventType}' is relevant but detailed calculation not implemented yet.`);
            }

            console.log(`Calculation trigger for event/${eventId} completed.`);
            return null;

        } catch (error) {
            console.error(`Error calculating carbon footprint for event/${eventId}:`, error);
            return null;
        }
    });
