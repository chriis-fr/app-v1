import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import User, { UserDocument } from '../models/User';

const router = express.Router();

// Get user's own dependents
router.get('/dependents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('dependents maritalStatus dependentEntitlements');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      dependents: user.dependents || [],
      maritalStatus: user.maritalStatus,
      entitlements: user.dependentEntitlements
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dependents' });
  }
});

// Request to add a dependent
router.post('/dependents/request', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if adding dependent exceeds the limit
    const maxDependents = user.dependentPolicy?.maxDependents || 5;
    if ((user.dependents?.length || 0) >= maxDependents) {
      return res.status(400).json({ message: 'Maximum number of dependents reached' });
    }

    // Validate dependent age for children
    if (req.body.relationship === 'Child') {
      const maxChildAge = user.dependentPolicy?.maxChildAge || 18;
      const age = new Date().getFullYear() - new Date(req.body.dateOfBirth).getFullYear();
      if (age > maxChildAge) {
        return res.status(400).json({ message: 'Child exceeds maximum age limit' });
      }
    }

    // Add dependent with pending status
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          dependents: {
            ...req.body,
            status: 'Pending',
            lastVerifiedAt: new Date()
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error requesting dependent addition' });
  }
});

// Update own dependent information
router.put('/dependents/:dependentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        'dependents._id': req.params.dependentId
      },
      {
        $set: {
          'dependents.$': {
            ...req.body,
            status: 'Pending', // Set to pending for HR review
            lastVerifiedAt: new Date()
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User or dependent not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating dependent' });
  }
});

// Request to remove a dependent
router.delete('/dependents/:dependentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          dependents: { _id: req.params.dependentId }
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Dependent removal requested' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting dependent removal' });
  }
});

// Upload dependent document
router.post('/dependents/:dependentId/documents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        'dependents._id': req.params.dependentId
      },
      {
        $push: {
          'dependents.$.documents': {
            ...req.body,
            uploadedAt: new Date(),
            uploadedBy: req.user.id,
            status: 'Pending'
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User or dependent not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Update marital status
router.put('/marital-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          maritalStatus: req.body.maritalStatus
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating marital status' });
  }
});

// Get dependent entitlements
router.get('/dependent-entitlements', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('dependentEntitlements dependents maritalStatus');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      entitlements: user.dependentEntitlements,
      dependents: user.dependents,
      maritalStatus: user.maritalStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entitlements' });
  }
});

// Get dependent policy
router.get('/dependent-policy', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('dependentPolicy');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.dependentPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policy' });
  }
});

export default router; 