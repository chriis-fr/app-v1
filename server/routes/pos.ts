import { Router } from 'express';
import { hasModuleAccess, hasRole } from '../auth';
import { POS, Customer, Transaction } from '../mongodb/models';
import { startSession } from 'mongoose';

const router = Router();

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

      const { items, customerId, paymentMethod } = req.body;

      // Calculate total amount
      const totalAmount = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice), 0);

      // Create POS order
      const order = new POS({
        orderId: `POS-${Date.now()}`,
        items,
        totalAmount,
        customerId,
        employeeId: req.user.id,
        paymentMethod,
        organizationId: req.user.organizationId,
        status: 'pending'
      });

      await order.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        type: 'sale',
        amount: totalAmount,
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
            $inc: { totalPurchases: totalAmount },
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
          updatedAt: new Date()
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
router.get('/transactions', async (req, res) => {
  const businessId = req.headers['x-business-id'];
  
  const transactions = await Transaction.find({ businessId })
    .sort({ createdAt: -1 })
    .limit(100);
    
  res.json(transactions);
});

// Create new POS transaction
router.post('/transaction', async (req, res) => {
  const businessId = req.headers['x-business-id'];
  const transactionData = req.body;
  
  const transaction = await Transaction.create({
    ...transactionData,
    businessId
  });
  
  res.json(transaction);
});

export default router; 