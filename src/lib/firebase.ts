// src/lib/firebase.ts
import { doc, getDoc, collection, query, where, getDocs, limit, startAfter } from "firebase/firestore";
import { db } from './firebase/client'; // Import the initialized db instance
import { getAllMarketplaceItemsFromDB } from './db-utils'; // Use centralized fetching

// Replaces the old getProductsByCategory to query the unified marketplaceItems collection
export async function getMarketplaceItemsByCategory(category?: string, lastVisible?: any) {
  const ITEMS_PER_PAGE = 12; 
  try {
    const allItems = await getAllMarketplaceItemsFromDB(); // Fetch all items once
    
    let filteredItems = allItems;
    if (category) {
      filteredItems = allItems.filter(item => item.category === category);
    }

    // Manual pagination
    const startIndex = lastVisible ? filteredItems.findIndex(item => item.id === lastVisible) + 1 : 0;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const newLastVisible = paginatedItems.length === ITEMS_PER_PAGE ? paginatedItems[paginatedItems.length - 1].id : null;
    
    return { items: paginatedItems, lastVisible: newLastVisible };

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
