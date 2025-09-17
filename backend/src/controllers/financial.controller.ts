import { Request, Response } from 'express';
import {
  FinancialTransaction,
  FinancialApplication,
  FinancialProduct,
  CreditScore,
  FundingRecommendation,
  TransactionType,
  ApplicationStatus,
  ProductType,
  IFinancialTransaction,
  IFinancialApplication,
  IFinancialProduct
} from '../models/financial.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class FinancialController {
  async logFinancialTransaction(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { type, amount, currency, description, category } = req.body;

      const validTypes = ['INCOME', 'EXPENSE'];
      if (!type || !validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      if (!currency) {
        return res.status(400).json({ error: 'Currency is required' });
      }

      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }

      const transaction = new FinancialTransaction({
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user: userId,
        type: type as TransactionType,
        amount,
        currency,
        description,
        category: category || 'Uncategorized',
      });

      await transaction.save();

      res.json({
        transactionId: transaction.transactionId,
        status: 'transaction_logged'
      });
    } catch (error) {
      logger.error('Error logging financial transaction:', error);
      res.status(500).json({ error: 'Failed to log transaction' });
    }
  }

  async getFinancialSummaryAndTransactions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;

      const transactions = await FinancialTransaction.find({ user: userId })
        .sort({ timestamp: -1 })
        .limit(50);

      let totalIncome = 0;
      let totalExpense = 0;

      const formattedTransactions = transactions.map(tx => {
        if (tx.type === TransactionType.INCOME) {
          totalIncome += tx.amount;
        } else if (tx.type === TransactionType.EXPENSE) {
          totalExpense += tx.amount;
        }

        return {
          id: tx._id,
          transactionId: tx.transactionId,
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          description: tx.description,
          category: tx.category,
          timestamp: tx.timestamp.toISOString(),
        };
      });

      const summary = {
        totalIncome,
        totalExpense,
        netFlow: totalIncome - totalExpense,
      };

      res.json({
        summary,
        transactions: formattedTransactions.slice(0, 10)
      });
    } catch (error) {
      logger.error('Error fetching financial summary:', error);
      res.status(500).json({ error: 'Failed to fetch financial data' });
    }
  }

  async submitFinancialApplication(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const applicantId = (req.user as any).userId || (req.user as any).id;
      const { fiId, type, amount, currency, purpose } = req.body;

      if (!fiId || !type || !amount || !purpose) {
        return res.status(400).json({ error: 'Missing required application fields' });
      }

      // Check if FI exists and has the correct role
      const fi = await User.findById(fiId);
      if (!fi || fi.role !== 'FINANCIAL_INSTITUTION') {
        return res.status(400).json({ error: 'Invalid financial institution' });
      }

      // Get applicant name
      const applicant = await User.findById(applicantId);
      if (!applicant) {
        return res.status(404).json({ error: 'Applicant not found' });
      }

      const application = new FinancialApplication({
        applicant: applicantId,
        applicantName: applicant.name,
        fi: fiId,
        type: type as ProductType,
        amount: Number(amount),
        currency: currency || 'USD',
        purpose,
      });

      await application.save();

      res.json({
        success: true,
        applicationId: application._id
      });
    } catch (error) {
      logger.error('Error submitting financial application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }

  async getFinancialApplicationDetails(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { applicationId } = req.params;

      if (!applicationId) {
        return res.status(400).json({ error: 'Application ID is required' });
      }

      const application = await FinancialApplication.findById(applicationId)
        .populate('applicant', 'name email')
        .populate('fi', 'name email');

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Check if user is authorized to view this application
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isApplicant = application.applicant.toString() === userId;
      const isFI = application.fi.toString() === userId && user.role === 'FINANCIAL_INSTITUTION';

      if (!isApplicant && !isFI) {
        return res.status(403).json({ error: 'Not authorized to view this application' });
      }

      const formattedApplication = {
        id: application._id,
        applicantId: application.applicant._id,
        applicantName: application.applicantName,
        fiId: application.fi._id,
        type: application.type,
        amount: application.amount,
        currency: application.currency,
        status: application.status,
        purpose: application.purpose,
        submittedAt: application.submittedAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
        approvedAt: application.approvedAt?.toISOString(),
        rejectedAt: application.rejectedAt?.toISOString(),
        disbursedAt: application.disbursedAt?.toISOString(),
        notes: application.notes,
      };

      const applicantProfile = isFI ? {
        id: (application as any).applicant._id,
        name: (application as any).applicant.name,
        email: (application as any).applicant.email,
      } : null;

      res.json({
        application: formattedApplication,
        applicant: applicantProfile
      });
    } catch (error) {
      logger.error('Error fetching application details:', error);
      res.status(500).json({ error: 'Failed to fetch application details' });
    }
  }

  async updateFinancialApplicationStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { applicationId, status } = req.body;

      if (!applicationId || !status) {
        return res.status(400).json({ error: 'Application ID and status are required' });
      }

      // Check if user is a FI
      const user = await User.findById(userId);
      if (!user || user.role !== 'FINANCIAL_INSTITUTION') {
        return res.status(403).json({ error: 'Not authorized to update application status' });
      }

      const validStatuses = ['APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const application = await FinancialApplication.findById(applicationId);
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Check if user is the assigned FI
      if (application.fi.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this application' });
      }

      const updateData: any = {
        status: status as ApplicationStatus,
        updatedAt: new Date(),
      };

      if (status === 'APPROVED') {
        updateData.approvedAt = new Date();
      } else if (status === 'REJECTED') {
        updateData.rejectedAt = new Date();
      }

      await FinancialApplication.findByIdAndUpdate(applicationId, updateData);

      res.json({
        success: true,
        message: `Application status updated to ${status}`
      });
    } catch (error) {
      logger.error('Error updating application status:', error);
      res.status(500).json({ error: 'Failed to update application status' });
    }
  }

  async createFinancialProduct(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const fiId = (req.user as any).userId || (req.user as any).id;
      const { name, type, description, interestRate, maxAmount, targetRoles } = req.body;

      // Check if user is a FI
      const user = await User.findById(fiId);
      if (!user || user.role !== 'FINANCIAL_INSTITUTION') {
        return res.status(403).json({ error: 'Not authorized to create financial products' });
      }

      if (!name || !type || !description) {
        return res.status(400).json({ error: 'Name, type, and description are required' });
      }

      const product = new FinancialProduct({
        fi: fiId,
        name: name.trim(),
        type: type as ProductType,
        description: description.trim(),
        interestRate: type === 'LOAN' ? interestRate : undefined,
        maxAmount,
        targetRoles: targetRoles || [],
      });

      await product.save();

      res.json({
        success: true,
        productId: product._id
      });
    } catch (error) {
      logger.error('Error creating financial product:', error);
      res.status(500).json({ error: 'Failed to create financial product' });
    }
  }

  async getFinancialProducts(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const fiId = (req.user as any).userId || (req.user as any).id;

      // Check if user is a FI
      const user = await User.findById(fiId);
      if (!user || user.role !== 'FINANCIAL_INSTITUTION') {
        return res.status(403).json({ error: 'Not authorized to view financial products' });
      }

      const products = await FinancialProduct.find({ fi: fiId })
        .sort({ createdAt: -1 });

      const formattedProducts = products.map(product => ({
        id: product._id,
        name: product.name,
        type: product.type,
        description: product.description,
        interestRate: product.interestRate,
        maxAmount: product.maxAmount,
        minAmount: product.minAmount,
        term: product.term,
        targetRoles: product.targetRoles,
        status: product.status,
        requirements: product.requirements,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }));

      res.json({ products: formattedProducts });
    } catch (error) {
      logger.error('Error fetching financial products:', error);
      res.status(500).json({ error: 'Failed to fetch financial products' });
    }
  }

  async getFinancialInstitutions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const fis = await User.find({ role: 'FINANCIAL_INSTITUTION' })
        .select('name email')
        .sort({ name: 1 });

      const formattedFIs = fis.map(fi => ({
        id: fi._id,
        displayName: fi.name,
        email: fi.email,
      }));

      res.json(formattedFIs);
    } catch (error) {
      logger.error('Error fetching financial institutions:', error);
      res.status(500).json({ error: 'Failed to fetch financial institutions' });
    }
  }

  async getFiApplications(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const fiId = (req.user as any).userId || (req.user as any).id;
      const { status } = req.query;

      // Check if user is a FI
      const user = await User.findById(fiId);
      if (!user || user.role !== 'FINANCIAL_INSTITUTION') {
        return res.status(403).json({ error: 'Not authorized to view applications' });
      }

      let query: any = { fi: fiId };

      if (status && status !== 'All') {
        query.status = status;
      }

      const applications = await FinancialApplication.find(query)
        .populate('applicant', 'name email')
        .sort({ submittedAt: -1 });

      const formattedApplications = applications.map(app => ({
        id: app._id,
        applicantId: app.applicant._id,
        applicantName: app.applicantName,
        type: app.type,
        amount: app.amount,
        currency: app.currency,
        status: app.status,
        purpose: app.purpose,
        submittedAt: app.submittedAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        approvedAt: app.approvedAt?.toISOString(),
        rejectedAt: app.rejectedAt?.toISOString(),
        disbursedAt: app.disbursedAt?.toISOString(),
        notes: app.notes,
        applicant: {
          id: (app as any).applicant._id,
          name: (app as any).applicant.name,
          email: (app as any).applicant.email,
        },
      }));

      res.json({ applications: formattedApplications });
    } catch (error) {
      logger.error('Error fetching FI applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }
}