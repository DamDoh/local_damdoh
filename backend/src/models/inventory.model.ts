import mongoose, { Document, Schema, Types } from 'mongoose';

export enum InventoryItemType {
  SEED = 'SEED',
  FERTILIZER = 'FERTILIZER',
  PESTICIDE = 'PESTICIDE',
  EQUIPMENT = 'EQUIPMENT',
  FEED = 'FEED',
  SUPPLY = 'SUPPLY',
  HARVEST = 'HARVEST',
  OTHER = 'OTHER',
}

export enum InventoryTransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  USAGE = 'USAGE',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN',
}

export enum UnitOfMeasure {
  KG = 'KG',
  LITERS = 'LITERS',
  PIECES = 'PIECES',
  BAGS = 'BAGS',
  BOXES = 'BOXES',
  TONS = 'TONS',
  ACRES = 'ACRES',
  HOURS = 'HOURS',
}

export interface IInventoryItem extends Document {
  farm: Types.ObjectId;
  name: string;
  type: InventoryItemType;
  description?: string;
  sku?: string;
  category?: string;
  unitOfMeasure: UnitOfMeasure;
  currentStock: number;
  minimumStock?: number;
  maximumStock?: number;
  unitCost?: number;
  unitPrice?: number;
  supplier?: string;
  location?: string;
  expiryDate?: Date;
  batchNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryTransaction extends Document {
  item: Types.ObjectId;
  farm: Types.ObjectId;
  type: InventoryTransactionType;
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
  totalValue: number;
  reference?: string; // Order ID, sale ID, etc.
  notes?: string;
  performedBy: Types.ObjectId;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryCategory extends Document {
  farm: Types.ObjectId;
  name: string;
  description?: string;
  type: InventoryItemType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    farm: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(InventoryItemType),
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      sparse: true,
    },
    category: {
      type: String,
      trim: true,
    },
    unitOfMeasure: {
      type: String,
      enum: Object.values(UnitOfMeasure),
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimumStock: {
      type: Number,
      min: 0,
    },
    maximumStock: {
      type: Number,
      min: 0,
    },
    unitCost: {
      type: Number,
      min: 0,
    },
    unitPrice: {
      type: Number,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    expiryDate: Date,
    batchNumber: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    farm: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(InventoryTransactionType),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitCost: {
      type: Number,
      min: 0,
    },
    unitPrice: {
      type: Number,
      min: 0,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const inventoryCategorySchema = new Schema<IInventoryCategory>(
  {
    farm: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(InventoryItemType),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
inventoryItemSchema.index({ farm: 1, name: 1 });
inventoryItemSchema.index({ farm: 1, type: 1 });
inventoryItemSchema.index({ farm: 1, sku: 1 }, { sparse: true });
inventoryItemSchema.index({ farm: 1, category: 1 });
inventoryItemSchema.index({ farm: 1, isActive: 1 });
inventoryItemSchema.index({ expiryDate: 1 });

inventoryTransactionSchema.index({ item: 1, transactionDate: -1 });
inventoryTransactionSchema.index({ farm: 1, transactionDate: -1 });
inventoryTransactionSchema.index({ farm: 1, type: 1 });
inventoryTransactionSchema.index({ performedBy: 1 });

inventoryCategorySchema.index({ farm: 1, name: 1 }, { unique: true });
inventoryCategorySchema.index({ farm: 1, type: 1 });

// Middleware to update stock levels
inventoryTransactionSchema.post('save', async function(doc) {
  try {
    const InventoryItem = mongoose.model('InventoryItem');
    let stockAdjustment = 0;

    switch (doc.type) {
      case InventoryTransactionType.PURCHASE:
      case InventoryTransactionType.RETURN:
        stockAdjustment = doc.quantity;
        break;
      case InventoryTransactionType.SALE:
      case InventoryTransactionType.USAGE:
        stockAdjustment = -doc.quantity;
        break;
      case InventoryTransactionType.ADJUSTMENT:
        stockAdjustment = doc.quantity; // Quantity can be positive or negative
        break;
      case InventoryTransactionType.TRANSFER:
        // For transfers, we might need to handle both source and destination
        // For simplicity, assuming this is handled elsewhere
        break;
    }

    if (stockAdjustment !== 0) {
      await InventoryItem.findByIdAndUpdate(doc.item, {
        $inc: { currentStock: stockAdjustment },
      });
    }
  } catch (error) {
    console.error('Error updating inventory stock after transaction:', error);
  }
});

// Virtual for low stock alerts
inventoryItemSchema.virtual('isLowStock').get(function(this: IInventoryItem) {
  return this.minimumStock && this.currentStock <= this.minimumStock;
});

// Virtual for stock status
inventoryItemSchema.virtual('stockStatus').get(function(this: IInventoryItem) {
  if (!this.minimumStock) return 'normal';
  if (this.currentStock <= this.minimumStock) return 'low';
  if (this.maximumStock && this.currentStock >= this.maximumStock) return 'high';
  return 'normal';
});

// Ensure virtual fields are serialized
inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
export const InventoryTransaction = mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);
export const InventoryCategory = mongoose.model<IInventoryCategory>('InventoryCategory', inventoryCategorySchema);