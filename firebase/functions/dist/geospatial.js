"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSearchIndexWriteUpdateGeohash = void 0;
const functions = __importStar(require("firebase-functions"));
const geofire_common_1 = require("geofire-common");
/**
 * A generic Firestore trigger that listens to writes on the search_index collection.
 * If a document has a location with lat/lng, it calculates and adds a geohash.
 */
exports.onSearchIndexWriteUpdateGeohash = functions.firestore
    .document("search_index/{documentId}")
    .onWrite(async (change, context) => {
    var _a, _b;
    const afterData = change.after.exists ? change.after.data() : null;
    if (!afterData) {
        // Document was deleted, no action needed.
        return null;
    }
    const beforeData = change.before.exists ? change.before.data() : {};
    const location = afterData.location;
    // Check if location data is present and valid, and if it has changed.
    if (location &&
        typeof location.lat === 'number' &&
        typeof location.lng === 'number' &&
        (location.lat !== ((_a = beforeData === null || beforeData === void 0 ? void 0 : beforeData.location) === null || _a === void 0 ? void 0 : _a.lat) || location.lng !== ((_b = beforeData === null || beforeData === void 0 ? void 0 : beforeData.location) === null || _b === void 0 ? void 0 : _b.lng))) {
        const hash = (0, geofire_common_1.geohashForLocation)([location.lat, location.lng]);
        // Update the document with the new geohash
        return change.after.ref.update({ geohash: hash });
    }
    return null;
});
//# sourceMappingURL=geospatial.js.map