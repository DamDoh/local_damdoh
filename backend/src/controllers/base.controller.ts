import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { logger } from '../utils/logger';

export class BaseController<T> {
  constructor(private model: Model<any>) {}

  async create(req: Request, res: Response) {
    try {
      const doc = new this.model(req.body);
      await doc.save();
      res.status(201).json(doc);
    } catch (error) {
      logger.error(`Error creating document:`, error);
      res.status(500).json({ error: `Failed to create document` });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt', ...filter } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [docs, total] = await Promise.all([
        this.model
          .find(filter as any)
          .sort(sort as string)
          .skip(skip)
          .limit(Number(limit))
          .exec(),
        this.model.countDocuments(filter as any).exec(),
      ]);

      res.json({
        data: docs,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error(`Error fetching documents:`, error);
      res.status(500).json({ error: `Failed to fetch documents` });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const doc = await this.model.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: `Document not found` });
      }
      res.json(doc);
    } catch (error) {
      logger.error(`Error fetching document:`, error);
      res.status(500).json({ error: `Failed to fetch document` });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const doc = await this.model.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!doc) {
        return res.status(404).json({ error: `Document not found` });
      }

      res.json(doc);
    } catch (error) {
      logger.error(`Error updating document:`, error);
      res.status(500).json({ error: `Failed to update document` });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const doc = await this.model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: `Document not found` });
      }
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting document:`, error);
      res.status(500).json({ error: `Failed to delete document` });
    }
  }

  protected async findWithPagination(
    filter: any,
    page: number = 1,
    limit: number = 10,
    sort: string = '-createdAt',
    populate?: string | string[]
  ) {
    const skip = (page - 1) * limit;
    let query = this.model.find(filter);

    if (populate) {
      const fields = Array.isArray(populate) ? populate : [populate];
      fields.forEach(field => {
        query = query.populate(field);
      });
    }

    const [docs, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data: docs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }
}