
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the schema for our offline database
interface OfflineSyncDB extends DBSchema {
  'offline-mutations': {
    key: number;
    value: {
      id: number;
      createdAt: Date;
      type: 'create' | 'update' | 'delete';
      collection: string;
      docId: string;
      data: any;
      status: 'pending' | 'processing' | 'completed' | 'failed';
    };
    indexes: { 'by-status': 'status' };
  };
}

let db: IDBPDatabase<OfflineSyncDB>;

/**
 * Initializes the IndexedDB database.
 */
export async function initOfflineSyncDB(): Promise<void> {
  if (db) return;

  db = await openDB<OfflineSyncDB>('damdoh-offline-sync', 1, {
    upgrade(db) {
      const store = db.createObjectStore('offline-mutations', {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('by-status', 'status');
    },
  });

  console.log('Offline sync database initialized.');
}

/**
 * Adds a mutation to the offline outbox queue.
 * @param type The type of mutation (create, update, delete).
 * @param collection The Firestore collection name.
 * @param docId The ID of the document.
 * @param data The data for the mutation.
 */
export async function addToOfflineOutbox(
  type: 'create' | 'update' | 'delete',
  collection: string,
  docId: string,
  data: any
): Promise<void> {
  if (!db) await initOfflineSyncDB();

  await db.add('offline-mutations', {
    id: Date.now(), // Simple ID for this example
    createdAt: new Date(),
    type,
    collection,
    docId,
    data,
    status: 'pending',
  });

  console.log(`Mutation added to outbox: ${type} ${collection}/${docId}`);
  
  // Trigger the sync process in the background
  syncOfflineMutations();
}

/**
 * Processes the offline mutation queue, sending pending items to a Cloud Function.
 */
export async function syncOfflineMutations(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline. Sync postponed.');
    return;
  }

  if (!db) await initOfflineSyncDB();

  const tx = db.transaction('offline-mutations', 'readwrite');
  const index = tx.store.index('by-status');
  const pendingMutations = await index.getAll('pending');

  if (pendingMutations.length === 0) {
    return;
  }

  console.log(`Syncing ${pendingMutations.length} pending mutations...`);

  const firebaseApp = (await import('../firebase/client')).app;
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const functions = getFunctions(firebaseApp);
  const uploadOfflineChanges = httpsCallable(functions, 'uploadOfflineChanges');
  
  // Mark mutations as 'processing' to prevent re-sending
  await Promise.all(
    pendingMutations.map(mutation => 
      tx.store.put({ ...mutation, status: 'processing' })
    )
  );


  const changesToUpload = pendingMutations.map(mutation => ({
      collectionPath: mutation.collection,
      documentId: mutation.docId,
      operation: mutation.type,
      payload: mutation.data,
      timestamp: mutation.createdAt.getTime(),
  }));

  try {
    await uploadOfflineChanges({ changes: changesToUpload });

    // If successful, mark as 'completed'
    await Promise.all(
      pendingMutations.map(mutation =>
        tx.store.put({ ...mutation, status: 'completed' })
      )
    );
    console.log(`${changesToUpload.length} mutations successfully uploaded and marked as completed.`);

  } catch (error) {
    console.error('Failed to sync offline changes:', error);
    // If failed, mark as 'failed' to be retried later
    await Promise.all(
      pendingMutations.map(mutation =>
        tx.store.put({ ...mutation, status: 'failed' })
      )
    );
  }

  await tx.done;
}

// Listen for online/offline events to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineMutations);
}

// Initialize the DB on load
initOfflineSyncDB();
