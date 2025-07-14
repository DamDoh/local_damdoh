
'use server';

import * as functions from "firebase-functions";
import { geohashForLocation } from "geofire-common";

/**
 * =================================================================
 * Geospatial Cloud Functions
 * =================================================================
 * This file contains functions related to location-based services and data processing.
 */

const COLLECTIONS_WITH_LOCATION = ['users', 'marketplaceItems', 'agri_events'];

/**
 * A generic Firestore trigger that automatically calculates and sets a geohash
 * on any document created or updated in specified collections that contain a location object.
 */
export const onDocumentWriteSetGeohash = functions.firestore
  .document('{collectionId}/{documentId}')
  .onWrite(async (change, context) => {
    const { collectionId } = context.params;

    // Only run for designated collections
    if (!COLLECTIONS_WITH_LOCATION.includes(collectionId)) {
      return null;
    }
    
    const afterData = change.after.data();

    // If document is deleted or has no location data, do nothing.
    if (!afterData || !afterData.location) {
        return null;
    }
    
    const location = afterData.location;
    
    // If location exists but has no lat/lng, do nothing.
    if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return null;
    }
    
    const geohash = geohashForLocation([location.lat, location.lng]);

    // Only write if the geohash is new or has changed to prevent infinite loops.
    const beforeData = change.before.data();
    if (beforeData && beforeData.geohash === geohash) {
        return null;
    }

    console.log(`Setting geohash '${geohash}' for document ${collectionId}/${context.params.documentId}`);
    
    // Update the document with the new geohash.
    return change.after.ref.update({ geohash: geohash });
  });

