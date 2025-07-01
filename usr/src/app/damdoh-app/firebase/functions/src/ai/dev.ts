
import { config } from 'dotenv';
config();

// Ensure the Firebase Admin SDK is initialized for server-side operations
import '../lib/firebase/admin';

// This file is now primarily for backend-only Genkit flows.
// The Farming Assistant and its related tools have been moved to the Next.js app.
// For example:
// import '@/ai/flows/backend-data-processing-flow.ts';
