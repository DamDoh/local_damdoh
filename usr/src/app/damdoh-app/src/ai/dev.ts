import { config } from 'dotenv';
config();

// Ensure the Firebase Admin SDK is initialized for server-side operations
import '@/lib/firebase/admin';

// This is the primary entry point for the Genkit development server
// running within the Next.js app.
import './flows/farming-assistant-flow';
import './flows/forum-topic-suggestions';
import './flows/market-insights-flow';
import './flows/marketplace-recommendations';
import './flows/profile-summary-generator';
import './flows/query-interpreter-flow';
import './flows/suggested-connections';
