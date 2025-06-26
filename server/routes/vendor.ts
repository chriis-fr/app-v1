import express, { Request, Response } from 'express';
import { Vendor } from '../mongodb/models/vendor';
import { vendorSchema } from '@shared/schema';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Get all vendors for the current user's organization
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const orgId = req.user.organizationId;
    const vendors = await Vendor.find({
      $or: [
        { organizationId: orgId },
        { clientOrganizations: orgId }
      ]
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
});

// Get a single vendor by ID (must belong to org)
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const orgId = req.user.organizationId;
    const vendor = await Vendor.findOne({
      _id: req.params.id,
      $or: [
        { organizationId: orgId },
        { clientOrganizations: orgId }
      ]
    });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vendor' });
  }
});

// Create a new vendor (org context)
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const orgId = req.user.organizationId;
    const parsed = vendorSchema.safeParse({ ...req.body, organizationId: orgId });
    if (!parsed.success) return res.status(400).json({ message: 'Invalid vendor data', errors: parsed.error.errors });
    const vendor = new Vendor({ ...parsed.data, organizationId: orgId });
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create vendor' });
  }
});

// Update a vendor (must belong to org)
router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const orgId = req.user.organizationId;
    const vendor = await Vendor.findOne({
      _id: req.params.id,
      $or: [
        { organizationId: orgId },
        { clientOrganizations: orgId }
      ]
    });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const parsed = vendorSchema.safeParse({ ...vendor.toObject(), ...req.body });
    if (!parsed.success) return res.status(400).json({ message: 'Invalid vendor data', errors: parsed.error.errors });
    Object.assign(vendor, parsed.data);
    await vendor.save();
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update vendor' });
  }
});

// Delete a vendor (must belong to org)
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const orgId = req.user.organizationId;
    const vendor = await Vendor.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { organizationId: orgId },
        { clientOrganizations: orgId }
      ]
    });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete vendor' });
  }
});

export default router; 