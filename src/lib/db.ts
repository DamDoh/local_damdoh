
"use client";

import Dexie, { type EntityTable } from 'dexie';

// Define the structure of an action in the outbox
export interface OfflineAction {
  id?: number; // Primary key, auto-incremented
  operation: 'create' | 'update' | 'delete' | 'logHarvestAndCreateVTI';
  collectionPath: string;
  documentId: string;
  payload: any;
  timestamp: number;
}

// Define the Dexie database
// This class describes the database structure and tables.
class DamDohOfflineDB extends Dexie {
  outbox!: EntityTable<OfflineAction, 'id'>;

  constructor() {
    super('DamDohOfflineDB');
    this.version(1).stores({
      outbox: '++id, timestamp', // Primary key 'id' and index on 'timestamp'
    });
  }
}

// Create a singleton instance of the database
export const db = new DamDohOfflineDB();
