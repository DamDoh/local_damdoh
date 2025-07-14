'use server';
/**
 * @fileOverview An AI flow to detect anomalies in a VTI's event history.
 *
 * - detectTraceabilityAnomaly - A function that analyzes a VTI's event log.
 * - DetectTraceabilityAnomalyInput - The input type for the flow.
 * - DetectTraceabilityAnomalyOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';

const DetectTraceabilityAnomalyInputSchema = z.object({
  vtiId: z.string().describe("The Verifiable Traceability ID of the batch to analyze."),
});
export type DetectTraceabilityAnomalyInput = z.infer<typeof DetectTraceabilityAnomalyInputSchema>;

const DetectTraceabilityAnomalyOutputSchema = z.object({
  isAnomaly: z.boolean().describe("Whether a potential anomaly was detected in the event log."),
  reason: z.string().optional().describe("A concise explanation of why the event log is considered anomalous. Omit if no anomaly is found."),
});
export type DetectTraceabilityAnomalyOutput = z.infer<typeof DetectTraceabilityAnomalyOutputSchema>;


const prompt = ai.definePrompt({
  name: 'detectTraceabilityAnomalyPrompt',
  input: { schema: z.object({ eventLog: z.string() }) },
  output: { schema: DetectTraceabilityAnomalyOutputSchema },
  prompt: `You are an expert supply chain auditor specializing in agriculture. Your task is to analyze a log of traceability events for a product batch and identify any potential anomalies.

Event Log (JSON format, sorted by timestamp):
\`\`\`json
{{{eventLog}}}
\`\`\`

Analyze the log for the following types of anomalies:
1.  **Unusual Time Gaps:** Look for excessively long delays between critical steps (e.g., more than 24 hours between 'HARVESTED' and 'TRANSPORTED' for perishable goods).
2.  **Geographic Implausibility:** Check if the geographic location of sequential events makes sense. A sudden jump of hundreds of kilometers in a short time is an anomaly.
3.  **Logical Inconsistencies:** Identify events that seem out of order or illogical (e.g., 'PROCESSED' before 'HARVESTED').
4.  **Data Mismatches:** Note any inconsistencies in the data payload between events if possible.

Based on your analysis, determine if there is an anomaly. If you find one, set 'isAnomaly' to true and provide a concise 'reason' explaining the single most significant anomaly you found. If everything looks normal, set 'isAnomaly' to false.
`,
});

export const detectTraceabilityAnomalyFlow = ai.defineFlow(
  {
    name: 'detectTraceabilityAnomalyFlow',
    inputSchema: DetectTraceabilityAnomalyInputSchema,
    outputSchema: DetectTraceabilityAnomalyOutputSchema,
  },
  async ({ vtiId }) => {
    const db = getAdminDb();
    if (!db) {
        throw new Error("Firestore Admin DB not initialized.");
    }
    
    const eventsSnapshot = await db.collection('traceability_events').where('vtiId', '==', vtiId).orderBy('timestamp', 'asc').get();
    
    if (eventsSnapshot.empty) {
        return { isAnomaly: false };
    }
    
    const events = eventsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            eventType: data.eventType,
            timestamp: (data.timestamp as admin.firestore.Timestamp).toDate().toISOString(),
            payload: data.payload,
            location: data.geoLocation,
        }
    });

    const { output } = await prompt({ eventLog: JSON.stringify(events, null, 2) });
    return output!;
  }
);
