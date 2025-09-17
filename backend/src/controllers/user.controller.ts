import { Request, Response } from 'express';
import { User, StakeholderRole, IUser } from '../models/user.model';
import { BaseController } from './base.controller';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
// Use crypto instead of uuid for generating unique IDs
import { randomBytes } from 'crypto';

interface ProfileUpdateData {
  primaryRole?: StakeholderRole;
  displayName?: string;
  profileSummary?: string;
  bio?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  areasOfInterest?: string[];
  needs?: string[];
  contactInfoPhone?: string;
  contactInfoWebsite?: string;
  profileData?: any;
}

export class UserController extends BaseController<IUser> {
  constructor() {
    super(User);
  }

  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      logger.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Creates or updates a detailed stakeholder profile
  async upsertStakeholderProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        primaryRole,
        displayName,
        profileSummary,
        bio,
        location,
        areasOfInterest,
        needs,
        contactInfoPhone,
        contactInfoWebsite,
        profileData,
      } = req.body as ProfileUpdateData;

      // During initial sign-up, only role and display name are required.
      if (!primaryRole) {
        return res.status(400).json({
          error: 'A primary role must be provided.',
        });
      }

      const updatePayload: any = {
        primaryRole,
        updatedAt: new Date(),
      };

      if (displayName !== undefined) updatePayload.displayName = displayName;
      if (profileSummary !== undefined) updatePayload.profileSummary = profileSummary;
      if (bio !== undefined) updatePayload.bio = bio;
      if (location !== undefined) updatePayload.location = location;
      if (Array.isArray(areasOfInterest)) updatePayload.areasOfInterest = areasOfInterest;
      if (Array.isArray(needs)) updatePayload.needs = needs;
      if (contactInfoPhone !== undefined || contactInfoWebsite !== undefined) {
        updatePayload.contactInfo = {
          phone: contactInfoPhone || null,
          website: contactInfoWebsite || null,
        };
      }
      // Add the validated data to the payload
      if (profileData) updatePayload.profileData = profileData;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: updatePayload },
        { new: true, upsert: true, runValidators: true }
      );

      if (!user) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.json({ status: "success", message: "Profile updated successfully.", user });
    } catch (error) {
      logger.error('Error upserting stakeholder profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Fetches a user's profile by their ID
  async getProfileById(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      if (!uid) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const user = await User.findById(uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
        location: user.location,
        profileComplete: user.profileComplete,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      logger.error('Error fetching user profile by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Fetches all user profiles (admin only)
  async getAllProfiles(req: Request, res: Response) {
    try {
      // Check if user is admin (you might want to implement proper role checking)
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const users = await User.find({ active: true });
      const profiles = users.map((user: any) => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
        location: user.location,
        profileComplete: user.profileComplete,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      res.json({ profiles });
    } catch (error) {
      logger.error('Error fetching all user profiles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete user account
  async deleteUserAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await User.findByIdAndDelete(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, message: "Account deletion process initiated." });
    } catch (error) {
      logger.error('Error deleting user account:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Request data export
  async requestDataExport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Placeholder for actual data export logic
      // In a real app, this would:
      // 1. Gather all of the user's data from the database
      // 2. Package it into a file (e.g., JSON).
      // 3. Upload it to a secure location.
      // 4. Generate a secure, time-limited download link.
      // 5. Email the link to the user's registered email address.

      res.json({ success: true, message: "If an account with your email exists, a data export link will be sent shortly." });
    } catch (error) {
      logger.error('Error requesting data export:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user data by Universal ID
  async getUniversalIdData(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { scannedUniversalId } = req.body;
      if (!scannedUniversalId) {
        return res.status(400).json({ error: "A 'scannedUniversalId' must be provided." });
      }

      const user = await User.findOne({ universalId: scannedUniversalId });
      if (!user) {
        return res.status(404).json({ error: "The scanned Universal ID does not correspond to any user." });
      }

      // Define the public profile data that anyone can see
      const publicProfile = {
        uid: user._id,
        universalId: user.universalId,
        displayName: user.name,
        primaryRole: user.role,
        avatarUrl: user.avatarUrl || null,
        location: user.location || null,
      };

      // Here, we implement the Role-Based Access Control (RBAC) logic.
      if (req.user.userId === user._id.toString()) {
        return res.json({ 
          ...publicProfile, 
          phoneNumber: user.phoneNumber, 
          email: user.email 
        });
      } else {
        // For simplicity, we're not implementing role-based access control here
        // In a real app, you would check the user's role
        return res.json(publicProfile);
      }
    } catch (error) {
      logger.error('Error retrieving Universal ID data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Lookup user by phone number (for authorized agents)
  async lookupUserByPhone(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "A 'phoneNumber' must be provided." });
      }

      // In a real app, you would check if the user has the proper role/authorization
      // For now, we'll just do a simple lookup

      const user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(404).json({ error: `No user found with the phone number: ${phoneNumber}.` });
      }

      res.json({
        uid: user._id,
        universalId: user.universalId,
        displayName: user.name,
        primaryRole: user.role,
        avatarUrl: user.avatarUrl || null,
        location: user.location || null,
        phoneNumber: user.phoneNumber,
      });
    } catch (error) {
      logger.error('Error looking up user by phone:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create recovery session
  async createRecoverySession(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "A 'phoneNumber' must be provided." });
      }

      const user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(404).json({ error: `No user found with the phone number: ${phoneNumber}.` });
      }

      // In a real app, you would create a recovery session in the database
      // For now, we'll just return a mock response
      const sessionId = randomBytes(16).toString('hex');
      const recoverySecret = randomBytes(16).toString('hex');
      const recoveryQrValue = `damdoh:recover:${sessionId}:${recoverySecret}`;

      res.json({ sessionId, recoveryQrValue });
    } catch (error) {
      logger.error('Error creating recovery session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Scan recovery QR code
  async scanRecoveryQr(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { sessionId, scannedSecret } = req.body;
      if (!sessionId || !scannedSecret) {
        return res.status(400).json({ error: "Session ID and secret are required." });
      }

      // In a real app, you would check the recovery session in the database
      // For now, we'll just return a mock response
      res.json({ 
        success: true, 
        message: "Friend confirmation successful! The user can now proceed with their recovery.", 
        recoveryComplete: true 
      });
    } catch (error) {
      logger.error('Error scanning recovery QR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Complete recovery process
  async completeRecovery(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'A session ID is required.' });
      }

      // In a real app, you would check the recovery session in the database
      // For now, we'll just return a mock response
      res.json({ 
        success: true, 
        message: "Recovery completed successfully." 
      });
    } catch (error) {
      logger.error('Error completing recovery:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}