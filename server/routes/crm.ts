import { Router } from 'express';
import { hasModuleAccess, hasRole } from '../auth';
import { Customer, Transaction, Invoice } from '../mongodb/models';

const router = Router();

// Get all customers
router.get('/customers',
  hasModuleAccess('crm'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const customers = await Customer.find({
        organizationId: req.user.organizationId
      }).sort({ lastPurchaseDate: -1 });
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching customers' });
    }
});

// Create new customer
router.post('/customers',
  hasModuleAccess('crm'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const customer = new Customer({
        ...req.body,
        organizationId: req.user.organizationId
      });
      await customer.save();
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ message: 'Error creating customer' });
    }
});

// Get customer details with transaction history
router.get('/customers/:id',
  hasModuleAccess('crm'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const customer = await Customer.findOne({
        _id: req.params.id,
        organizationId: req.user.organizationId
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      // Get related transactions and invoices
      const [transactions, invoices] = await Promise.all([
        Transaction.find({
          organizationId: req.user.organizationId,
          'metadata.customerId': customer._id
        }).sort({ createdAt: -1 }).limit(10),
        Invoice.find({
          organizationId: req.user.organizationId,
          customerId: customer._id
        }).sort({ createdAt: -1 }).limit(10)
      ]);

      res.json({
        customer,
        transactions,
        invoices,
        analytics: {
          totalSpent: customer.totalPurchases,
          lastPurchase: customer.lastPurchaseDate,
          invoicesPending: invoices.filter(inv => inv.status === 'overdue').length
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching customer details' });
    }
});

// Update customer
router.patch('/customers/:id',
  hasModuleAccess('crm'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const customer = await Customer.findOneAndUpdate(
        {
          _id: req.params.id,
          organizationId: req.user.organizationId
        },
        {
          ...req.body,
          updatedAt: new Date()
        },
        { new: true }
      );
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: 'Error updating customer' });
    }
});

// Get customer insights
router.get('/insights',
  hasModuleAccess('crm'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const [
        totalCustomers,
        activeCustomers,
        topCustomers,
        recentTransactions
      ] = await Promise.all([
        Customer.countDocuments({ organizationId: req.user.organizationId }),
        Customer.countDocuments({
          organizationId: req.user.organizationId,
          status: 'active'
        }),
        Customer.find({
          organizationId: req.user.organizationId
        })
        .sort({ totalPurchases: -1 })
        .limit(5),
        Transaction.find({
          organizationId: req.user.organizationId,
          type: 'sale'
        })
        .sort({ createdAt: -1 })
        .limit(10)
      ]);

      res.json({
        metrics: {
          totalCustomers,
          activeCustomers,
          customerRetentionRate: (activeCustomers / totalCustomers * 100).toFixed(2)
        },
        topCustomers,
        recentTransactions
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching customer insights' });
    }
});

export default router; 