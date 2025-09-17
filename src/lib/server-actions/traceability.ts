
'use server';
import { apiCall } from '../api-utils';
import { getCurrentUser } from '../server-auth-utils';

// A wrapper to call the getVtiTraceabilityHistory API endpoint.
// No auth check here as it's a public function, but having it as a server action
// provides a consistent way to call backend logic.
export async function getVtiTraceabilityHistory(vtiId: string): Promise<any> {
  if (!vtiId) {
    throw new Error("A VTI ID must be provided.");
  }
  
  try {
    const result = await apiCall<any>(`/traceability/history/${vtiId}`, {
      method: 'GET',
    });
    return result;
  } catch (error) {
    console.error("Error calling traceability-getVtiTraceabilityHistory:", error);
    // Re-throw the error so the client-side can handle it.
    throw error;
  }
}
