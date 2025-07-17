
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * Initialize and export the Genkit AI instance.
 * This instance is configured with the Google AI plugin and will use the
 * GEMINI_API_KEY from the environment variables when running in a server-side
 * context (like Firebase Cloud Functions).
 */
export const ai = genkit({
  plugins: [
    googleAI({
        // This will automatically use the GEMINI_API_KEY environment variable.
    }),
  ],
  logSinks: [], // You can add log sinks here for production if needed, e.g., to Google Cloud Logging.
  flowStateStore: 'firebase', // Use Firestore to store flow states
  traceStore: 'firebase',     // Use Firestore to store traces
  model: 'googleai/gemini-1.5-flash', // Default model
});
