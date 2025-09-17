import express from 'express';
import { body } from 'express-validator';
import { RecoveryController } from '../controllers/recovery.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Recovery routes are working!' });
});

// Create recovery session
router.post(
  '/recovery-session',
  requireAuth(),
  [
    body('phoneNumber').trim().notEmpty(),
  ],
  RecoveryController.createRecoverySession
);

// Scan recovery QR code
router.post(
  '/scan-recovery-qr',
  requireAuth(),
  [
    body('sessionId').notEmpty(),
    body('scannedSecret').notEmpty(),
  ],
  RecoveryController.scanRecoveryQr
);

// Complete recovery process
router.post(
  '/complete-recovery',
  requireAuth(),
  [
    body('sessionId').notEmpty(),
  ],
  RecoveryController.completeRecovery
);

export default router;