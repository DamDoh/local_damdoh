// src/lib/vti.ts

/**
 * Defines the structure for a Vibrant Traceability ID (VTI) event.
 * Each VTI represents a batch of agricultural product and tracks its journey
 * through the supply chain via a series of linked events.
 */
export interface VtiEvent {
  id: string; // Unique ID for the VTI event
  vtiBatchId: string; // The ID of the VTI batch this event belongs to
  timestamp: string; // ISO 8601 timestamp of the event
  stakeholderId: string; // ID of the stakeholder contributing this event (linked to their pillar)
  stakeholderType: string; // Type of stakeholder (e.g., 'Farmer', 'Logistics', 'ProcessingUnit')
  eventType: string; // Type of event (e.g., 'Planting', 'Harvest', 'Transportation', 'Processing', 'QualityCheck')
  location?: { // Geo-location of the event, if applicable
    latitude: number;
    longitude: number;
  };
  data: PlantingEventData | HarvestEventData | any; // Use a union type for specific event data
  // Links to previous and next events in the chain would be managed by the VTI system
}

/**
 * Defines the structure for a VTI batch.
 * This represents a specific quantity of a product with a unique VTI.
 */
export interface VtiBatch {
  id: string; // The unique VTI batch ID
  productId: string; // ID of the product (e.g., 'maize', 'coffee beans')
  initialQuantity: number; // The initial quantity of the batch at origin
  unit: string; // Unit of measurement (e.g., 'tons', 'bags')
  origin: { // Information about the origin of the batch
    farmId: string;
    location: {
      latitude: number;
      longitude: number;
    };
    plantingDate?: string; // ISO 8601 timestamp
    // Other initial farming practices can be added here or as a VtiEvent
  };
  currentLocation?: { // The current known location of the batch
    latitude: number;
    longitude: number;
  };
  status: string; // Current status of the batch (e.g., 'In Storage', 'In Transit', 'Processed', 'Sold')
  carbonFootprint?: number; // Estimated carbon footprint (can be updated by events)
  // Array of VtiEvent IDs would link events to this batch
}

/**
 * Data structure for a Planting event.
 */
export interface PlantingEventData {
  cropType: string;
  seedType?: string;
  plantingMethod?: string;
  areaPlanted: number; // in suitable units (e.g., hectares, acres)
  // Link to specific inputs used (seeds, fertilizers) could be added here
}

/**
 * Data structure for a Harvest event.
 */
export interface HarvestEventData {
  yield: number; // Quantity harvested
  unit: string; // Unit of measurement (should match batch unit)
  harvestMethod?: string;
  qualityObservations?: string;
  // Link to specific post-harvest treatments could be added here
}