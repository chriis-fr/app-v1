import { Router, Request, Response } from 'express';
import { Lead, ILead } from '../models/lead.model';
import { Contact } from '../models/contact.model';
import { hasRole } from '../auth';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';
import { User as SelectUser } from '@shared/schema';
import { Types } from 'mongoose';

// Extend the Express Request type to include our user
interface AuthenticatedRequest extends Request {
  user?: SelectUser;
}

const router = Router();

// Validation schemas
const leadSchema = z.object({
  contact: z.string(),
  source: z.string().min(1),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  probability: z.number().min(0).max(100),
  expectedValue: z.number().min(0),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  lastContact: z.string().datetime().optional(),
  nextFollowUp: z.string().datetime().optional(),
  pipelineStage: z.string().min(1),
  customFields: z.record(z.any()).optional(),
  blockchainId: z.string().optional(),
});

// Get all leads with pagination and filters
router.get('/', hasRole(['admin', 'sales']), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const pipelineStage = req.query.pipelineStage as string;
    const assignedTo = req.query.assignedTo as string;
    const search = req.query.search as string;

    const query: any = {};
    if (status) query.status = status as ILead['status'];
    if (pipelineStage) query.pipelineStage = pipelineStage;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      const contacts = await Contact.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      query.contact = { $in: contacts.map(c => c._id) };
    }

    const leads = await Lead.find(query)
      .populate('contact')
      .populate('assignedTo', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get a single lead
router.get('/:id', hasRole(['admin', 'sales']), async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('contact')
      .populate('assignedTo', 'firstName lastName email');
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create a new lead
router.post('/', hasRole(['admin', 'sales']), validateRequest(leadSchema), async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findById(req.body.contact);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const lead = new Lead({
      ...req.body,
      createdBy: req.user?.id,
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update a lead
router.put('/:id', hasRole(['admin', 'sales']), validateRequest(leadSchema.partial()), async (req: Request, res: Response) => {
  try {
    if (req.body.contact) {
      const contact = await Contact.findById(req.body.contact);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?.id,
      },
      { new: true }
    ).populate('contact').populate('assignedTo', 'firstName lastName email');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete a lead
router.delete('/:id', hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Add interaction to a lead
router.post('/:id/interactions', hasRole(['admin', 'sales']), async (req: Request, res: Response) => {
  try {
    const { type, notes } = req.body;
    if (!type || !notes) {
      return res.status(400).json({ error: 'Type and notes are required' });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          interactions: {
            type,
            notes,
            date: new Date(),
          },
        },
        lastContact: new Date(),
      },
      { new: true }
    ).populate('contact').populate('assignedTo', 'firstName lastName email');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add interaction' });
  }
});

// Update lead status
router.patch('/:id/status', hasRole(['admin', 'sales']), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('contact').populate('assignedTo', 'firstName lastName email');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead status' });
  }
});

export default router; 