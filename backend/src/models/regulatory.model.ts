import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ReportType {
  VTI_EVENTS_SUMMARY = 'VTI_EVENTS_SUMMARY',
  FINANCIAL_TRANSACTIONS = 'FINANCIAL_TRANSACTIONS',
  USER_ACTIVITY = 'USER_ACTIVITY',
  MARKETPLACE_ACTIVITY = 'MARKETPLACE_ACTIVITY',
  COMPLIANCE_AUDIT = 'COMPLIANCE_AUDIT',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IRegulatoryReport extends Document {
  reportId: string;
  reportType: ReportType;
  generatedFor: Types.ObjectId; // User the report is generated for
  generatedBy: Types.ObjectId; // Admin who generated the report
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  status: ReportStatus;
  reportContent: {
    summary?: string;
    keyFindings?: string[];
    rawDataCount: number;
    processedData?: any;
    metadata?: Record<string, any>;
  };
  fileUrl?: string; // If report is stored as file
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const regulatoryReportSchema = new Schema<IRegulatoryReport>(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    reportType: {
      type: String,
      enum: Object.values(ReportType),
      required: true,
    },
    generatedFor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.PENDING,
    },
    reportContent: {
      summary: String,
      keyFindings: [String],
      rawDataCount: {
        type: Number,
        default: 0,
      },
      processedData: Schema.Types.Mixed,
      metadata: Schema.Types.Mixed,
    },
    fileUrl: String,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
regulatoryReportSchema.index({ reportId: 1 }, { unique: true });
regulatoryReportSchema.index({ generatedFor: 1 });
regulatoryReportSchema.index({ generatedBy: 1 });
regulatoryReportSchema.index({ reportType: 1 });
regulatoryReportSchema.index({ status: 1 });
regulatoryReportSchema.index({ 'reportPeriod.startDate': 1, 'reportPeriod.endDate': 1 });
regulatoryReportSchema.index({ createdAt: -1 });
regulatoryReportSchema.index({ expiresAt: 1 });

// Virtual for checking if report is expired
regulatoryReportSchema.virtual('isExpired').get(function(this: IRegulatoryReport) {
  return this.expiresAt && this.expiresAt < new Date();
});

// Middleware to update status when expired
regulatoryReportSchema.pre('save', function(next) {
  if (this.expiresAt && this.expiresAt < new Date() && this.status === ReportStatus.COMPLETED) {
    this.status = ReportStatus.FAILED; // Or create EXPIRED status
  }
  next();
});

// Ensure virtual fields are serialized
regulatoryReportSchema.set('toJSON', { virtuals: true });
regulatoryReportSchema.set('toObject', { virtuals: true });

export const RegulatoryReport = mongoose.model<IRegulatoryReport>('RegulatoryReport', regulatoryReportSchema);