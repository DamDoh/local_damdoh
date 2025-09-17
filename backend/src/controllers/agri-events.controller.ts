import { Request, Response } from 'express';
import {
  AgriEvent,
  EventAttendee,
  EventCoupon,
  EventStaff,
  CouponDiscountType,
  IAgriEvent,
  IEventAttendee,
  IEventCoupon,
  IEventStaff
} from '../models/agri-events.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class AgriEventsController {
  async createAgriEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const {
        title,
        description,
        eventDate,
        eventTime,
        location,
        eventType,
        organizer,
        websiteLink,
        imageUrl,
        registrationEnabled,
        attendeeLimit,
        price,
        currency
      } = req.body;

      if (!title || !description || !eventDate || !location || !eventType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const agriEvent = new AgriEvent({
        title: title.trim(),
        description,
        eventDate: new Date(eventDate),
        eventTime,
        location: {
          address: location.address,
          coordinates: location.coordinates,
        },
        eventType,
        organizer: organizer?.trim(),
        organizerId: userId,
        listerId: userId,
        websiteLink: websiteLink?.trim(),
        imageUrl: imageUrl?.trim(),
        registrationEnabled: registrationEnabled || false,
        attendeeLimit,
        price: price || 0,
        currency: currency || 'USD',
      });

      await agriEvent.save();

      res.json({
        eventId: agriEvent._id,
        title: agriEvent.title,
        message: 'Agricultural event created successfully'
      });
    } catch (error) {
      logger.error('Error creating agri event:', error);
      res.status(500).json({ error: 'Failed to create agricultural event' });
    }
  }

  async getAgriEvents(req: Request, res: Response) {
    try {
      const {
        eventType,
        organizerId,
        listerId,
        registrationEnabled,
        upcoming,
        page = 1,
        limit = 50
      } = req.query;

      const query: any = {};

      if (eventType) {
        query.eventType = eventType;
      }

      if (organizerId) {
        query.organizerId = organizerId;
      }

      if (listerId) {
        query.listerId = listerId;
      }

      if (registrationEnabled !== undefined) {
        query.registrationEnabled = registrationEnabled === 'true';
      }

      if (upcoming === 'true') {
        query.eventDate = { $gte: new Date() };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const events = await AgriEvent.find(query)
        .populate('organizerId', 'name email')
        .populate('listerId', 'name email')
        .sort({ eventDate: 1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await AgriEvent.countDocuments(query);

      const formattedEvents = events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate.toISOString(),
        eventTime: event.eventTime,
        location: event.location,
        eventType: event.eventType,
        organizer: event.organizer,
        organizerId: event.organizerId,
        listerId: event.listerId,
        websiteLink: event.websiteLink,
        imageUrl: event.imageUrl,
        registrationEnabled: event.registrationEnabled,
        attendeeLimit: event.attendeeLimit,
        registeredAttendeesCount: event.registeredAttendeesCount,
        price: event.price,
        currency: event.currency,
        createdAt: event.createdAt.toISOString(),
      }));

      res.json({
        events: formattedEvents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching agri events:', error);
      res.status(500).json({ error: 'Failed to fetch agricultural events' });
    }
  }

  async getEventDetails(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      const event = await AgriEvent.findById(eventId)
        .populate('organizerId', 'name email avatarUrl')
        .populate('listerId', 'name email avatarUrl');

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      let isRegistered = false;
      if (req.user) {
        const userId = (req.user as any).userId || (req.user as any).id;
        const attendee = await EventAttendee.findOne({
          event: eventId,
          user: userId
        });
        isRegistered = !!attendee;
      }

      const eventDetails = {
        id: event._id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate.toISOString(),
        eventTime: event.eventTime,
        location: event.location,
        eventType: event.eventType,
        organizer: event.organizer,
        organizerId: event.organizerId,
        listerId: event.listerId,
        websiteLink: event.websiteLink,
        imageUrl: event.imageUrl,
        registrationEnabled: event.registrationEnabled,
        attendeeLimit: event.attendeeLimit,
        registeredAttendeesCount: event.registeredAttendeesCount,
        price: event.price,
        currency: event.currency,
        createdAt: event.createdAt.toISOString(),
        isRegistered,
      };

      res.json(eventDetails);
    } catch (error) {
      logger.error('Error fetching event details:', error);
      res.status(500).json({ error: 'Failed to fetch event details' });
    }
  }

  async registerForEvent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { eventId, couponCode } = req.body;

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      // Check if event exists
      const event = await AgriEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if registration is enabled
      if (!event.registrationEnabled) {
        return res.status(400).json({ error: 'Registration is not open for this event' });
      }

      // Check attendee limit
      if (event.attendeeLimit && event.registeredAttendeesCount >= event.attendeeLimit) {
        return res.status(400).json({ error: 'This event is full' });
      }

      // Check if user is already registered
      const existingAttendee = await EventAttendee.findOne({
        event: eventId,
        user: userId
      });

      if (existingAttendee) {
        return res.status(400).json({ error: 'You are already registered for this event' });
      }

      // Get user profile
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      let finalPrice = event.price;
      let discountApplied = 0;
      let couponUsed: string | undefined;

      // Validate and apply coupon if provided
      if (couponCode && finalPrice > 0) {
        const couponResult = await this.validateEventCoupon(eventId, couponCode);
        if (!couponResult.valid) {
          return res.status(400).json({ error: couponResult.message || 'Invalid coupon code' });
        }

        couponUsed = couponCode;
        if (couponResult.discountType === 'FIXED' && couponResult.discountValue) {
          discountApplied = couponResult.discountValue;
          finalPrice = Math.max(0, finalPrice - discountApplied);
        } else if (couponResult.discountType === 'PERCENTAGE' && couponResult.discountValue) {
          discountApplied = finalPrice * (couponResult.discountValue / 100);
          finalPrice = finalPrice - discountApplied;
        }
      }

      // Create attendee record
      const attendee = new EventAttendee({
        event: eventId,
        user: userId,
        email: user.email,
        displayName: user.name,
        avatarUrl: user.avatarUrl,
        couponUsed,
        discountApplied,
        finalPrice,
      });

      await attendee.save();

      res.json({
        success: true,
        message: 'Successfully registered for the event',
        finalPrice,
        discountApplied
      });
    } catch (error) {
      logger.error('Error registering for event:', error);
      res.status(500).json({ error: 'Failed to register for event' });
    }
  }

  async checkInAttendee(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const callerId = (req.user as any).userId || (req.user as any).id;
      const { eventId, attendeeId } = req.body;

      if (!eventId || !attendeeId) {
        return res.status(400).json({ error: 'Event ID and Attendee ID are required' });
      }

      // Check if event exists and user has permission
      const event = await AgriEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if caller is organizer or staff
      const isOrganizer = event.organizerId.toString() === callerId;
      const isStaff = await EventStaff.findOne({
        event: eventId,
        user: callerId
      });

      if (!isOrganizer && !isStaff) {
        return res.status(403).json({ error: 'You are not authorized to check-in attendees for this event' });
      }

      // Find attendee
      const attendee = await EventAttendee.findById(attendeeId).populate('user', 'name');
      if (!attendee) {
        return res.status(404).json({ error: 'Attendee not found' });
      }

      if (attendee.event.toString() !== eventId) {
        return res.status(400).json({ error: 'Attendee does not belong to this event' });
      }

      if (attendee.checkedIn) {
        return res.status(400).json({ error: 'Attendee has already been checked in' });
      }

      // Update check-in status
      attendee.checkedIn = true;
      attendee.checkedInAt = new Date();
      await attendee.save();

      res.json({
        success: true,
        message: `Successfully checked in ${attendee.displayName}`,
        attendee: {
          id: attendee._id,
          displayName: attendee.displayName,
          checkedInAt: attendee.checkedInAt?.toISOString(),
        }
      });
    } catch (error) {
      logger.error('Error checking in attendee:', error);
      res.status(500).json({ error: 'Failed to check in attendee' });
    }
  }

  async getEventAttendees(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { eventId } = req.params;
      const { checkedIn, page = 1, limit = 50 } = req.query;

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      // Check if user has permission to view attendees
      const event = await AgriEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const isOrganizer = event.organizerId.toString() === userId;
      const isStaff = await EventStaff.findOne({
        event: eventId,
        user: userId
      });

      if (!isOrganizer && !isStaff) {
        return res.status(403).json({ error: 'You are not authorized to view attendees for this event' });
      }

      const query: any = { event: eventId };

      if (checkedIn !== undefined) {
        query.checkedIn = checkedIn === 'true';
      }

      const skip = (Number(page) - 1) * Number(limit);

      const attendees = await EventAttendee.find(query)
        .populate('user', 'name email avatarUrl')
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await EventAttendee.countDocuments(query);

      const formattedAttendees = attendees.map(attendee => ({
        id: attendee._id,
        user: {
          id: attendee.user,
          name: attendee.displayName,
          email: attendee.email,
          avatarUrl: attendee.avatarUrl,
        },
        registeredAt: attendee.registeredAt.toISOString(),
        checkedIn: attendee.checkedIn,
        checkedInAt: attendee.checkedInAt?.toISOString(),
        couponUsed: attendee.couponUsed,
        discountApplied: attendee.discountApplied,
        finalPrice: attendee.finalPrice,
      }));

      res.json({
        attendees: formattedAttendees,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching event attendees:', error);
      res.status(500).json({ error: 'Failed to fetch event attendees' });
    }
  }

  async createEventCoupon(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { eventId, code, discountType, discountValue, expiryDate, usageLimit } = req.body;

      if (!eventId || !code || !discountType || !discountValue) {
        return res.status(400).json({ error: 'Missing required coupon fields' });
      }

      // Check if user is the organizer
      const event = await AgriEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.organizerId.toString() !== userId) {
        return res.status(403).json({ error: 'You are not authorized to create coupons for this event' });
      }

      const coupon = new EventCoupon({
        event: eventId,
        code: code.toUpperCase(),
        discountType,
        discountValue,
        expiresAt: expiryDate ? new Date(expiryDate) : undefined,
        usageLimit,
      });

      await coupon.save();

      res.json({
        success: true,
        couponId: coupon._id,
        message: 'Event coupon created successfully'
      });
    } catch (error) {
      logger.error('Error creating event coupon:', error);
      res.status(500).json({ error: 'Failed to create event coupon' });
    }
  }

  async getEventCoupons(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { eventId } = req.params;

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      // Check if user is the organizer
      const event = await AgriEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.organizerId.toString() !== userId) {
        return res.status(403).json({ error: 'You are not authorized to view coupons for this event' });
      }

      const coupons = await EventCoupon.find({ event: eventId })
        .sort({ createdAt: -1 });

      const formattedCoupons = coupons.map(coupon => ({
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expiresAt: coupon.expiresAt?.toISOString(),
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        createdAt: coupon.createdAt.toISOString(),
      }));

      res.json({ coupons: formattedCoupons });
    } catch (error) {
      logger.error('Error fetching event coupons:', error);
      res.status(500).json({ error: 'Failed to fetch event coupons' });
    }
  }

  async addEventStaff(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const organizerId = (req.user as any).userId || (req.user as any).id;
      const { eventId, staffUserId, staffDisplayName, staffAvatarUrl } = req.body;

      if (!eventId || !staffUserId) {
        return res.status(400).json({ error: 'Event ID and Staff User ID are required' });
      }

      // Check if user is the organizer
      const event = await AgriEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.organizerId.toString() !== organizerId) {
        return res.status(403).json({ error: 'You are not authorized to add staff to this event' });
      }

      // Check if user exists
      const staffUser = await User.findById(staffUserId);
      if (!staffUser) {
        return res.status(404).json({ error: 'Staff user not found' });
      }

      // Check if already staff
      const existingStaff = await EventStaff.findOne({
        event: eventId,
        user: staffUserId
      });

      if (existingStaff) {
        return res.status(400).json({ error: 'User is already staff for this event' });
      }

      const staff = new EventStaff({
        event: eventId,
        user: staffUserId,
        displayName: staffDisplayName || staffUser.name,
        avatarUrl: staffAvatarUrl || staffUser.avatarUrl,
        addedBy: organizerId,
      });

      await staff.save();

      res.json({
        success: true,
        message: `${staff.displayName} has been added as staff`,
        staffId: staff._id
      });
    } catch (error) {
      logger.error('Error adding event staff:', error);
      res.status(500).json({ error: 'Failed to add event staff' });
    }
  }

  async getEventStaff(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const organizerId = (req.user as any).userId || (req.user as any).id;
      const { eventId } = req.params;

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      // Check if user is the organizer
      const event = await AgriEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.organizerId.toString() !== organizerId) {
        return res.status(403).json({ error: 'You are not authorized to view staff for this event' });
      }

      const staff = await EventStaff.find({ event: eventId })
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
        addedAt: s.addedAt.toISOString(),
      }));

      res.json({ staff: formattedStaff });
    } catch (error) {
      logger.error('Error fetching event staff:', error);
      res.status(500).json({ error: 'Failed to fetch event staff' });
    }
  }

  async removeEventStaff(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const organizerId = (req.user as any).userId || (req.user as any).id;
      const { eventId, staffUserId } = req.body;

      if (!eventId || !staffUserId) {
        return res.status(400).json({ error: 'Event ID and Staff User ID are required' });
      }

      // Check if user is the organizer
      const event = await AgriEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.organizerId.toString() !== organizerId) {
        return res.status(403).json({ error: 'You are not authorized to remove staff from this event' });
      }

      const staff = await EventStaff.findOneAndDelete({
        event: eventId,
        user: staffUserId
      });

      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      res.json({
        success: true,
        message: 'Staff member has been removed'
      });
    } catch (error) {
      logger.error('Error removing event staff:', error);
      res.status(500).json({ error: 'Failed to remove event staff' });
    }
  }

  private async validateEventCoupon(eventId: string, couponCode: string): Promise<{
    valid: boolean;
    message?: string;
    discountType?: CouponDiscountType;
    discountValue?: number;
    couponId?: string;
  }> {
    try {
      const coupon = await EventCoupon.findOne({
        event: eventId,
        code: couponCode.toUpperCase()
      });

      if (!coupon) {
        return { valid: false, message: 'Coupon not found' };
      }

      // Check expiry
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { valid: false, message: 'This coupon has expired' };
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, message: 'This coupon has reached its usage limit' };
      }

      return {
        valid: true,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        couponId: coupon._id.toString(),
      };
    } catch (error) {
      logger.error('Error validating event coupon:', error);
      return { valid: false, message: 'Error validating coupon' };
    }
  }
}