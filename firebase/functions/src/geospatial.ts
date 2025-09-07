
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { geohashForLocation } from "geofire-common";

/**
 * A generic Firestore trigger that listens to writes on the search_index collection.
 * If a document has a location with lat/lng, it calculates and adds a geohash.
 */
export const onSearchIndexWriteUpdateGeohash = functions.firestore
  .document("search_index/{documentId}")
  .onWrite(async (change, context) => {
    const afterData = change.after.exists ? change.after.data() : null;

    if (!afterData) {
      // Document was deleted, no action needed.
      return null;
    }

    const beforeData = change.before.exists ? change.before.data() : {};

    const location = afterData.location;

    // Check if location data is present and valid, and if it has changed.
    if (
      location && 
      typeof location.lat === 'number' && 
      typeof location.lng === 'number' &&
      (location.lat !== beforeData?.location?.lat || location.lng !== beforeData?.location?.lng)
    ) {
      const hash = geohashForLocation([location.lat, location.lng]);
      
      // Update the document with the new geohash
      return change.after.ref.update({ geohash: hash });
    }

    return null;
  });
