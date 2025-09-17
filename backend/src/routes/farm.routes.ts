import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { FarmController } from '../controllers/farm.controller';
import { body } from 'express-validator';

const router = express.Router();
const farmController = new FarmController();

// Get all farms (with filters)
router.get('/', farmController.getAll.bind(farmController));

// Get farms near a location
router.get('/nearby', farmController.getNearbyFarms.bind(farmController));

// Get farms by owner
router.get('/owner/:ownerId', farmController.getFarmsByOwner.bind(farmController));

// Create a new farm
router.post('/',
  requireAuth(['FARMER']),
  [
    body('name').trim().notEmpty(),
    body('location.coordinates').isArray().isLength({ min: 2, max: 2 }),
    body('size.value').isNumeric(),
    body('size.unit').isIn(['hectares', 'acres']),
  ],
  farmController.create.bind(farmController)
);

// Get a specific farm
router.get('/:id', farmController.getById.bind(farmController));

// Update a farm
router.put('/:id',
  requireAuth(['FARMER']),
  farmController.update.bind(farmController)
);

// Delete a farm
router.delete('/:id',
  requireAuth(['FARMER']),
  farmController.delete.bind(farmController)
);

// Add a crop to a farm
router.post('/:farmId/crops',
  requireAuth(['FARMER']),
  [
    body('name').trim().notEmpty(),
    body('plantedArea').isNumeric(),
    body('plantingDate').isISO8601(),
    body('expectedHarvestDate').isISO8601(),
  ],
  farmController.addCrop.bind(farmController)
);

// Update a crop in a farm
router.put('/:farmId/crops/:cropId',
  requireAuth(['FARMER']),
  farmController.updateCrop.bind(farmController)
);

// Delete a crop from a farm
router.delete('/:farmId/crops/:cropId',
  requireAuth(['FARMER']),
  farmController.deleteCrop.bind(farmController)
);

// Update soil data
router.put('/:farmId/soil-data',
  requireAuth(['FARMER']),
  [
    body('type').isIn(['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other']),
    body('ph').isFloat({ min: 0, max: 14 }),
    body('organicMatter').isFloat({ min: 0 }),
  ],
  farmController.updateSoilData.bind(farmController)
);

export default router;