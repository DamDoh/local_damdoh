
// Simplified offline sync implementation without Firebase dependencies
// This provides the same interface but with basic functionality

/**
 * Adds a mutation to the offline outbox queue.
 * @param type The type of mutation (create, update, delete).
 * @param collection The collection name.
 * @param docId The ID of the document.
 * @param data The data for the mutation.
 */
export async function addToOfflineOutbox(
  type: 'create' | 'update' | 'delete',
  collection: string,
  docId: string,
  data: any
): Promise<void> {
  // Store in localStorage for simplicity (in production, use IndexedDB or similar)
  const key = 'damdoh-offline-mutations';
  const existing = localStorage.getItem(key);
  const mutations = existing ? JSON.parse(existing) : [];

  mutations.push({
    id: Date.now(),
    createdAt: new Date(),
    type,
    collection,
    docId,
    data,
    status: 'pending',
  });

  localStorage.setItem(key, JSON.stringify(mutations));
  console.log(`Mutation added to outbox: ${type} ${collection}/${docId}`);

  // Trigger sync if online
  if (navigator.onLine) {
    syncOfflineMutations();
  }
}

/**
 * Processes the offline mutation queue, sending pending items to the server.
 */
export async function syncOfflineMutations(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline. Sync postponed.');
    return;
  }

  const key = 'damdoh-offline-mutations';
  const existing = localStorage.getItem(key);
  if (!existing) return;

  const mutations = JSON.parse(existing);
  const pendingMutations = mutations.filter((m: any) => m.status === 'pending');

  if (pendingMutations.length === 0) {
    return;
  }

  console.log(`Syncing ${pendingMutations.length} pending mutations...`);

  // Mark as processing
  pendingMutations.forEach((m: any) => m.status = 'processing');
  localStorage.setItem(key, JSON.stringify(mutations));

  const changesToUpload = pendingMutations.map((mutation: any) => ({
    collectionPath: mutation.collection,
    documentId: mutation.docId,
    operation: mutation.type,
    payload: mutation.data,
    timestamp: mutation.createdAt,
  }));

  try {
    const response = await fetch('/api/offline-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ changes: changesToUpload }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Mark as completed
    pendingMutations.forEach((m: any) => m.status = 'completed');
    localStorage.setItem(key, JSON.stringify(mutations));
    console.log(`${changesToUpload.length} mutations successfully synced.`);

  } catch (error) {
    console.error('Failed to sync offline changes:', error);
    // Mark as failed
    pendingMutations.forEach((m: any) => m.status = 'failed');
    localStorage.setItem(key, JSON.stringify(mutations));
  }
}

// Listen for online/offline events to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineMutations);
}
