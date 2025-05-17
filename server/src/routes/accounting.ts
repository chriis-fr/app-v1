import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// Journal Entry schemas
const journalEntryLineSchema = z.object({
  accountId: z.string(),
  description: z.string(),
  debit: z.number().optional(),
  credit: z.number().optional(),
});

const journalEntrySchema = z.object({
  date: z.string(),
  reference: z.string(),
  description: z.string(),
  lines: z.array(journalEntryLineSchema),
});

// Chart of Account schemas
const accountSchema = z.object({
  code: z.string(),
  name: z.string(),
  type: z.enum(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
  parentId: z.string().optional(),
  description: z.string().optional(),
});

// Get all journal entries
router.get('/journal-entries', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        organizationId: req.user.organizationId,
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Create new journal entry
router.post('/journal-entries', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = journalEntrySchema.parse(req.body);
    
    // Validate that debits equal credits
    const totalDebits = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    
    if (totalDebits !== totalCredits) {
      return res.status(400).json({ error: 'Debits must equal credits' });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        date: new Date(data.date),
        reference: data.reference,
        description: data.description,
        organizationId: req.user.organizationId,
        createdById: req.user.id,
        lines: {
          create: data.lines.map(line => ({
            accountId: line.accountId,
            description: line.description,
            debit: line.debit || 0,
            credit: line.credit || 0,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    res.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Get chart of accounts
router.get('/accounts', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const accounts = await prisma.account.findMany({
      where: {
        organizationId: req.user.organizationId,
      },
      orderBy: [
        { code: 'asc' },
      ],
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Create new account
router.post('/accounts', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = accountSchema.parse(req.body);

    const account = await prisma.account.create({
      data: {
        ...data,
        organizationId: req.user.organizationId,
      },
    });

    res.json(account);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Get financial periods
router.get('/periods', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const periods = await prisma.financialPeriod.findMany({
      where: {
        organizationId: req.user.organizationId,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    res.json(periods);
  } catch (error) {
    console.error('Error fetching financial periods:', error);
    res.status(500).json({ error: 'Failed to fetch financial periods' });
  }
});

// Create new financial period
router.post('/periods', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { startDate, endDate, name } = req.body;

    const period = await prisma.financialPeriod.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        name,
        organizationId: req.user.organizationId,
      },
    });

    res.json(period);
  } catch (error) {
    console.error('Error creating financial period:', error);
    res.status(500).json({ error: 'Failed to create financial period' });
  }
});

// Get financial reports
router.get('/reports/:type', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    // Implement report generation logic based on type
    // This is a placeholder - actual implementation will depend on report type
    const report = {
      type,
      startDate,
      endDate,
      data: [], // Report data will be generated here
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router; 