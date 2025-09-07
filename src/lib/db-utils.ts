
// This file is deprecated. All data fetching logic should be moved
// into callable Cloud Functions in the `firebase/functions/src` directory,
// and called from the client using the Firebase Functions SDK or from Server Actions.
// This file is being removed to enforce this pattern and avoid confusion.

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase/client';

/**
 * @deprecated Use the `user-getProfileByIdFromDB` Cloud Function directly.
 */
export const getProfileByIdFromDB = async (uid: string) => {
    const getProfileCallable = httpsCallable(functions, 'user-getProfileByIdFromDB');
    const result = await getProfileCallable({ uid });
    return result.data as any;
};

/**
 * @deprecated Use the `marketplace-getAllMarketplaceItemsFromDB` Cloud Function directly.
 */
export const getAllMarketplaceItemsFromDB = async () => {
  // This is a placeholder as the function has been removed.
  console.warn("`getAllMarketplaceItemsFromDB` from `db-utils` is deprecated.");
  return [];
};

/**
 * @deprecated Use the `marketplace-getMarketplaceItemById` Cloud Function directly.
 */
export const getMarketplaceItemByIdFromDB = async (id: string) => {
  const getMarketplaceItemCallable = httpsCallable(functions, 'marketplace-getMarketplaceItemById');
  const result = await getMarketplaceItemCallable({ itemId: id });
  return result.data as any;
};

/**
 * @deprecated Use the `marketplace-updateMarketplaceItemInDB` Cloud Function directly.
 */
export const updateMarketplaceItemInDB = async (id: string, data: any) => {
  // This is a placeholder as the function has been removed.
  console.warn("`updateMarketplaceItemInDB` from `db-utils` is deprecated.");
  return null;
};

/**
 * @deprecated Use the `marketplace-deleteMarketplaceItemFromDB` Cloud Function directly.
 */
export const deleteMarketplaceItemFromDB = async (id: string) => {
  // This is a placeholder as the function has been removed.
  console.warn("`deleteMarketplaceItemFromDB` from `db-utils` is deprecated.");
  return false;
};
