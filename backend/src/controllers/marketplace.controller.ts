import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { 
  Listing, 
  Order, 
  Shop,
  IListing, 
  IOrder,
  IShop,
  ListingStatus,
  OrderStatus 
} from '../models/marketplace.model';
import { logger } from '../utils/logger';

export class MarketplaceController {
  private listingController: BaseController<IListing>;
  private orderController: BaseController<IOrder>;
  private shopController: BaseController<IShop>;

  constructor() {
    this.listingController = new BaseController(Listing);
    this.orderController = new BaseController(Order);
    this.shopController = new BaseController(Shop);
  }

  async createListing(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const listing = new Listing({
        ...req.body,
        seller: (req.user as any).userId || (req.user as any).id,
      });
      await listing.save();
      res.status(201).json(listing);
    } catch (error) {
      logger.error('Error creating listing:', error);
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }

  async searchListings(req: Request, res: Response) {
    try {
      const {
        query,
        category,
        minPrice,
        maxPrice,
        status = ListingStatus.ACTIVE,
        location,
        radius,
        ...paginationParams
      } = req.query;

      const filter: any = { status };

      if (query) {
        filter.$text = { $search: query as string };
      }

      if (category) {
        filter.category = category;
      }

      if (minPrice || maxPrice) {
        filter['price.amount'] = {};
        if (minPrice) filter['price.amount'].$gte = Number(minPrice);
        if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
      }

      if (location && radius) {
        const [longitude, latitude] = (location as string).split(',').map(Number);
        filter.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: Number(radius) * 1000, // Convert km to meters
          },
        };
      }

      const result = await this.listingController['findWithPagination'](
        filter,
        Number(paginationParams.page),
        Number(paginationParams.limit),
        paginationParams.sort as string,
        'seller'
      );

      res.json(result);
    } catch (error) {
      logger.error('Error searching listings:', error);
      res.status(500).json({ error: 'Failed to search listings' });
    }
  }

  async getListingsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      const filter: any = { seller: userId };
      if (status) {
        filter.status = status;
      }

      const result = await this.listingController['findWithPagination'](
        filter,
        Number(req.query.page),
        Number(req.query.limit),
        req.query.sort as string
      );

      res.json(result);
    } catch (error) {
      logger.error('Error fetching user listings:', error);
      res.status(500).json({ error: 'Failed to fetch user listings' });
    }
  }

  async getListingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const listing = await Listing.findById(id).populate('seller', 'name email');
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      res.json(listing);
    } catch (error) {
      logger.error('Error fetching listing by ID:', error);
      res.status(500).json({ error: 'Failed to fetch listing' });
    }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { listingId, quantity, shippingAddress } = req.body;

      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.status !== ListingStatus.ACTIVE) {
        return res.status(400).json({ error: 'Listing is not available' });
      }

      if (listing.quantity.available < quantity) {
        return res.status(400).json({ error: 'Insufficient quantity available' });
      }

      const order = new Order({
        buyer: (req.user as any).userId || (req.user as any).id,
        seller: listing.seller,
        listing: listing._id,
        quantity,
        totalPrice: {
          amount: listing.price.amount * quantity,
          currency: listing.price.currency,
        },
        shippingAddress,
      });

      await order.save();

      // Update listing quantity
      listing.quantity.available -= quantity;
      if (listing.quantity.available === 0) {
        listing.status = ListingStatus.SOLD;
      }
      await listing.save();

      res.status(201).json(order);
    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.query;

      const filter: any = role === 'seller' 
        ? { seller: userId }
        : { buyer: userId };

      const result = await this.orderController['findWithPagination'](
        filter,
        Number(req.query.page),
        Number(req.query.limit),
        req.query.sort as string,
        ['listing', 'buyer', 'seller']
      );

      res.json(result);
    } catch (error) {
      logger.error('Error fetching user orders:', error);
      res.status(500).json({ error: 'Failed to fetch user orders' });
    }
  }

  async getBuyerOrders(req: Request, res: Response) {
    try {
      const userId = (req.user as any).userId || (req.user as any).id;
      
      const result = await this.orderController['findWithPagination'](
        { buyer: userId },
        Number(req.query.page),
        Number(req.query.limit),
        req.query.sort as string,
        ['listing', 'seller']
      );

      res.json(result);
    } catch (error) {
      logger.error('Error fetching buyer orders:', error);
      res.status(500).json({ error: 'Failed to fetch buyer orders' });
    }
  }

  async createShop(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { name, description, stakeholderType } = req.body;
      const userId = (req.user as any).userId || (req.user as any).id;

      // Create a new shop
      const shop = new Shop({
        ownerId: userId,
        name,
        description,
        stakeholderType,
        logoUrl: null,
        bannerUrl: null,
        contactInfo: {},
        itemCount: 0,
        rating: 0,
      });
      
      await shop.save();

      res.status(201).json({
        success: true,
        shopId: shop._id,
        message: "Digital Shopfront created successfully.",
      });
    } catch (error) {
      logger.error('Error creating shop:', error);
      res.status(500).json({ error: 'Failed to create Digital Shopfront.' });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Validate status transition
      const validTransitions: { [key: string]: OrderStatus[] } = {
        [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
        [OrderStatus.PAID]: [OrderStatus.SHIPPED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return res.status(400).json({ error: 'Invalid status transition' });
      }

      order.status = status;
      await order.save();

      res.json(order);
    } catch (error) {
      logger.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  async getShopDetails(req: Request, res: Response) {
    try {
      const { shopId } = req.params;
      
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({ error: 'Shop not found' });
      }
      
      res.json(shop);
    } catch (error) {
      logger.error('Error fetching shop details:', error);
      res.status(500).json({ error: 'Failed to fetch shop details' });
    }
  }
}