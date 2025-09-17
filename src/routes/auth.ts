import { Router } from 'express';
import { authUser } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    res.status(200).json({ message: 'Registration endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    res.status(200).json({ message: 'Login endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', authUser, async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;