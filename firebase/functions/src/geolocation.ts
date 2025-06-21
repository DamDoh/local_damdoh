import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Hypothetical geohashing library - replace with a real library like 'geofire-common'
// This is a simplified representation to illustrate the concept.
interface GeoHashRange {
  start: string;
  end: string;
}

function getGeohashQueryBounds(
  latitude: number,
  longitude: number,
  radiusInKm: number
): GeoHashRange[] {
  // In a real implementation, use a library like geofire-common
  // Example using geofire-common (conceptual):
  // const center = [latitude, longitude];
  // const bounds = geofire.geohashQueryBounds(center, radiusInMeters);
  // return bounds.map(b => ({ start: b[0], end: b[1] }));

  // This is a simplified placeholder
  functions.logger.warn('Using hypothetical geohashing. Replace with a real library.');
  // Calculate a basic geohash for the center
  const centerGeohash = calculateBasicGeohash(latitude, longitude);
  // Determine a range based on radius (highly simplified)
  // A real library handles complex edge cases and multiple ranges
  const rangeLength = Math.ceil(radiusInKm / 100); // Very rough estimate
  const startGeohash = decrementGeohash(centerGeohash, rangeLength);
  const endGeohash = incrementGeohash(centerGeohash, rangeLength);

  return [{ start: startGeohash, end: endGeohash }];
}

// Placeholder for basic geohash calculation (replace with library)
function calculateBasicGeohash(latitude: number, longitude: number, precision = 9): string {
    // This is a highly simplified and likely inaccurate placeholder
    // Real geohashing involves interleaving bits of lat/lon
    const latBits = Math.floor(((latitude + 90) / 180) * (1 << (precision * 2 / 2)));
    const lonBits = Math.floor(((longitude + 180) / 360) * (1 << (precision * 2 / 2)));
     // Interleave lat and lon bits (simplified)
    let geohash = '';
    for (let i = 0; i < precision; i++) {
        geohash += ((lonBits >> (precision - 1 - i)) & 1);
        geohash += ((latBits >> (precision - 1 - i)) & 1);
    }
    // Convert binary to base32 (simplified)
    return binaryToBase32(geohash);
}

// Placeholder for basic binary to base32 conversion (replace with library)
function binaryToBase32(binary: string): string {
    const base32Chars = '0123456789bcdefghjkmnpqrstuvwxyz'; // Base32 characters
    let base32 = '';
    for (let i = 0; i < binary.length; i += 5) {
        const fiveBits = binary.substr(i, 5);
        const decimalValue = parseInt(fiveBits, 2);
        base32 += base32Chars[decimalValue];
    }
    return base32;
}


// Placeholder for basic geohash increment/decrement (replace with library)
function incrementGeohash(geohash: string, steps: number): string {
  // This is a highly simplified placeholder
  // Real geohash neighbors are complex
  functions.logger.warn('Using hypothetical geohash increment. Replace with a real library.');
  return geohash.slice(0, -steps) + String.fromCharCode(geohash.charCodeAt(geohash.length - steps) + 1); // Very basic manipulation
}

function decrementGeohash(geohash: string, steps: number): string {
    // This is a highly simplified placeholder
    functions.logger.warn('Using hypothetical geohash decrement. Replace with a real library.');
     return geohash.slice(0, -steps) + String.fromCharCode(geohash.charCodeAt(geohash.length - steps) - 1); // Very basic manipulation
}


// Calculate distance between two GeoPoints in kilometers (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}


/**
 * Searches for marketplace listings within a specified geographical radius.
 * Requires authentication.
 */
export const searchNearbyListings = functions.https.onCall(async (data, context) => {
  // 1. Ensure the request is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { latitude, longitude, radiusInKm } = data;

  // 2. Validate the input.
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    typeof radiusInKm !== 'number' ||
    radiusInKm <= 0
  ) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with valid latitude, longitude, and a positive radiusInKm.'
    );
  }

  // 3. Use a hypothetical geohashing library to calculate query bounds.
  // In a real implementation, replace this with a library like 'geofire-common'.
  const geohashQueryBounds = getGeohashQueryBounds(latitude, longitude, radiusInKm);

  const matchingListings: admin.firestore.DocumentData[] = [];

  // Iterate through the calculated geohash query bounds
  for (const bounds of geohashQueryBounds) {
    let query: admin.firestore.Query = db.collection('listings');

    // Assuming listings have a 'geohash' field derived from their location
    query = query.orderBy('geohash').startAt(bounds.start).endAt(bounds.end);

    // Execute the query
    try {
      const snapshot = await query.get();

      snapshot.docs.forEach(doc => {
        const listingData = doc.data();
        // 5. Calculate the actual distance.
        if (listingData.location && listingData.location.latitude && listingData.location.longitude) {
          const distance = calculateDistance(
            latitude,
            longitude,
            listingData.location.latitude,
            listingData.location.longitude
          );

          // 6. Filter results within the specified radius.
          if (distance <= radiusInKm) {
            matchingListings.push({ id: doc.id, distance, ...listingData });
          }
        } else {
            functions.logger.warn(`Listing ${doc.id} is missing location data.`);
        }
      });
    } catch (error: any) {
        functions.logger.error('Error querying Firestore:', error);
        throw new functions.https.HttpsError('internal', 'Error querying listings.', error);
    }
  }

  // 7. Sort the filtered results by distance.
  matchingListings.sort((a, b) => a.distance - b.distance);

  // 8. Return an array of matching listing data.
  return matchingListings;
});