
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
  // Telemetry, tracing, and state storage are now configured via plugins
  // or explicit initialization steps, not through the main genkit() config.
  // The 'logSinks' property is no longer valid.
  model: 'googleai/gemini-1.5-flash', // Default model
});
