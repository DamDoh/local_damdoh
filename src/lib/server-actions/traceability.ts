
'use server';
import { getFunctions, httpsCallable, type HttpsCallableResult } from 'firebase/functions';
import { app } from '../firebase/client'; // Use client instance for server components
import { getCurrentUser } from '../server-auth-utils';

const functions = getFunctions(app);

// A wrapper to call the getVtiTraceabilityHistory Cloud Function.
// No auth check here as it's a public function, but having it as a server action
// provides a consistent way to call backend logic.
export async function getVtiTraceabilityHistory(vtiId: string): Promise<any> {
  if (!vtiId) {
    throw new Error("A VTI ID must be provided.");
  }
  
  const getVtiHistoryCallable = httpsCallable(functions, 'traceability-getVtiTraceabilityHistory');

  try {
    const result: HttpsCallableResult<any> = await getVtiHistoryCallable({ vtiId });
    return result.data;
  } catch (error) {
    console.error("Error calling traceability-getVtiTraceabilityHistory:", error);
    // Re-throw the error so the client-side can handle it.
    throw error;
  }
}
