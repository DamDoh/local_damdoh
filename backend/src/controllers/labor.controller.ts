import { Request, Response } from 'express';
import { Worker, WorkLog, Payment, IWorker, IWorkLog, IPayment } from '../models/labor.model';
import { logger } from '../utils/logger';

export class LaborController {
  async addWorker(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const farmerId = (req.user as any).userId || (req.user as any).id;
      const { name, contactInfo, payRate, payRateUnit } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Worker name is required' });
      }

      const worker = new Worker({
        farmer: farmerId,
        name: name.trim(),
        contactInfo,
        payRate,
        payRateUnit,
      });

      await worker.save();

      res.json({
        success: true,
        workerId: worker._id
      });
    } catch (error) {
      logger.error('Error adding worker:', error);
      res.status(500).json({ error: 'Failed to add worker' });
    }
  }

  async getWorkers(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const farmerId = (req.user as any).userId || (req.user as any).id;

      const workers = await Worker.find({
        farmer: farmerId,
        isActive: true
      }).sort({ name: 1 });

      const formattedWorkers = workers.map(worker => ({
        id: worker._id,
        name: worker.name,
        contactInfo: worker.contactInfo,
        payRate: worker.payRate,
        payRateUnit: worker.payRateUnit,
        totalHoursLogged: worker.totalHoursLogged,
        totalPaid: worker.totalPaid,
        createdAt: worker.createdAt.toISOString(),
      }));

      res.json({ workers: formattedWorkers });
    } catch (error) {
      logger.error('Error fetching workers:', error);
      res.status(500).json({ error: 'Failed to fetch workers' });
    }
  }

  async logHours(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const farmerId = (req.user as any).userId || (req.user as any).id;
      const { workerId, hours, date, taskDescription } = req.body;

      if (!workerId || !hours || !date) {
        return res.status(400).json({ error: 'Worker ID, hours, and date are required' });
      }

      // Check if worker exists and belongs to the farmer
      const worker = await Worker.findOne({
        _id: workerId,
        farmer: farmerId,
        isActive: true
      });

      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      const workLog = new WorkLog({
        worker: workerId,
        farmer: farmerId,
        hours: Number(hours),
        date: new Date(date),
        taskDescription: taskDescription || 'General farm work',
      });

      await workLog.save();

      res.json({
        success: true,
        workLogId: workLog._id
      });
    } catch (error) {
      logger.error('Error logging hours:', error);
      res.status(500).json({ error: 'Failed to log hours' });
    }
  }

  async logPayment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const farmerId = (req.user as any).userId || (req.user as any).id;
      const { workerId, amount, date, notes, currency } = req.body;

      if (!workerId || !amount || !date || !currency) {
        return res.status(400).json({ error: 'Worker ID, amount, currency, and date are required' });
      }

      // Check if worker exists and belongs to the farmer
      const worker = await Worker.findOne({
        _id: workerId,
        farmer: farmerId,
        isActive: true
      });

      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      // Create payment record
      const payment = new Payment({
        worker: workerId,
        farmer: farmerId,
        amount: Number(amount),
        currency,
        date: new Date(date),
        notes: notes || `Payment for services rendered.`,
      });

      await payment.save();

      // TODO: Integrate with financial services to auto-log as expense
      // This would call the financial transaction logging function
      // For now, we'll just log it
      logger.info(`Payment logged: ${amount} ${currency} to worker ${worker.name}`);

      res.json({
        success: true,
        paymentId: payment._id
      });
    } catch (error) {
      logger.error('Error logging payment:', error);
      res.status(500).json({ error: 'Failed to log payment' });
    }
  }

  async getWorkerDetails(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const farmerId = (req.user as any).userId || (req.user as any).id;
      const { workerId } = req.params;

      if (!workerId) {
        return res.status(400).json({ error: 'Worker ID is required' });
      }

      // Check if worker exists and belongs to the farmer
      const worker = await Worker.findOne({
        _id: workerId,
        farmer: farmerId,
        isActive: true
      });

      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      // Get work logs and payments
      const [workLogs, payments] = await Promise.all([
        WorkLog.find({ worker: workerId })
          .sort({ date: -1 })
          .limit(20),
        Payment.find({ worker: workerId })
          .sort({ date: -1 })
          .limit(20)
      ]);

      const formattedWorkLogs = workLogs.map(log => ({
        id: log._id,
        hours: log.hours,
        date: log.date.toISOString(),
        taskDescription: log.taskDescription,
        isPaid: log.isPaid,
        createdAt: log.createdAt.toISOString(),
      }));

      const formattedPayments = payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        date: payment.date.toISOString(),
        notes: payment.notes,
        createdAt: payment.createdAt.toISOString(),
      }));

      const profile = {
        id: worker._id,
        name: worker.name,
        contactInfo: worker.contactInfo,
        payRate: worker.payRate,
        payRateUnit: worker.payRateUnit,
        totalHoursLogged: worker.totalHoursLogged,
        totalPaid: worker.totalPaid,
        createdAt: worker.createdAt.toISOString(),
      };

      res.json({
        profile,
        workLogs: formattedWorkLogs,
        payments: formattedPayments
      });
    } catch (error) {
      logger.error('Error fetching worker details:', error);
      res.status(500).json({ error: 'Failed to fetch worker details' });
    }
  }

  async getWorkLogs(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const farmerId = (req.user as any).userId || (req.user as any).id;
      const { workerId } = req.params;
      const { startDate, endDate, limit = 50 } = req.query;

      if (!workerId) {
        return res.status(400).json({ error: 'Worker ID is required' });
      }

      // Check if worker belongs to the farmer
      const worker = await Worker.findOne({
        _id: workerId,
        farmer: farmerId,
        isActive: true
      });

      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      let query: any = { worker: workerId };

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
      }

      const workLogs = await WorkLog.find(query)
        .sort({ date: -1 })
        .limit(Number(limit));

      const formattedWorkLogs = workLogs.map(log => ({
        id: log._id,
        hours: log.hours,
        date: log.date.toISOString(),
        taskDescription: log.taskDescription,
        isPaid: log.isPaid,
        createdAt: log.createdAt.toISOString(),
      }));

      res.json({ workLogs: formattedWorkLogs });
    } catch (error) {
      logger.error('Error fetching work logs:', error);
      res.status(500).json({ error: 'Failed to fetch work logs' });
    }
  }

  async getPayments(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const farmerId = (req.user as any).userId || (req.user as any).id;
      const { workerId } = req.params;
      const { startDate, endDate, limit = 50 } = req.query;

      if (!workerId) {
        return res.status(400).json({ error: 'Worker ID is required' });
      }

      // Check if worker belongs to the farmer
      const worker = await Worker.findOne({
        _id: workerId,
        farmer: farmerId,
        isActive: true
      });

      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      let query: any = { worker: workerId };

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
      }

      const payments = await Payment.find(query)
        .sort({ date: -1 })
        .limit(Number(limit));

      const formattedPayments = payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        date: payment.date.toISOString(),
        notes: payment.notes,
        createdAt: payment.createdAt.toISOString(),
      }));

      res.json({ payments: formattedPayments });
    } catch (error) {
      logger.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  }
}