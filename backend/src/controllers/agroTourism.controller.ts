import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { 
  AgroTourismService, 
  AgroTourismBooking, 
  IAgroTourismService, 
  IAgroTourismBooking,
  AgroTourismBookingStatus
} from '../models/agroTourism.model';
import { logger } from '../utils/logger';

export class AgroTourismController {
  private serviceController: BaseController<IAgroTourismService>;
  private bookingController: BaseController<IAgroTourismBooking>;

  constructor() {
    this.serviceController = new BaseController(AgroTourismService);
    this.bookingController = new BaseController(AgroTourismBooking);
  }

  async createService(req: Request, res: Response) {
    try {
      const serviceData = req.body;
      const service = new AgroTourismService(serviceData);
      await service.save();
      res.status(201).json(service);
    } catch (error) {
      logger.error('Error creating agro tourism service:', error);
      res.status(500).json({ error: 'Failed to create agro tourism service' });
    }
  }

  async getServicesBySeller(req: Request, res: Response) {
    try {
      const { sellerId } = req.params;
      const services = await AgroTourismService.find({ sellerId });
      res.json(services);
    } catch (error) {
      logger.error('Error fetching agro tourism services:', error);
      res.status(500).json({ error: 'Failed to fetch agro tourism services' });
    }
  }

  async getServiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await AgroTourismService.findById(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      logger.error('Error fetching agro tourism service:', error);
      res.status(500).json({ error: 'Failed to fetch agro tourism service' });
    }
  }

  async bookService(req: Request, res: Response) {
    try {
      const { serviceId, bookingDetails } = req.body;
      const userId = (req.user as any).userId || (req.user as any).id;

      // Get the service to check availability
      const service = await AgroTourismService.findById(serviceId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Check if dates are within availability range
      if (bookingDetails.startDate < service.availability.startDate || 
          bookingDetails.endDate > service.availability.endDate) {
        return res.status(400).json({ error: 'Booking dates are outside availability range' });
      }

      // Check if guest count is within limits
      if (bookingDetails.guests > service.availability.maxGuests) {
        return res.status(400).json({ error: 'Guest count exceeds maximum allowed' });
      }

      // Create booking
      const booking = new AgroTourismBooking({
        serviceId,
        userId,
        startDate: bookingDetails.startDate,
        endDate: bookingDetails.endDate,
        guests: bookingDetails.guests,
        totalPrice: {
          amount: bookingDetails.totalPrice,
          currency: service.price.currency
        },
        status: AgroTourismBookingStatus.PENDING,
        notes: bookingDetails.notes
      });

      await booking.save();

      res.status(201).json({
        success: true,
        bookingId: booking._id,
        message: 'Booking created successfully'
      });
    } catch (error) {
      logger.error('Error booking agro tourism service:', error);
      res.status(500).json({ error: 'Failed to book agro tourism service' });
    }
  }

  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req.user as any).userId || (req.user as any).id;
      const bookings = await AgroTourismBooking.find({ userId }).populate('serviceId');
      res.json(bookings);
    } catch (error) {
      logger.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
  }

  async getServiceBookings(req: Request, res: Response) {
    try {
      const { serviceId } = req.params;
      const bookings = await AgroTourismBooking.find({ serviceId }).populate('userId');
      res.json(bookings);
    } catch (error) {
      logger.error('Error fetching service bookings:', error);
      res.status(500).json({ error: 'Failed to fetch service bookings' });
    }
  }
}