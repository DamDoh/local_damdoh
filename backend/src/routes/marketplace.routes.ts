import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { MarketplaceController } from '../controllers/marketplace.controller';
import { body } from 'express-validator';

const router = express.Router();
const marketplaceController = new MarketplaceController();

// Listings
router.get('/listings', marketplaceController.searchListings.bind(marketplaceController));

router.get('/listings/user/:userId',
  requireAuth(),
  marketplaceController.getListingsByUser.bind(marketplaceController)
);

router.get('/listings/:id',
  marketplaceController.getListingById.bind(marketplaceController)
);

router.post('/listings',
  requireAuth(),
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('type').isIn(['PRODUCT', 'SERVICE', 'EQUIPMENT']),
    body('price.amount').isNumeric(),
    body('price.currency').isLength({ min: 3, max: 3 }),
    body('quantity.available').isNumeric(),
    body('quantity.unit').notEmpty(),
    body('location.coordinates').isArray().isLength({ min: 2, max: 2 }),
  ],
  marketplaceController.createListing.bind(marketplaceController)
);

// Orders
router.post('/orders',
  requireAuth(),
  [
    body('listingId').isMongoId(),
    body('quantity').isInt({ min: 1 }),
    body('shippingAddress.street').notEmpty(),
    body('shippingAddress.city').notEmpty(),
    body('shippingAddress.country').notEmpty(),
    body('shippingAddress.postalCode').notEmpty(),
  ],
  marketplaceController.createOrder.bind(marketplaceController)
);

router.get('/orders/user/:userId',
  requireAuth(),
  marketplaceController.getUserOrders.bind(marketplaceController)
);

router.get('/seller-orders',
  requireAuth(),
  (req, res) => {
    // Add seller role to the request query
    req.query.role = 'seller';
    // Call the existing getUserOrders method with the current user's ID
    req.params.userId = (req.user as any).userId || (req.user as any).id;
    marketplaceController.getUserOrders(req, res);
  }
);

router.patch('/orders/:orderId/status',
  requireAuth(),
  [
    body('status').isIn(['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  ],
  marketplaceController.updateOrderStatus.bind(marketplaceController)
);

router.get('/orders',
  requireAuth(),
  marketplaceController.getBuyerOrders.bind(marketplaceController)
);

router.post('/shops',
  requireAuth(),
  [
    body('name').notEmpty().withMessage('Shop name is required'),
    body('description').notEmpty().withMessage('Shop description is required'),
    body('stakeholderType').notEmpty().withMessage('Stakeholder type is required'),
  ],
  marketplaceController.createShop.bind(marketplaceController)
);

router.get('/shops/:shopId',
  marketplaceController.getShopDetails.bind(marketplaceController)
);

export default router;