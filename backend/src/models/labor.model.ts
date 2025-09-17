import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWorker extends Document {
  farmer: Types.ObjectId;
  name: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  payRate?: number;
  payRateUnit?: string; // e.g., 'hour', 'day', 'month'
  totalHoursLogged: number;
  totalPaid: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkLog extends Document {
  worker: Types.ObjectId;
  farmer: Types.ObjectId;
  hours: number;
  date: Date;
  taskDescription: string;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  worker: Types.ObjectId;
  farmer: Types.ObjectId;
  amount: number;
  currency: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workerSchema = new Schema<IWorker>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactInfo: {
      phone: String,
      email: String,
      address: String,
    },
    payRate: {
      type: Number,
      min: 0,
    },
    payRateUnit: {
      type: String,
      enum: ['hour', 'day', 'week', 'month'],
    },
    totalHoursLogged: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
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

const workLogSchema = new Schema<IWorkLog>(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    taskDescription: {
      type: String,
      default: 'General farm work',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const paymentSchema = new Schema<IPayment>(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: 'Payment for services rendered',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
workerSchema.index({ farmer: 1, name: 1 });
workerSchema.index({ farmer: 1, isActive: 1 });

workLogSchema.index({ worker: 1, date: -1 });
workLogSchema.index({ farmer: 1, date: -1 });

paymentSchema.index({ worker: 1, date: -1 });
paymentSchema.index({ farmer: 1, date: -1 });

// Middleware to update worker totals
workLogSchema.post('save', async function(doc) {
  try {
    const Worker = mongoose.model('Worker');
    await Worker.findByIdAndUpdate(doc.worker, {
      $inc: { totalHoursLogged: doc.hours },
    });
  } catch (error) {
    console.error('Error updating worker hours after work log save:', error);
  }
});

paymentSchema.post('save', async function(doc) {
  try {
    const Worker = mongoose.model('Worker');
    await Worker.findByIdAndUpdate(doc.worker, {
      $inc: { totalPaid: doc.amount },
    });
  } catch (error) {
    console.error('Error updating worker payment total after payment save:', error);
  }
});

export const Worker = mongoose.model<IWorker>('Worker', workerSchema);
export const WorkLog = mongoose.model<IWorkLog>('WorkLog', workLogSchema);
export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);