import { Router, Request, Response } from 'express';
import { Contact } from '../models/contact.model';
import { hasRole } from '../auth';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';
import { AuthenticatedUser } from '../src/middleware/auth';
import { User as SelectUser } from '@shared/schema';

// Extend the Express Request type to include our user
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const router = Router();

// Validation schemas
const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  company: z.string().optional(),
  title: z.string().optional(),
  tags: z.array(z.string()),
  source: z.string().min(1),
  status: z.enum(['lead', 'customer', 'prospect']),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  walletAddress: z.string().optional(),
});

// Get all contacts with pagination and filters
router.get('/', hasRole(['admin', 'sales']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const tags = req.query.tags as string[];
    const search = req.query.search as string;

    const query: any = {};
    if (status) query.status = status;
    if (tags?.length) query.tags = { $in: tags };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const contacts = await Contact.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get a single contact
router.get('/:id', hasRole(['admin', 'sales']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create a new contact
router.post('/', hasRole(['admin', 'sales']), validateRequest(contactSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contact = new Contact({
      ...req.body,
      createdBy: req.user?.id,
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update a contact
router.put('/:id', hasRole(['admin', 'sales']), validateRequest(contactSchema.partial()), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?.id,
      },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete a contact
router.delete('/:id', hasRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Add tags to a contact
router.post('/:id/tags', hasRole(['admin', 'sales']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add tags' });
  }
});

// Remove tags from a contact
router.delete('/:id/tags', hasRole(['admin', 'sales']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $pullAll: { tags } },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove tags' });
  }
});

export default router; 