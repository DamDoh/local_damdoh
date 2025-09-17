import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { UserController } from '../controllers/user.controller';
import { body } from 'express-validator';

const router = express.Router();
const userController = new UserController();

// Get user profile
router.get('/profile', 
  requireAuth(),
  userController.getProfile.bind(userController)
);

// Update user profile
router.put('/profile',
  requireAuth(),
  [
    body('name').optional().trim().notEmpty(),
    body('phoneNumber').optional().trim(),
  ],
  userController.updateProfile.bind(userController)
);

// Upsert stakeholder profile
router.post('/profile/stakeholder',
  requireAuth(),
  userController.upsertStakeholderProfile.bind(userController)
);

// Get user profile by ID
router.get('/profile/:uid',
  requireAuth(),
  userController.getProfileById.bind(userController)
);

// Get all profiles (admin only)
router.get('/profiles',
  requireAuth(),
  userController.getAllProfiles.bind(userController)
);

// Delete user account
router.delete('/account',
  requireAuth(),
  userController.deleteUserAccount.bind(userController)
);

// Request data export
router.post('/export',
  requireAuth(),
  userController.requestDataExport.bind(userController)
);

// Get user data by Universal ID
router.post('/universal-id',
  requireAuth(),
  userController.getUniversalIdData.bind(userController)
);

// Lookup user by phone number
router.post('/lookup-by-phone',
  requireAuth(),
  userController.lookupUserByPhone.bind(userController)
);

// Create recovery session
router.post('/recovery-session',
  userController.createRecoverySession.bind(userController)
);

// Scan recovery QR code
router.post('/scan-recovery-qr',
  requireAuth(),
  userController.scanRecoveryQr.bind(userController)
);

// Complete recovery process
router.post('/complete-recovery',
  userController.completeRecovery.bind(userController)
);

export default router;