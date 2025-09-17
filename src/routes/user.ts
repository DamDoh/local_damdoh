import { Router } from 'express';
import { authUser } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', authUser, async (req, res) => {
  try {
    res.status(200).json({ message: 'Get profile endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authUser, async (req, res) => {
  try {
    res.status(200).json({ message: 'Update profile endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;