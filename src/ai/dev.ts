
import { config } from 'dotenv';
config();

// Ensure the Firebase Admin SDK is initialized for server-side operations
import '@/lib/firebase/admin';

import '@/ai/flows/forum-topic-suggestions.ts';
import '@/ai/flows/suggested-connections.ts';
import '@/ai/flows/profile-summary-generator.ts';
import '@/ai/flows/farming-assistant-flow.ts';
import '@/ai/flows/market-insights-flow.ts';
import '@/ai/flows/query-interpreter-flow.ts';
import '@/ai/tools/stakeholder-info-tool.ts';
import '@/ai/flows/suggest-market-price-flow.ts';
import '@/ai/tools/fgw-knf-knowledge-tool.ts';
import '@/ai/flows/marketplace-recommendations.ts';
import '@/ai/flows/crop-rotation-suggester';
import '@/ai/flows/diagnose-crop-flow';
import '@/ai/tools/file-writer-tool.ts';
import '@/ai/flows/translate-flow.ts';
import '@/ai/flows/generate-forum-post-draft.ts';
