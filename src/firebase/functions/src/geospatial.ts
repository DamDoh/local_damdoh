
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { geohashForLocation } from 'geofire-common';

/**
 * A Firestore trigger that listens to writes on specified collections
 * and automatically adds a 'geohash' if a location with lat/lng is present.
 * This enables efficient geospatial querying.
 *
 * @param {functions.Change<functions.firestore.DocumentSnapshot>} change The change event.
 * @param {functions.EventContext} context The event context.
 * @return {Promise<null>} A promise that resolves when the operation is complete.
 */
export const onDocumentWriteSetGeohash = functions.firestore
  .document("{collectionId}/{documentId}")
  .onWrite(async (change, context) => {
    const { collectionId } = context.params;
    const afterData = change.after.exists ? change.after.data() : null;

    // Define which collections should have geohashes generated for them.
    const GEOHASH_COLLECTIONS = ["users", "marketplaceItems"];

    if (!GEOHASH_COLLECTIONS.includes(collectionId) || !afterData) {
      return null;
    }

    const beforeData = change.before.exists ? change.before.data() : {};

    // Check if the location field exists and has changed to avoid unnecessary writes.
    const locationAfter = afterData.location;
    const locationBefore = beforeData?.location;

    // Deep compare location objects to see if an update is needed.
    if (JSON.stringify(locationAfter) === JSON.stringify(locationBefore)) {
      return null;
    }

    // If a valid latitude and longitude exist, calculate the geohash.
    if (locationAfter && typeof locationAfter.lat === 'number' && typeof locationAfter.lng === 'number') {
      const hash = geohashForLocation([locationAfter.lat, locationAfter.lng]);
      
      // Only write if the geohash is new or different from the existing one.
      if (afterData.geohash !== hash) {
        console.log(`Updating geohash for ${collectionId}/${context.params.documentId}`);
        return change.after.ref.update({ geohash: hash });
      }
    } else if (afterData.geohash) {
      // If location is removed, ensure the geohash is also removed.
      return change.after.ref.update({ geohash: null });
    }

    return null;
  });

    
