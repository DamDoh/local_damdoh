import { Request, Response } from 'express';
import { OfflineChangeLog, OfflineChangeStatus, OfflineChangeOperation, getModelByCollectionName } from '../models/offline-sync.model';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class OfflineSyncController {
  async uploadOfflineChanges(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { changes } = req.body;

      if (!Array.isArray(changes) || changes.length === 0) {
        return res.status(400).json({ error: 'An array of changes is required' });
      }

      // Validate each change object
      for (const change of changes) {
        if (!change.collectionPath || !change.documentId || !change.operation || !change.timestamp) {
          return res.status(400).json({
            error: 'Each change record must include collectionPath, documentId, operation, and timestamp'
          });
        }

        if (!['create', 'update', 'delete'].includes(change.operation)) {
          return res.status(400).json({
            error: 'Operation must be one of: create, update, delete'
          });
        }
      }

      try {
        const uploadedChangeIds: string[] = [];

        logger.info(`User ${userId} uploading ${changes.length} offline changes`);

        // Create offline change log entries
        const changeLogEntries = changes.map((change: any) => ({
          changeId: uuidv4(),
          user: userId,
          timestamp: new Date(change.timestamp),
          collectionPath: change.collectionPath,
          documentId: change.documentId,
          operation: change.operation,
          payload: change.payload || null,
          status: OfflineChangeStatus.PENDING,
          clientDeviceId: change.clientDeviceId || null,
          processingAttempts: 0,
        }));

        const insertedChanges = await OfflineChangeLog.insertMany(changeLogEntries);
        uploadedChangeIds.push(...insertedChanges.map(change => change.changeId));

        logger.info(`Successfully stored ${changes.length} offline changes in log for user ${userId}`);

        // Trigger processing of the changes (in a real implementation, this might be done asynchronously)
        // For now, we'll process them synchronously
        const processingPromises = insertedChanges.map(change => this.processOfflineChange(change._id));

        // Don't wait for processing to complete, just return success
        Promise.allSettled(processingPromises).catch(error => {
          logger.error('Error processing offline changes:', error);
        });

        res.json({
          status: 'success',
          uploadedCount: changes.length,
          uploadedChangeIds,
          message: 'Offline changes uploaded successfully and queued for processing'
        });
      } catch (error) {
        logger.error(`Error uploading offline changes for user ${userId}:`, error);
        res.status(500).json({ error: 'Unable to upload offline changes' });
      }
    } catch (error) {
      logger.error('Error in uploadOfflineChanges:', error);
      res.status(500).json({ error: 'Failed to upload offline changes' });
    }
  }

  private async processOfflineChange(changeLogId: string) {
    try {
      const changeLog = await OfflineChangeLog.findById(changeLogId);

      if (!changeLog || changeLog.status !== OfflineChangeStatus.PENDING) {
        logger.info(`Offline change log ${changeLogId} is not pending or does not exist. Skipping processing.`);
        return;
      }

      logger.info(`Processing offline change log: ${changeLog.changeId} for user ${changeLog.user}. Operation: ${changeLog.operation} on ${changeLog.collectionPath}/${changeLog.documentId}`);

      // Mark as processing
      await OfflineChangeLog.findByIdAndUpdate(changeLogId, {
        status: OfflineChangeStatus.PROCESSING,
        $inc: { processingAttempts: 1 },
        lastAttemptTimestamp: new Date(),
      });

      const { collectionPath, documentId, operation, payload, timestamp } = changeLog;

      // Get the appropriate model for the collection
      const Model = getModelByCollectionName(collectionPath);

      if (!Model) {
        throw new Error(`Unknown collection: ${collectionPath}`);
      }

      try {
        if (operation === OfflineChangeOperation.CREATE) {
          const existingDoc = await Model.findById(documentId);
          if (existingDoc) {
            throw new Error('Conflict: Document already exists');
          }

          const newDoc = new Model({
            _id: documentId,
            ...payload,
            createdAt: timestamp,
            updatedAt: timestamp,
          });

          await newDoc.save();

        } else if (operation === OfflineChangeOperation.UPDATE) {
          const existingDoc = await Model.findById(documentId);
          if (!existingDoc) {
            throw new Error('Conflict: Document not found for update');
          }

          // Conflict Resolution: Last Write Wins based on client timestamp
          const onlineUpdatedAt = existingDoc.updatedAt || new Date(0);
          if (timestamp < onlineUpdatedAt) {
            throw new Error('Conflict: Online version is newer');
          }

          await Model.findByIdAndUpdate(documentId, {
            ...payload,
            updatedAt: timestamp,
          });

        } else if (operation === OfflineChangeOperation.DELETE) {
          // If the document doesn't exist, it's considered a success (idempotent)
          await Model.findByIdAndDelete(documentId);
        } else {
          throw new Error(`Unknown operation type: ${operation}`);
        }

        // Mark as completed
        await OfflineChangeLog.findByIdAndUpdate(changeLogId, {
          status: OfflineChangeStatus.COMPLETED,
          processedAt: new Date(),
        });

        logger.info(`Successfully processed offline change ${changeLog.changeId}`);

      } catch (error: any) {
        logger.error(`Transaction failed for offline change log ${changeLog.changeId}:`, error.message);

        const isConflict = error.message.startsWith('Conflict:');

        await OfflineChangeLog.findByIdAndUpdate(changeLogId, {
          status: isConflict ? OfflineChangeStatus.CONFLICT : OfflineChangeStatus.FAILED,
          errorMessage: error.message,
          processedAt: new Date(),
        });
      }
    } catch (error) {
      logger.error(`Error processing offline change ${changeLogId}:`, error);
    }
  }

  async getOfflineChangesStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { status, limit = 50, page = 1 } = req.query;

      const query: any = { user: userId };

      if (status) {
        query.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const changes = await OfflineChangeLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email');

      const total = await OfflineChangeLog.countDocuments(query);

      res.json({
        changes: changes.map(change => ({
          id: change._id,
          changeId: change.changeId,
          timestamp: change.timestamp,
          collectionPath: change.collectionPath,
          documentId: change.documentId,
          operation: change.operation,
          status: change.status,
          processingAttempts: change.processingAttempts,
          errorMessage: change.errorMessage,
          conflictDetails: change.conflictDetails,
          createdAt: change.createdAt,
          processedAt: change.processedAt,
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching offline changes status:', error);
      res.status(500).json({ error: 'Failed to fetch offline changes status' });
    }
  }

  async retryFailedChanges(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { changeIds } = req.body;

      if (!Array.isArray(changeIds)) {
        return res.status(400).json({ error: 'changeIds must be an array' });
      }

      // Reset failed changes to pending status
      const result = await OfflineChangeLog.updateMany(
        {
          user: userId,
          changeId: { $in: changeIds },
          status: { $in: [OfflineChangeStatus.FAILED, OfflineChangeStatus.CONFLICT] }
        },
        {
          status: OfflineChangeStatus.PENDING,
          errorMessage: null,
          conflictDetails: null,
        }
      );

      // Trigger reprocessing
      const changesToRetry = await OfflineChangeLog.find({
        user: userId,
        changeId: { $in: changeIds },
        status: OfflineChangeStatus.PENDING
      });

      const processingPromises = changesToRetry.map(change => this.processOfflineChange(change._id));
      Promise.allSettled(processingPromises).catch(error => {
        logger.error('Error reprocessing offline changes:', error);
      });

      res.json({
        success: true,
        message: `${result.modifiedCount} changes queued for retry`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      logger.error('Error retrying failed changes:', error);
      res.status(500).json({ error: 'Failed to retry failed changes' });
    }
  }

  async getSyncStatistics(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      const stats = await OfflineChangeLog.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$status', OfflineChangeStatus.PENDING] }, 1, 0]
              }
            },
            processing: {
              $sum: {
                $cond: [{ $eq: ['$status', OfflineChangeStatus.PROCESSING] }, 1, 0]
              }
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', OfflineChangeStatus.COMPLETED] }, 1, 0]
              }
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ['$status', OfflineChangeStatus.FAILED] }, 1, 0]
              }
            },
            conflicts: {
              $sum: {
                $cond: [{ $eq: ['$status', OfflineChangeStatus.CONFLICT] }, 1, 0]
              }
            },
            byOperation: {
              $push: '$operation'
            },
            byCollection: {
              $push: '$collectionPath'
            }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        conflicts: 0,
        byOperation: [],
        byCollection: []
      };

      // Count by operation type
      const operationCounts: Record<string, number> = {};
      result.byOperation.forEach((op: string) => {
        operationCounts[op] = (operationCounts[op] || 0) + 1;
      });

      // Count by collection
      const collectionCounts: Record<string, number> = {};
      result.byCollection.forEach((col: string) => {
        collectionCounts[col] = (collectionCounts[col] || 0) + 1;
      });

      res.json({
        stats: {
          totalChanges: result.total,
          pendingChanges: result.pending,
          processingChanges: result.processing,
          completedChanges: result.completed,
          failedChanges: result.failed,
          conflictChanges: result.conflicts,
          changesByOperation: operationCounts,
          changesByCollection: collectionCounts,
        }
      });
    } catch (error) {
      logger.error('Error fetching sync statistics:', error);
      res.status(500).json({ error: 'Failed to fetch sync statistics' });
    }
  }
}