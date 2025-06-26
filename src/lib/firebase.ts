// src/lib/firebase.ts
import { doc, getDoc, collection, query, where, getDocs, limit, startAfter } from "firebase/firestore";
import { db } from './firebase/client'; // Import the initialized db instance

// Replaces the old getProductsByCategory to query the unified marketplaceItems collection
export async function getMarketplaceItemsByCategory(category?: string, lastVisible?: any) {
  const ITEMS_PER_PAGE = 12; // Define a page size for pagination
  try {
    const itemsCollectionRef = collection(db, 'marketplaceItems');
    let q;
    if (category) {
      q = query(itemsCollectionRef, where('category', '==', category), limit(ITEMS_PER_PAGE));
    } else {
      q = query(itemsCollectionRef, limit(ITEMS_PER_PAGE));
    }

    if (lastVisible) {
        const lastVisibleDoc = await getDoc(doc(itemsCollectionRef, lastVisible));
        if(lastVisibleDoc.exists()){
            q = query(q, startAfter(lastVisibleDoc));
        }
    }

    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]?.id || null;

    return { items, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching marketplace items by category:', error);
    throw error;
  }
}

// New function to get a single marketplace item by its ID
export async function getMarketplaceItemById(itemId: string) {
   try {
    const itemDocRef = doc(db, 'marketplaceItems', itemId);
    const itemDocSnap = await getDoc(itemDocRef);

    if (itemDocSnap.exists()) {
      return { id: itemDocSnap.id, ...itemDocSnap.data() };
    } else {
      console.log(`No such marketplace item document with ID: ${itemId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching marketplace item by ID: ${itemId}`, error);
    throw error;
  }
}
