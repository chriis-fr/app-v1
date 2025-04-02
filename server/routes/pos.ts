import { Router } from 'express';
import { hasModuleAccess, hasRole } from '../auth';
import { POS, Customer, Transaction, Product } from '../mongodb/pos-models';
import { startSession } from 'mongoose';

const router = Router();

// Get all products
router.get('/products',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const products = await Product.find({
        organizationId: req.user.organizationId,
        status: 'available'
      }).sort({ name: 1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get all POS orders
router.get('/orders',
  hasModuleAccess('order_management'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const orders = await POS.find({
        organizationId: req.user.organizationId
      })
      .populate('customerId', 'name email')
      .populate('employeeId', 'firstName lastName')
      .populate('items.productId')
      .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Create new POS order
router.post('/orders',
  hasModuleAccess('order_management'),
  async (req, res) => {
    const session = await startSession();
    session.startTransaction();

    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const { items, customerId, paymentMethod, notes } = req.body;

      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice), 0);
      
      const tax = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice * item.taxRate), 0);
      
      const discount = items.reduce((sum: number, item: any) => 
        sum + item.discount, 0);
      
      const total = subtotal + tax - discount;

      // Create POS order
      const order = new POS({
        orderId: `POS-${Date.now()}`,
        items,
        subtotal,
        tax,
        discount,
        total,
        customerId,
        employeeId: req.user.id,
        paymentMethod,
        notes,
        organizationId: req.user.organizationId,
        status: 'pending',
        paymentStatus: 'pending'
      });

      await order.save({ session });

      // Update product stock levels
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock_quantity: -item.quantity } },
          { session }
        );
      }

      // Create transaction record
      const transaction = new Transaction({
        type: 'sale',
        amount: total,
        description: `POS Order ${order.orderId}`,
        reference: order.orderId,
        organizationId: req.user.organizationId,
        status: 'completed'
      });

      await transaction.save({ session });

      // Update customer's total purchases if customer exists
      if (customerId) {
        await Customer.findByIdAndUpdate(
          customerId,
          {
            $inc: { totalPurchases: total },
            lastPurchaseDate: new Date()
          },
          { session }
        );
      }

      await session.commitTransaction();
      res.status(201).json(order);
    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ message: 'Error creating order' });
    } finally {
      session.endSession();
    }
});

// Update order status
router.patch('/orders/:id/status',
  hasModuleAccess('order_management'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const order = await POS.findOneAndUpdate(
        {
          _id: req.params.id,
          organizationId: req.user.organizationId
        },
        {
          status: req.body.status,
          updated_at: new Date()
        },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error updating order status' });
    }
});

// Get POS transactions for a business
router.get('/transactions',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      
      const transactions = await Transaction.find({ 
        organizationId: req.user.organizationId 
      })
        .sort({ created_at: -1 })
        .limit(100);
        
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Create new POS transaction
router.post('/transaction',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      
      const transactionData = {
        ...req.body,
        organizationId: req.user.organizationId
      };
      
      const transaction = await Transaction.create(transactionData);
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error creating transaction' });
    }
});

export default router; 