import { Request, Response } from 'express';
import { AgroTourismBooking, AgroTourismStaff, IAgroTourismBooking, IAgroTourismStaff } from '../models/agro-tourism.model';
import { Listing } from '../models/marketplace.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class AgroTourismController {
  async bookAgroTourismService(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { itemId, bookingDetails } = req.body;

      if (!itemId) {
        return res.status(400).json({ error: 'Service Item ID is required' });
      }

      // Check if the service exists and is an agro-tourism service
      const service = await Listing.findById(itemId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (service.type !== 'SERVICE' || service.category !== 'agri-tourism-services') {
        return res.status(400).json({ error: 'Invalid agro-tourism service' });
      }

      // Get user profile
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      // Check if user already has a booking for this service
      const existingBooking = await AgroTourismBooking.findOne({
        service: itemId,
        user: userId
      });

      if (existingBooking) {
        return res.status(400).json({ error: 'You have already booked this service' });
      }

      // Calculate total price if applicable
      let totalPrice: number | undefined;
      let currency: string | undefined;

      if (service.price && service.price.amount > 0) {
        totalPrice = service.price.amount;
        currency = service.price.currency;

        // Apply any pricing logic based on booking details
        if (bookingDetails?.numberOfPeople && bookingDetails.numberOfPeople > 1) {
          totalPrice *= bookingDetails.numberOfPeople;
        }
      }

      // Create booking
      const booking = new AgroTourismBooking({
        service: itemId,
        user: userId,
        displayName: user.name,
        avatarUrl: user.avatarUrl,
        bookingDetails: {
          startDate: bookingDetails?.startDate ? new Date(bookingDetails.startDate) : undefined,
          endDate: bookingDetails?.endDate ? new Date(bookingDetails.endDate) : undefined,
          numberOfPeople: bookingDetails?.numberOfPeople,
          specialRequests: bookingDetails?.specialRequests,
          contactInfo: {
            phone: bookingDetails?.contactInfo?.phone || user.phoneNumber,
            email: bookingDetails?.contactInfo?.email || user.email,
          },
        },
        totalPrice,
        currency,
      });

      await booking.save();

      res.json({
        success: true,
        message: 'Successfully booked the agro-tourism service',
        bookingId: booking._id,
        totalPrice,
        currency,
      });
    } catch (error) {
      logger.error('Error booking agro-tourism service:', error);
      res.status(500).json({ error: 'Failed to book agro-tourism service' });
    }
  }

  async checkInAgroTourismBooking(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const callerId = (req.user as any).userId || (req.user as any).id;
      const { itemId, attendeeId } = req.body;

      if (!itemId || !attendeeId) {
        return res.status(400).json({ error: 'Service Item ID and Attendee ID are required' });
      }

      // Check if service exists
      const service = await Listing.findById(itemId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Check if caller is the service provider or staff
      const isProvider = service.seller.toString() === callerId;
      const isStaff = await AgroTourismStaff.findOne({
        service: itemId,
        user: callerId,
        isActive: true
      });

      if (!isProvider && !isStaff) {
        return res.status(403).json({ error: 'You are not authorized to check-in guests for this service' });
      }

      // Get attendee user info
      const attendeeUser = await User.findById(attendeeId);
      if (!attendeeUser) {
        return res.status(404).json({ error: 'Attendee not found' });
      }

      // Find and update booking
      const booking = await AgroTourismBooking.findOne({
        service: itemId,
        user: attendeeId
      });

      if (!booking) {
        return res.status(404).json({ error: `${attendeeUser.name} does not have a booking for this service` });
      }

      if (booking.checkedIn) {
        return res.status(400).json({ error: `${attendeeUser.name} has already been checked in` });
      }

      booking.checkedIn = true;
      booking.checkedInAt = new Date();
      booking.status = 'CONFIRMED';
      await booking.save();

      res.json({
        success: true,
        message: `Successfully checked in ${attendeeUser.name}`,
        bookingId: booking._id,
        checkedInAt: booking.checkedInAt?.toISOString(),
      });
    } catch (error) {
      logger.error('Error checking in agro-tourism booking:', error);
      res.status(500).json({ error: 'Failed to check in booking' });
    }
  }

  async addAgroTourismStaff(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const operatorId = (req.user as any).userId || (req.user as any).id;
      const { itemId, staffUserId, staffDisplayName, staffAvatarUrl, role } = req.body;

      if (!itemId || !staffUserId) {
        return res.status(400).json({ error: 'Service Item ID and Staff User ID are required' });
      }

      // Check if service exists and user is the provider
      const service = await Listing.findById(itemId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (service.seller.toString() !== operatorId) {
        return res.status(403).json({ error: 'You are not authorized to add staff to this service' });
      }

      // Check if staff user exists
      const staffUser = await User.findById(staffUserId);
      if (!staffUser) {
        return res.status(404).json({ error: 'Staff user not found' });
      }

      // Check if already staff
      const existingStaff = await AgroTourismStaff.findOne({
        service: itemId,
        user: staffUserId
      });

      if (existingStaff) {
        return res.status(400).json({ error: 'User is already staff for this service' });
      }

      const staff = new AgroTourismStaff({
        service: itemId,
        user: staffUserId,
        displayName: staffDisplayName || staffUser.name,
        avatarUrl: staffAvatarUrl || staffUser.avatarUrl,
        role,
        addedBy: operatorId,
      });

      await staff.save();

      res.json({
        success: true,
        message: `${staff.displayName} has been added as staff`,
        staffId: staff._id
      });
    } catch (error) {
      logger.error('Error adding agro-tourism staff:', error);
      res.status(500).json({ error: 'Failed to add agro-tourism staff' });
    }
  }

  async getAgroTourismStaff(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const operatorId = (req.user as any).userId || (req.user as any).id;
      const { itemId } = req.params;

      if (!itemId) {
        return res.status(400).json({ error: 'Service Item ID is required' });
      }

      // Check if service exists and user is the provider
      const service = await Listing.findById(itemId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (service.seller.toString() !== operatorId) {
        return res.status(403).json({ error: 'You are not authorized to view staff for this service' });
      }

      const staff = await AgroTourismStaff.find({
        service: itemId,
        isActive: true
      })
        .populate('user', 'name email avatarUrl')
        .sort({ addedAt: -1 });

      const formattedStaff = staff.map(s => ({
        id: s._id,
        user: {
          id: s.user,
          name: s.displayName,
          email: (s as any).user.email,
          avatarUrl: s.avatarUrl,
        },
        role: s.role,
        addedAt: s.addedAt.toISOString(),
      }));

      res.json({ staff: formattedStaff });
    } catch (error) {
      logger.error('Error fetching agro-tourism staff:', error);
      res.status(500).json({ error: 'Failed to fetch agro-tourism staff' });
    }
  }

  async removeAgroTourismStaff(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const operatorId = (req.user as any).userId || (req.user as any).id;
      const { itemId, staffUserId } = req.body;

      if (!itemId || !staffUserId) {
        return res.status(400).json({ error: 'Service Item ID and Staff User ID are required' });
      }

      // Check if service exists and user is the provider
      const service = await Listing.findById(itemId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (service.seller.toString() !== operatorId) {
        return res.status(403).json({ error: 'You are not authorized to remove staff from this service' });
      }

      const staff = await AgroTourismStaff.findOneAndUpdate(
        {
          service: itemId,
          user: staffUserId
        },
        { isActive: false },
        { new: true }
      );

      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      res.json({
        success: true,
        message: 'Staff member has been removed'
      });
    } catch (error) {
      logger.error('Error removing agro-tourism staff:', error);
      res.status(500).json({ error: 'Failed to remove agro-tourism staff' });
    }
  }

  async getAgroTourismBookings(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const operatorId = (req.user as any).userId || (req.user as any).id;
      const { itemId } = req.params;
      const { status, checkedIn, page = 1, limit = 50 } = req.query;

      if (!itemId) {
        return res.status(400).json({ error: 'Service Item ID is required' });
      }

      // Check if service exists and user is the provider
      const service = await Listing.findById(itemId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (service.seller.toString() !== operatorId) {
        return res.status(403).json({ error: 'You are not authorized to view bookings for this service' });
      }

      const query: any = { service: itemId };

      if (status) {
        query.status = status;
      }

      if (checkedIn !== undefined) {
        query.checkedIn = checkedIn === 'true';
      }

      const skip = (Number(page) - 1) * Number(limit);

      const bookings = await AgroTourismBooking.find(query)
        .populate('user', 'name email avatarUrl')
        .sort({ bookedAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await AgroTourismBooking.countDocuments(query);

      const formattedBookings = bookings.map(booking => ({
        id: booking._id,
        user: {
          id: booking.user,
          name: booking.displayName,
          email: (booking as any).user.email,
          avatarUrl: booking.avatarUrl,
        },
        bookingDetails: booking.bookingDetails,
        bookedAt: booking.bookedAt.toISOString(),
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt?.toISOString(),
        status: booking.status,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        paymentStatus: booking.paymentStatus,
        notes: booking.notes,
      }));

      res.json({
        bookings: formattedBookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching agro-tourism bookings:', error);
      res.status(500).json({ error: 'Failed to fetch agro-tourism bookings' });
    }
  }

  async getUserAgroTourismBookings(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { status, upcoming, page = 1, limit = 50 } = req.query;

      const query: any = { user: userId };

      if (status) {
        query.status = status;
      }

      if (upcoming === 'true') {
        query['bookingDetails.startDate'] = { $gte: new Date() };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const bookings = await AgroTourismBooking.find(query)
        .populate('service', 'title description price currency images')
        .sort({ bookedAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await AgroTourismBooking.countDocuments(query);

      const formattedBookings = bookings.map(booking => ({
        id: booking._id,
        service: {
          id: (booking as any).service._id,
          title: (booking as any).service.title,
          description: (booking as any).service.description,
          price: (booking as any).service.price,
          currency: (booking as any).service.currency,
          images: (booking as any).service.images,
        },
        bookingDetails: booking.bookingDetails,
        bookedAt: booking.bookedAt.toISOString(),
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt?.toISOString(),
        status: booking.status,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        paymentStatus: booking.paymentStatus,
        notes: booking.notes,
      }));

      res.json({
        bookings: formattedBookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching user agro-tourism bookings:', error);
      res.status(500).json({ error: 'Failed to fetch user agro-tourism bookings' });
    }
  }
}