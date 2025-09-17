import { Request, Response } from 'express';
import { RegulatoryReport, ReportType, ReportStatus } from '../models/regulatory.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class RegulatoryController {
  private async checkAdminAuth(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'ADMIN') {
      throw new Error('Access denied. Only administrators can generate regulatory reports.');
    }

    return userId;
  }

  async generateRegulatoryReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const callerId = (req.user as any).userId || (req.user as any).id;
      const { reportType, userId, reportPeriod } = req.body;

      // Check admin role
      try {
        await this.checkAdminAuth(callerId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      // Validate input
      if (!reportType || typeof reportType !== 'string') {
        return res.status(400).json({ error: 'Report type is required and must be a string' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'Target user ID is required' });
      }

      if (!reportPeriod ||
          typeof reportPeriod.startDate !== 'number' ||
          typeof reportPeriod.endDate !== 'number' ||
          reportPeriod.startDate >= reportPeriod.endDate) {
        return res.status(400).json({
          error: 'Valid report period with start and end timestamps is required'
        });
      }

      // Check if target user exists
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      const startDate = new Date(reportPeriod.startDate);
      const endDate = new Date(reportPeriod.endDate);
      const reportId = uuidv4();

      logger.info(`Generating regulatory report type '${reportType}' for ${userId} for period ${startDate} to ${endDate}...`);

      try {
        let fetchedData: any[] = [];
        let processedContent: any = {};

        // Fetch data based on report type
        if (reportType === 'VTI_EVENTS_SUMMARY') {
          // This would need to be implemented based on your traceability events model
          // For now, we'll create a placeholder
          fetchedData = [
            {
              eventType: 'SAMPLE_EVENT',
              timestamp: new Date(),
              description: 'Sample traceability event'
            }
          ];

          processedContent = {
            summary: `Regulatory report for user ${targetUser.name} (${userId})`,
            keyFindings: [
              'Sample finding 1',
              'Sample finding 2'
            ],
            rawDataCount: fetchedData.length,
          };
        } else {
          return res.status(400).json({
            error: `Report type '${reportType}' is not supported`
          });
        }

        logger.info(`Fetched ${fetchedData.length} records for report`);

        // Create regulatory report
        const regulatoryReport = new RegulatoryReport({
          reportId,
          reportType: reportType as ReportType,
          generatedFor: userId,
          generatedBy: callerId,
          reportPeriod: {
            startDate,
            endDate,
          },
          status: ReportStatus.COMPLETED,
          reportContent: {
            summary: processedContent.summary,
            keyFindings: processedContent.keyFindings,
            rawDataCount: fetchedData.length,
            processedData: processedContent,
          },
        });

        await regulatoryReport.save();

        logger.info(`Regulatory report stored with ID: ${reportId}`);

        res.json({
          reportId,
          status: 'completed',
          message: 'Regulatory report generated successfully'
        });
      } catch (error) {
        logger.error(`Error generating regulatory report for ${userId}:`, error);

        // Update report status to failed if it was created
        await RegulatoryReport.findOneAndUpdate(
          { reportId },
          { status: ReportStatus.FAILED },
          { new: true }
        );

        res.status(500).json({
          error: 'Unable to generate regulatory report',
          details: (error as Error).message
        });
      }
    } catch (error) {
      logger.error('Error in generateRegulatoryReport:', error);
      res.status(500).json({ error: 'Failed to generate regulatory report' });
    }
  }

  async getGeneratedReports(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { reportType, userId: targetUserId, status, page = 1, limit = 20 } = req.query;

      // Check admin role for accessing reports
      try {
        await this.checkAdminAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      const query: any = {};

      if (reportType) {
        query.reportType = reportType;
      }

      if (targetUserId) {
        query.generatedFor = targetUserId;
      }

      if (status) {
        query.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const reports = await RegulatoryReport.find(query)
        .populate('generatedFor', 'name email')
        .populate('generatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await RegulatoryReport.countDocuments(query);

      const formattedReports = reports.map(report => ({
        id: report._id,
        reportId: report.reportId,
        reportType: report.reportType,
        generatedFor: {
          id: report.generatedFor,
          name: (report as any).generatedFor?.name,
          email: (report as any).generatedFor?.email,
        },
        generatedBy: {
          id: report.generatedBy,
          name: (report as any).generatedBy?.name,
          email: (report as any).generatedBy?.email,
        },
        reportPeriod: report.reportPeriod,
        status: report.status,
        reportContent: report.reportContent,
        fileUrl: report.fileUrl,
        expiresAt: report.expiresAt?.toISOString(),
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      }));

      res.json({
        reports: formattedReports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching generated reports:', error);
      res.status(500).json({ error: 'Failed to fetch generated reports' });
    }
  }

  async getReportById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { reportId } = req.params;

      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }

      // Check admin role
      try {
        await this.checkAdminAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      const report = await RegulatoryReport.findOne({ reportId })
        .populate('generatedFor', 'name email')
        .populate('generatedBy', 'name email');

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const formattedReport = {
        id: report._id,
        reportId: report.reportId,
        reportType: report.reportType,
        generatedFor: {
          id: report.generatedFor,
          name: (report as any).generatedFor?.name,
          email: (report as any).generatedFor?.email,
        },
        generatedBy: {
          id: report.generatedBy,
          name: (report as any).generatedBy?.name,
          email: (report as any).generatedBy?.email,
        },
        reportPeriod: report.reportPeriod,
        status: report.status,
        reportContent: report.reportContent,
        fileUrl: report.fileUrl,
        expiresAt: report.expiresAt?.toISOString(),
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      };

      res.json(formattedReport);
    } catch (error) {
      logger.error('Error fetching report by ID:', error);
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  }

  async deleteReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { reportId } = req.params;

      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }

      // Check admin role
      try {
        await this.checkAdminAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      const deletedReport = await RegulatoryReport.findOneAndDelete({ reportId });

      if (!deletedReport) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting report:', error);
      res.status(500).json({ error: 'Failed to delete report' });
    }
  }

  async getReportStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      // Check admin role
      try {
        await this.checkAdminAuth(userId);
      } catch (error) {
        return res.status(403).json({ error: (error as Error).message });
      }

      const stats = await RegulatoryReport.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0]
              }
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0]
              }
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0]
              }
            },
            byType: {
              $push: '$reportType'
            }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        byType: []
      };

      // Count reports by type
      const typeCounts: Record<string, number> = {};
      result.byType.forEach((type: string) => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      res.json({
        stats: {
          totalReports: result.total,
          completedReports: result.completed,
          pendingReports: result.pending,
          failedReports: result.failed,
          reportsByType: typeCounts,
        }
      });
    } catch (error) {
      logger.error('Error fetching report stats:', error);
      res.status(500).json({ error: 'Failed to fetch report statistics' });
    }
  }
}