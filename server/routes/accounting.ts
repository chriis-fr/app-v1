import { Router } from 'express';
import { hasModuleAccess, hasRole } from '../auth';
import { Transaction, Invoice } from '../mongodb/models';

const router = Router();

// Get all transactions for an organization
router.get('/transactions', 
  hasModuleAccess('finance'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      const transactions = await Transaction.find({
        organizationId: req.user.organizationId
      }).sort({ createdAt: -1 });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Create new transaction
router.post('/transactions',
  hasModuleAccess('finance'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      const transaction = new Transaction({
        ...req.body,
        organizationId: req.user.organizationId
      });
      await transaction.save();
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error creating transaction' });
    }
});

// Get all invoices for an organization
router.get('/invoices',
  hasModuleAccess('finance'),
  hasRole(['admin', 'manager', 'employee']),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      const invoices = await Invoice.find({
        organizationId: req.user.organizationId
      }).sort({ createdAt: -1 });
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching invoices' });
    }
});

// Create new invoice
router.post('/invoices',
  hasModuleAccess('finance'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      const invoice = new Invoice({
        ...req.body,
        organizationId: req.user.organizationId
      });
      await invoice.save();
      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ message: 'Error creating invoice' });
    }
});

export default router; 