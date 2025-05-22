
import { config } from 'dotenv';
config();

import '@/ai/flows/forum-topic-suggestions.ts';
import '@/ai/flows/suggested-connections.ts';
import '@/ai/flows/profile-summary-generator.ts';
import '@/ai/flows/farming-assistant-flow.ts';
import '@/ai/flows/market-insights-flow.ts'; // Added new market insights flow
