import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { NetworkController } from '../controllers/network.controller';

const router = express.Router();
const networkController = new NetworkController();

// Send connection request
router.post('/send-connection-request',
  requireAuth(),
  networkController.sendConnectionRequest.bind(networkController)
);

// Suggest connections
router.post('/suggest-connections',
  requireAuth(),
  networkController.suggestConnections.bind(networkController)
);

export default router;