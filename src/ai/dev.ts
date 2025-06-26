
import { config } from 'dotenv';
config();

import '@/ai/flows/forum-topic-suggestions.ts';
import '@/ai/flows/suggested-connections.ts';
import '@/ai/flows/profile-summary-generator.ts';
import '@/ai/flows/farming-assistant-flow.ts';
import '@/ai/flows/market-insights-flow.ts';
import '@/ai/flows/query-interpreter-flow.ts';
import '@/ai/flows/marketplace-recommendations.ts'; // Added new recommendations flow
// import '@/ai/tools/fgw-knf-knowledge-tool';
